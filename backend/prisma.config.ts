import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 moves connection URLs out of schema.prisma. Migrate/introspect read
// the datasource from here; runtime queries use the pg adapter in PrismaService.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'ts-node prisma/seed.ts',
  },
});
