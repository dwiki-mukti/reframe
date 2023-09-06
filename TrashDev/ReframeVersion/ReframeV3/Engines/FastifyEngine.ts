/**
 * import package
 */
import fastify, { FastifyRegister, FastifyReply, FastifyRequest } from 'fastify'
import { IHttpMethod, IReframeHandler, IReframeRequest, IReframeResponse, IReframeValidations } from "@/Reframe"
import { ReplaceReturnType, isArray, isObject } from '@/Utils'



/**
 * type declaration
 */
declare module "fastify" {
    interface FastifyRequest {
        auth: any
    }
}
type IResultSubValidator = {
    data?: Record<string, any>,
    invalid?: Record<string, any>
}



/**
 * init package 
 */
const server = fastify()
server.decorateRequest('auth', null)



/**
 * Validator
 */
function subValidator(
    fieldName: any,
    request: any,
    rule: any,
    mutator?: { prefix?: string, suffix?: string }
): IResultSubValidator {
    // Declare result var
    let dataResult: Record<string, any> = {}
    let invalidResult: Record<string, any> = {}


    // Proccess validating
    if (rule.object) {
        // Validating data object
        if (!isObject(request)) {
            invalidResult[fieldName] = [`must a json!`]
        } else {
            for (const [keyObject, valueObject] of Object.entries(request)) {
                // declare var
                const currentFieldName = `${fieldName}.${keyObject}`


                // validate key & value object
                const validateKey = subValidator(currentFieldName, keyObject, rule.ruleKey, { prefix: 'key object' })
                const validateValue = subValidator(currentFieldName, valueObject, rule.ruleValue, { prefix: 'value object' })


                // inject invalid result
                invalidResult = {
                    ...invalidResult,
                    ...(validateValue?.invalid ?? {})
                }
                const invalidObjects = [
                    ...(validateKey?.invalid?.[currentFieldName] ?? []),
                    ...(validateValue?.invalid?.[currentFieldName] ?? [])
                ]
                if (invalidObjects.length) {
                    invalidResult[currentFieldName] = invalidObjects
                }

                // inject data result
                if (!Object.keys(invalidResult).length) {
                    dataResult[fieldName] = {
                        ...(dataResult[fieldName] ?? {}),
                        [keyObject]: valueObject
                    }
                }
            }
        }
    } else if (rule.array) {
        // Validating data array
        if (!isArray(request)) {
            invalidResult[fieldName] = [`must an array!`]
        } else {
            (request as Array<any>).forEach((itemArray, keyArray) => {
                const { invalid } = subValidator(`${fieldName}[${keyArray}]`, itemArray, rule.ruleValue)

                if (Object.keys(invalid ?? {})?.length) {
                    invalidResult = { ...invalidResult, ...(invalid) }
                } else {
                    dataResult[fieldName] = [
                        ...(dataResult[fieldName] ?? []),
                        itemArray
                    ]
                }
            });
        }
    } else {
        // Validating single data
        const messages: string[] = []

        if (rule.includes('required') && !request) {
            // return invalid required data
            messages.push(`${mutator?.prefix ?? 'data'} is required ${mutator?.suffix ?? '!'}`)
        } else if (rule.includes('string') && (typeof (request) != 'string')) {
            // return invalid type string
            messages.push(`${mutator?.prefix ?? 'data'} must a string ${mutator?.suffix ?? '!'}`)
        } else if (rule.includes('number') && isNaN(request)) {
            // return invalid type string
            messages.push(`${mutator?.prefix ?? 'data'} must a number ${mutator?.suffix ?? '!'}`)
        }

        if (messages.length) {
            invalidResult[fieldName] = messages
        } else {
            dataResult[fieldName] = request
        }
    }


    // Prepare result & returning data
    let results: IResultSubValidator = {}
    if (Object.keys(invalidResult).length) {
        results.invalid = invalidResult
    } else {
        results.data = dataResult
    }
    return results
}
function validator(req: Record<string, any>, res: FastifyReply) {
    return async (validations: IReframeValidations, onFailed?: (invalidMessage: Record<string, any[]>) => any) => {
        let dataValidateds: any = {}
        let invalids = {}


        for (const [fieldName, rule] of Object.entries(validations)) {
            const { data, invalid } = subValidator(fieldName, req?.[fieldName], rule)

            invalids = { ...invalids, ...invalid }
            dataValidateds = { ...dataValidateds, ...data }
        }


        if (Object.keys(invalids).length) {
            if (onFailed) onFailed(invalids)
            return res.status(422).send(invalids)
        } else {
            return dataValidateds
        }
    }
}



/**
 * adaptor request
 */
function ReframeRequest(req: FastifyRequest, res: FastifyReply): IReframeRequest {
    return {
        body: req.body,
        params: req.params,
        headers: req.headers,
        url: req.url,
        query: req.query,
        auth: req.auth,
        validate: validator(req.body, res),
    }
}


/**
 * adaptor response
 */
class ReframeResponse {
    constructor(res: FastifyReply) {
        this.res = res
    }

    public res: FastifyReply

    public json(data: Record<string, any>) {
        return this.res.send(data)
    }

    public status(status: number) {
        return this.res.status(status)
    }
}



/**
 * declare main class
 */
class FastifyReframer {
    private request = {}
    private response = {}
    private server = fastify()
    private stringPrefix = ''
    private modules = []
    private middlewareHandlers: IReframeHandler[] = []


    public plugin: ReplaceReturnType<FastifyRegister, this> = (plugin, opts) => {
        this.server.register(plugin, opts)
        return this
    }


    protected prefix(prefix: string) {
        this.stringPrefix = prefix
        return this
    }


    protected middleware(middlewareHandlers: IReframeHandler[]) {
        this.middlewareHandlers = [...(this.middlewareHandlers), ...middlewareHandlers]
        return this
    }


    protected module(controllers: (new () => any)[]) {
        this.modules = [...(this.modules), ...controllers]
        return this
    }


    protected start(params?: { port?: number }) {
        this.server.register((serverApp, serverOptions, serverDone) => {
            serverApp.addHook('preHandler', (request, reply, reframeHttpDone) => {
                // Reframing http request & response
                this.request = ReframeRequest(request, reply)
                this.response = new ReframeResponse(reply)

                // Inject middleware
                for (const middleware of this.middlewareHandlers) {
                    middleware({ request: (this.request as IReframeRequest), response: (this.response as IReframeResponse) })
                }

                return reframeHttpDone()
            })



            /**
             * Inject module
             */
            for (const Controller of this.modules) {
                const instance = new Controller
                const propertyKeys = Reflect.ownKeys(Controller.prototype)
                const prefix: string = Reflect.getMetadata('prefix', instance) ?? ''
                const middlewares: Function[] = Reflect.getMetadata('middlewares', instance)


                /**
                 * Injecting module
                 */
                serverApp.register((moduleApp, moduleOptions, doneModule) => {
                    /**
                     * Inject middleware module.
                     */
                    for (const middleware of (middlewares ?? [])) {
                        moduleApp.addHook('preHandler', (req, rep, doneMiddleware) => {
                            middleware({ request: this.request, response: this.response })
                            return doneMiddleware()
                        })
                    }


                    /**
                     * Inject handler module.
                     */
                    for (const propertyKey of propertyKeys) {
                        const path: string = Reflect.getMetadata('path', instance, propertyKey)
                        const method: IHttpMethod = Reflect.getMetadata('method', instance, propertyKey)
                        const handler = instance[propertyKey]

                        /**
                         * Injecting route-handler to app.
                         */
                        if (path && moduleApp[method] && handler) {
                            moduleApp[method](path, (request, reply) => {
                                return handler({ request: this.request, response: this.response })
                            })
                        }
                    }
                    return doneModule()
                }, { prefix })
            }

            serverDone()
        }, { prefix: this.stringPrefix })


        /**
         * start server
         */
        this.server.listen({
            port: params?.port ?? 8000
        }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
        })
    }
}
export default (new FastifyReframer)