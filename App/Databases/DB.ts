import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from 'dotenv';
import Schemas from './Schemas';



/**
 * Instance package 
 */
config()



/**
 * Setup var
 */
let dialect;
const {
  DB_CONNECTION,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE
} = process.env



/**
 * Select connection
 */
switch (DB_CONNECTION) {
  default:
    dialect = new PostgresDialect({
      pool: new Pool({
        host: DB_HOST,
        port: Number(DB_PORT),
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_DATABASE
      }),
    })
    break;
}



/**
 * Connect To DB
 */
export default new Kysely<Schemas>({
  dialect,
});
