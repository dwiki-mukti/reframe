const fs = require('fs')
const path = require('path')

async function handler(tableName) {
    fs.readFile('reframe/providers/prompts/migration/prototype.ts', { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;

        // declare var
        tableName = tableName.replace(/[^a-zA-Z0-9 -_]/g, '').replaceAll('-', '_')
            .replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "_" : "") + $.toLowerCase())
        const destinationDir = path.join(__dirname, '../../../../app/Databases/Migrations');
        const destinationFile = `${destinationDir}/${Date.now().toString()}_${tableName}.ts`

        // edit value file
        var newFile = data.replaceAll('NameTable', tableName)

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

exports.makeMigration = handler
exports.call = function (program) {
    program
        .command('make:migration')
        .argument('<name>')
        .description(
            'Make a new migration',
        )
        .action(async (tableName) => {
            await handler(tableName)
            process.exit
        })
}