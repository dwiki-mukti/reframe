/**
 * import package
 */
import fastify from 'fastify'
import { IMetaReframe, IOptionStartEngine } from "@/Reframe"
import { IReframeRequest, IReframeResponse } from '../../decorator'
import reframeRequest from './reframeRequest'
import reframeResponse from './reframeResponse'



/**
 * init package 
 */
const server = fastify()
declare module "fastify" {
    interface FastifyRequest {
        auth: any
    }
}
server.decorateRequest('auth', null)


/**
 * declare main class
 */
class FastifyEngine {
    private request: IReframeRequest
    private response: IReframeResponse
    private server = server
    private meta: IMetaReframe


    constructor(meta: IMetaReframe, options: IOptionStartEngine) {
        this.meta = meta
        this.start(options)
    }


    protected start(options: IOptionStartEngine) {
        this.server.register((serverApp, serverOptions, serverDone) => {
            /**
             * Inject global middleware
             */
            serverApp.addHook('preHandler', (requestPreHandler, replyPreHandler, donePreHandler) => {
                this.request = reframeRequest(requestPreHandler, replyPreHandler)
                this.response = reframeResponse(replyPreHandler)
                for (const middleware of this.meta.middlewares) {
                    middleware({ request: (this.request as IReframeRequest), response: (this.response as IReframeResponse) })
                }
                return donePreHandler()
            })



            /**
             * Inject controller
             */
            for (const controller of this.meta.controllers) {
                serverApp.register((moduleApp, moduleOptions, doneModule) => {
                    /**
                     * Inject middleware controller.
                     */
                    for (const middleware of (controller.middlewares ?? [])) {
                        moduleApp.addHook('preHandler', (req, rep, doneMiddleware) => {
                            middleware({ request: this.request, response: this.response })
                            return doneMiddleware()
                        })
                    }


                    /**
                     * Inject route handler.
                     */
                    for (const routeHandler of (controller.routeHandlers ?? [])) {
                        moduleApp[routeHandler.htttpMethod ?? 'get'](routeHandler.route ?? '/', (request, reply) => {
                            return routeHandler.handler({ request: this.request, response: this.response })
                        })
                    }
                    return doneModule()
                }, { prefix: controller?.prefix ?? '' })
            }

            serverDone()
        }, { prefix: options?.prefix ?? '' })


        /**
         * start server
         */
        this.server.listen({
            port: options?.port ?? 8000
        }, (err, address) => {
            if (err) {
                console.error(err)
                process.exit(1)
            }
            console.log(`Server listening at ${address}`)
        })
    }
}
export default function (meta: IMetaReframe, options: IOptionStartEngine) {
    return new FastifyEngine(meta, options)
}