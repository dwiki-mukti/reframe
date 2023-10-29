module.exports = function (program) {
    program
        .command('make:schema')
        .argument('<name>')
        .description(
            'Make a new schema',
        )
        .action(async (name) => {
            console.log({ name });
            process.exit
        })
}