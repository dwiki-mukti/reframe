/**
 * 
 * Migrator With Commander to Build CLI
 */

import * as path from 'path'
import { promises as fs, lstatSync, mkdirSync, writeFileSync } from 'fs'
import {
  Migrator,
  FileMigrationProvider,
  MigrationResultSet,
  NO_MIGRATIONS,
} from 'kysely'
import { program } from 'commander'
import DB from '../DB'


function showResults({ error, results }: MigrationResultSet) {
  if (results) {
    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was executed successfully`)
      } else if (it.status === 'Error') {
        console.error(`failed to execute migration "${it.migrationName}"`)
      }
    })
  }

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }
}

const migrator = new Migrator({
  db: DB,
  provider: new FileMigrationProvider({
    fs,
    path,
    // This needs to be an absolute path.
    migrationFolder: path.join(__dirname, './Migrations'),
  }),
})

const TEMPLATE = `import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {

}

export async function down(db: Kysely<any>): Promise<void> {

}
`

async function run(pathFolder: string = path.join(__dirname, './Migrations')) {
  program
    .command('up')
    .description('Run a pending migration if any')
    .action(async () => {
      console.log('Running single migration')
      const results = await migrator.migrateUp()
      showResults(results)
    })

  program
    .command('down')
    .description('Revert the latest migration with a down file')
    .action(async () => {
      console.log('Reverting Migrations')
      const results = await migrator.migrateDown()
      showResults(results)
    })

  program
    .command('redo')
    .description('Down and Up')
    .action(async () => {
      console.log('Reverting Migrations')
      let results = await migrator.migrateDown()
      showResults(results)
      console.log('Running single migration')
      results = await migrator.migrateUp()
      showResults(results)
    })

  program
    .command('latest')
    .description('Run all pending Migrations')
    .action(async () => {
      console.log('Running Migrations')
      const results = await migrator.migrateToLatest()
      showResults(results)
    })

  program
    .command('down-to')
    .argument('<migration-name>')
    .description('Migrates down to the specified migration name. Specify "NO_MIGRATIONS" to migrate all the way down.')
    .action(async (name) => {
      let results: MigrationResultSet

      if (name === 'NO_MIGRATIONS') {
        console.log(`Migrating all the way down`)
        results = await migrator.migrateTo(NO_MIGRATIONS)
      } else {
        console.log(`Migrating down to ${name}`)
        results = await migrator.migrateTo(name)
      }
      showResults(results)
    })

  program
    .command('create')
    .argument('<input-file>')
    .description(
      'Create a new migration with the given description, and the current time as the version',
    )
    .action(async (name) => {
      const dateStr = Date.now()
      const fileName = `${pathFolder}/${dateStr}_${name}.ts`
      const mkdir = () => mkdirSync(`${pathFolder}`)
      try {
        if (!lstatSync(`${pathFolder}`).isDirectory()) {
          mkdir()
        }
      } catch {
        mkdirSync(`${pathFolder}`)
      }
      writeFileSync(fileName, TEMPLATE, 'utf8')
      console.log('Created Migration:', fileName)
    })

  program.parseAsync().then(() => DB.destroy())
}

run()