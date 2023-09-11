import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './Database';
import { Pool } from 'pg';
import { config } from 'dotenv';

config()

/** Connect To DB */
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
