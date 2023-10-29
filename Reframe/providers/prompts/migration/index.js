module.exports = function (program) {
    program
        .command('make:migration')
        .argument('<name>')
        .description(
            'Make a new migration',
        )
        .action(async (name) => {
            console.log({ name });
            process.exit
        })
}