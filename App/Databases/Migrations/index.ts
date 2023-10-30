import DB from "../DB";
import * as path from 'path'
import * as fs from 'fs'
import {
    Migrator,
    FileMigrationProvider,
    MigrationResultSet,
} from 'kysely'


const migrator = new Migrator({
    db: DB,
    provider: new FileMigrationProvider({
        fs: fs.promises,
        path,
        migrationFolder: path.join(__dirname),
    }),
})

const showResults = ({ error, results }: MigrationResultSet) => {
    if (error) {
        console.error(error)
        process.exit(1)
    } else {
        results?.forEach(({ status, migrationName }) => {
            if (status === 'Success') {
                console.log(`Migration "${migrationName}" was executed successfully`)
            } else if (status === 'Error') {
                console.error(`Failed to execute migration "${migrationName}"`)
            }
        })
    }
    DB.destroy()
    process.exit(1)
}

switch (process.argv[2] ?? null) {
    case 'up':
        console.log('Up current migration')
        migrator.migrateUp().then(showResults)
        break;
    case 'down':
        console.log('Revert the latest migration with a down file');
        migrator.migrateDown().then(showResults)
        break;
    case 'latest':
        console.log('Run all pending Migrations');
        migrator.migrateToLatest().then(showResults)
        break;
    default:
        console.log('');
        console.log('Commands:');
        console.log(`   migrate up          Up current migration`);
        console.log(`   migrate down        Revert the latest migration with a down file`);
        console.log(`   migrate latest      Run all pending Migrations`);
        console.log('');
        console.log('');
        break;
}