import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const dbUrl = process.env.DATABASE_URL;

console.log(
  "DATABASE_URL exists:",
  !!dbUrl
);

console.log(
  "DATABASE_URL starts with:",
  dbUrl?.substring(0, 38)
);

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
