/**
 * 
 * Commander to Build CLI
 */

import * as path from 'path'
import { promises as fs, lstatSync, mkdirSync, writeFileSync } from 'fs'
import { program } from 'commander'

/**
 * 
 * Template Controller
 */
function templateController(name:string) {
  
  const TEMPLATE = `import { Controller, Get, IReframeHandlerParams, Post } from "@/Reframe";

@Controller()
export default class ${name}Controller {
    @Get()
    async index({ response }: IReframeHandlerParams) {
        return response.json({
            ping: 'pong'
        })
    }  
}
  `
  
  return TEMPLATE
}


/**
 * 
 * Template Service
 */
function templateService(name:string) {
  
  const TEMPLATE = `
  // Service File    
  `
  
  return TEMPLATE
}

async function run(pathFolder: string = path.join(__dirname, '../App')) {
  program
    .command('make')
    .argument('<module>')
    .argument('<name>')
    .description(
      'Create a new controller or service',
    )
    .action(async (module, name) => {
      const rename = name.replace(/^./, name[0].toUpperCase())
      if (module == 'controller') {
        const fileName = `${pathFolder}/Controllers/${rename}Controller.ts`
        const mkdir = () => mkdirSync(`${pathFolder}/Controllers`)
        try {
            if (!lstatSync(`${pathFolder}/Controllers`).isDirectory()) {
            mkdir()
            }
        } catch {
            mkdirSync(`${pathFolder}/Controllers`)
        }
        writeFileSync(fileName, templateController(rename), 'utf8')
        console.log('Created Controller:', fileName)      
      }
      else if (module == 'service') {
        const fileName = `${pathFolder}/Services/${rename}Service.ts`
        const mkdir = () => mkdirSync(`${pathFolder}/Services`)
        try {
            if (!lstatSync(`${pathFolder}/Services`).isDirectory()) {
            mkdir()
            }
        } catch {
            mkdirSync(`${pathFolder}/Services`)
        }
        writeFileSync(fileName, templateController(rename), 'utf8')
        console.log('Created Service:', fileName)        
      }
      else {
        process.exit
      }
    })

  program.parseAsync()
}

run()