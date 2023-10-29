module.exports = function (program) {
    program
        .command('make:service')
        .argument('<name>')
        .description(
            'Make a new service',
        )
        .action(async (name) => {
            console.log({ name });
            process.exit
        })
}