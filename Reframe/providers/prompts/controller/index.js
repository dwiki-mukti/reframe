const path = require('path')
const { lstatSync, mkdirSync, writeFileSync } = require('fs')

module.exports = function (program) {
    program
        .command('make:controller')
        .argument('<name>')
        .description(
            'Make a new controller',
        )
        .action(async (name) => {
            console.log({ name });
            process.exit
        })
}