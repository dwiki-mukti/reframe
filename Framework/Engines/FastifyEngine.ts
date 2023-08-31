/**
 * import package
 */
import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import { IHttpMethod, IReframeRequest } from "@/Framework/Core"



/**
 * type declaration
 */
declare module "fastify" {
    interface FastifyRequest {
        auth: any
    }
}



/**
 * init package 
 */
const server = fastify()
server.decorateRequest('auth', null)



/**
 * adaptor request
 */
function ReframeRequest(req: FastifyRequest): IReframeRequest {
    return {
        body: req.body,
        params: req.params,
        headers: req.headers,
        url: req.url,
        query: req.query,
        auth: req.auth,
        validate: () => {
            // !!! TODO: make request validator !!!
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
class ReframeInstance {
    constructor() { }
    private server = fastify()
    private request = {}
    private response = {}

    register(params: any) {
        this.server.register(params)
        return this
    }


    factory(controllers: (new () => any)[]) {
        for (const Controller of controllers) {
            const instance = new Controller
            const propertyKeys = Reflect.ownKeys(Controller.prototype)
            const prefix: string = Reflect.getMetadata('prefix', instance) ?? ''
            const middlewares: Function[] = Reflect.getMetadata('middlewares', instance)


            /**
             * Assign props request & reply
             */
            this.server.addHook('preHandler', (request, reply, done) => {
                this.request = ReframeRequest(request)
                this.response = new ReframeResponse(reply)
                return done()
            })


            /**
             * Register class controller.
             */
            this.server.register((appModule, options, doneAppModule) => {
                /**
                 * Inject middleware to app.
                 */
                for (const middleware of (middlewares ?? [])) {
                    appModule.addHook('preHandler', (request, reply, doneMiddleware) => {
                        middleware({ request: this.request, response: this.response })
                        return doneMiddleware()
                    })
                }


                /**
                 * Inject route-handler to app.
                 */
                for (const propertyKey of propertyKeys) {
                    const path: string = Reflect.getMetadata('path', instance, propertyKey)
                    const method: IHttpMethod = Reflect.getMetadata('method', instance, propertyKey)
                    const handler = instance[propertyKey]

                    /**
                     * Injecting route-handler to app.
                     */
                    if (path && method && handler) {
                        appModule[method](path, (request, reply) => {
                            return handler({ request: this.request, response: this.response })
                        })
                    }
                }
                return doneAppModule()
            }, { prefix })
        }
        return this
    }



    start(params?: { port?: number }) {
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
export const Reframe = (new ReframeInstance)