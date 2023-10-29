/**
 * import package
 */
import fastify, { FastifyRegister, FastifyReply, FastifyRequest } from 'fastify'
import { IHttpMethod, IReframeHandler, IReframeRequest, IReframeResponse } from "@/Reframe"
import { ReplaceReturnType } from '@/utils'
import { IValidations, validator } from '../validator'



/**
 * init package 
 */
const server = fastify()
server.decorateRequest('auth', null)



/**
 * type declaration
 */
declare module "fastify" {
    interface FastifyRequest {
        auth: any
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
        validate: (
            validations: Record<string, IValidations>,
            onInvalid?: (invalidMessage: Record<string, any[]>) => any
        ) => {
            const { invalids, data } = validator({ request: req.body, validations })
            if (Object.keys(invalids ?? {}).length) {
                if (onInvalid) onInvalid(invalids)
                return res.status(422).send(invalids)
            } else {
                return data
            }
        }
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