import { Kysely, sql } from 'kysely'
const table = 'NameTable';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable(table)
        .addColumn('id', 'serial', (col) => col.primaryKey())
        .addColumn('created_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull()
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`)
        )
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable(table).execute()
}