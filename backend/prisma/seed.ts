import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create roles
  const roles = [
    { name: 'ADMIN', description: 'System Administrator with full access' },
    { name: 'DISPATCHER', description: 'Fleet Dispatcher managing runs and drivers' },
    { name: 'DRIVER', description: 'Fleet Driver performing transport operations' },
  ];

  const dbRoles: Role[] = [];
  for (const role of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    dbRoles.push(dbRole);
    console.log(`Role ${role.name} seeded successfully.`);
  }

  // Check if admin user already exists
  const adminEmail = 'admin@fms.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('AdminPassword123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Administrator',
        isActive: true,
      },
    });

    const adminRole = dbRoles.find((r) => r.name === 'ADMIN');
    if (adminRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });
    }

    console.log('Default administrator user seeded successfully.');
  } else {
    console.log('Default administrator user already exists.');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
