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

  // Seed (or update) the default administrator account.
  const adminEmail = 'admin@fleetos.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
    },
  });

  const adminRole = dbRoles.find((r) => r.name === 'ADMIN');
  if (adminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: adminUser.id, roleId: adminRole.id },
      },
      update: {},
      create: { userId: adminUser.id, roleId: adminRole.id },
    });
  }

  console.log(`Administrator account ready: ${adminEmail}`);

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
