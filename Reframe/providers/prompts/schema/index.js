const fs = require('fs')
const path = require('path');
const { makeMigration } = require('../migration');

async function handler(schemaName) {
    fs.readFile('reframe/providers/prompts/schema/prototype.ts', { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;

        // declare var
        schemaName = schemaName.replace(/((^|[-_])([a-zA-Z]))/g, (group) =>
            group.toUpperCase().replace('-', '').replace('_', '')
        );
        const destinationDir = path.join(__dirname, '../../../../app/Databases/Schemas');
        const destinationFile = `${destinationDir}/${schemaName}.ts`

        // edit value file
        var newFile = data.replaceAll('NameSchema', schemaName)

        // make dir
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir)
        }

        // write new file
        fs.writeFile(destinationFile, newFile, { encoding: 'utf-8' }, (err) => {
            if (err) throw err;
            console.error(`Success create file ${destinationFile}`);
        });
    });
}

exports.makeSchema = handler
exports.call = function (program) {
    program
        .command('make:schema')
        .argument('<name>')
        .option('-m, --migration', 'With make migration')
        .description(
            'Make a new schema',
        )
        .action(async (schemaName, options) => {
            await handler(schemaName)
            if (options?.migration) {
                await makeMigration(schemaName)
            }
            process.exit
        })
}