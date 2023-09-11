import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  /** Create Table & Index */
  await db.schema
    .createTable('person')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('first_name', 'varchar', (col) => col.notNull())
    .addColumn('last_name', 'varchar')
    .addColumn('gender', 'varchar(50)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createTable('pet')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar', (col) => col.notNull().unique())
    .addColumn('owner_id', 'integer', (col) =>
      col.references('person.id').onDelete('cascade').notNull()
    )
    .addColumn('species', 'varchar', (col) => col.notNull())
    .execute()
    
  await db.schema
    .createIndex('pet_owner_id_index')
    .on('pet')
    .column('owner_id')
    .execute()
    
  /** Seeder */  
  await db
    .insertInto('person')
    .values([{
        first_name: 'Jennifer',
        last_name: 'Aniston',
        gender: 'woman',
    }, {
        first_name: 'Arnold',
        last_name: 'Schwarzenegger',
        gender: 'man',
    }])
    .execute()

  await db
    .insertInto('pet')
    .values([{
        name: 'Haciko',
        owner_id: 1,
        species: 'Cat'
    },{
        name: 'Hacibi',
        owner_id: 2,
        species: 'Dog'
    },{
        name: 'Gemoy',
        owner_id: 1,
        species: 'Cat'
    }])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    /** Drop Table */
    await db.schema.dropTable('pet').execute()
    await db.schema.dropTable('person').execute()
}
