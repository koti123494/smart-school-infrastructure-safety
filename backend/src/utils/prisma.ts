import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env } from '../config/env.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });