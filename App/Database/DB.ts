import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from 'dotenv';
import Schema from './Schema';



/**
 * Instance package 
 */
config()



/**
 * Connect To DB
 */
export default new Kysely<Schema>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
});
