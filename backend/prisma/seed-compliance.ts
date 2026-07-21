import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Upsert COMPLIANCE_MANAGER role
  const complianceRole = await prisma.role.upsert({
    where: { name: 'COMPLIANCE_MANAGER' },
    update: { description: 'Compliance Manager overseeing regulatory compliance, challans, insurance and incidents' },
    create: { name: 'COMPLIANCE_MANAGER', description: 'Compliance Manager overseeing regulatory compliance, challans, insurance and incidents' },
  });
  console.log('Role COMPLIANCE_MANAGER ready.');

  // Upsert compliance manager user
  const complianceUser = await prisma.user.upsert({
    where: { email: 'compliance@fleetos.com' },
    update: { password: hashedPassword, isActive: true },
    create: {
      email: 'compliance@fleetos.com',
      password: hashedPassword,
      firstName: 'Compliance',
      lastName: 'Manager',
      isActive: true,
    },
  });

  // Assign role to user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: complianceUser.id, roleId: complianceRole.id },
    },
    update: {},
    create: { userId: complianceUser.id, roleId: complianceRole.id },
  });

  console.log('Compliance Manager account ready: compliance@fleetos.com');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
