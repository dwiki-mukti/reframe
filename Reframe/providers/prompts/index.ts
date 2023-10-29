import { program } from 'commander'


export default function promptLoader() {
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

    program.parseAsync()
}