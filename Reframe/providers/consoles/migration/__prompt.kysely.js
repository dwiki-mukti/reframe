/**
 * !!!! UNUSED !!!!
 * This file gonna destroy.
 */
require('dotenv').config()
const path = require('path')
const { Migrator, FileMigrationProvider, Kysely, PostgresDialect } = require('kysely')
const { Pool } = require('pg');
const fs = require('fs')

const DB = new Kysely({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
});


const migrator = new Migrator({
    db: DB,
    provider: new FileMigrationProvider({
        fs: fs.promises,
        path,
        migrationFolder: path.join(__dirname, '../../../../app/Databases/Migrations'),
    }),
})


exports.call = function (program) {
    const showResults = ({ error, results }) => {
        if (error) {
            console.error(error)
            process.exit(1)
        } else {
            results?.forEach((it) => {
                if (it.status === 'Success') {
                    console.log(`migration "${it.migrationName}" was executed successfully`)
                } else if (it.status === 'Error') {
                    console.error(`failed to execute migration "${it.migrationName}"`)
                }
            })
        }
        program.parseAsync().then(() => DB.destroy())
    }

    program
        .command('migrate:up')
        .description('Up current migration')
        .action(async () => {
            console.log('Running single migration')
            const results = await migrator.migrateUp()
            showResults(results)
            process.exit
        })

    program
        .command('migrate:down')
        .description('Revert the latest migration with a down file')
        .action(async () => {
            console.log('Reverting Migrations')
            const results = await migrator.migrateDown()
            showResults(results)
        })

    program
        .command('migrate:redo')
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
        .command('migrate:latest')
        .description('Run all pending Migrations')
        .action(async () => {
            console.log('Running Migrations')
            const results = await migrator.migrateToLatest()
            showResults(results)
        })
}