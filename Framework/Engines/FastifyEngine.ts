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
 * Validator
 */
function validator(validations_: Record<string, any>) {
    const data = {
        username: 'dwiki@email.com',
        password: 'pass',
        phone: ['0852282828', '08182883445'],
        absensi: {
            2121212: 'H',
            3212313: 'I',
            1231321: 'H'
        },
        hobies: {
            sports: ['renang', 'jogging'],
            arts: []
        },
    }
    const validations = {
        username: ['string', 'required', 'exists:users,username,$userId'],
        password: ['string', 'min:18', 'required'],
        phone: {
            array: ['required', 'length:5'],
            valueRule: ['number']
        },
        absensi: {
            object: ['required'],
            keyRule: ['string'],
            valueRule: ['number']
        },
        hobies: {
            object: ['required'],
            keyRule: ['enum:sports,arts'],
            valueRule: {
                array: ['required', 'length:3'],
                valueRule: ['enum:renang,jogging,panahan,basket']
            }
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
        validate: () => { } //validator
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
        /**
         * Assign props request & reply
         */
        this.server.addHook('preHandler', (request, reply, done) => {
            this.request = ReframeRequest(request, reply)
            this.response = new ReframeResponse(reply)
            return done()
        })


        for (const Controller of controllers) {
            const instance = new Controller
            const propertyKeys = Reflect.ownKeys(Controller.prototype)
            const prefix: string = Reflect.getMetadata('prefix', instance) ?? ''
            const middlewares: Function[] = Reflect.getMetadata('middlewares', instance)


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
                    if (path && appModule[method] && handler) {
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