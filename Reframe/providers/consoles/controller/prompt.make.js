const fs = require('fs')
const path = require('path')

async function handler(name) {
    fs.readFile('reframe/providers/consoles/controller/stub.controller.ts', { encoding: 'utf-8' }, (err, data) => {
        if (err) throw err;

        // declare var
        name = String(name).replace(/Controller$/, "").replace(/^./, (group) => group.toUpperCase())
        const controllerName = `${name}Controller`;
        const destinationDir = path.join(__dirname, '../../../../app/Controllers', name);
        const destinationFile = `${destinationDir}/${controllerName}.ts`

        // edit value file
        var newFile = data.replaceAll('NameController', controllerName)
            .replaceAll('NameRoute', name.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()))

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

exports.makeController = handler
exports.call = function (program) {
    program
        .command('make:controller')
        .argument('<name>')
        .description(
            'Make a new controller',
        )
        .action(async (name) => {
            await handler(name)
            process.exit
        })
}