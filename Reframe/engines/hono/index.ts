/**
 * import package
 */
import { Context, Hono, Next } from "hono"
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { IReframeRequest, IReframeResponse } from "@/Reframe/providers/decorator"
import { IMetaReframe, IOptionStartEngine } from "@/Reframe"
import reframeRequest from "./reframeRequest"
import reframeResponse from "./reframeResponse"


/**
 * init package
 */
const server = new Hono()
declare module "hono" {
    interface Context {
        auth: any
    }
}
// server.decorateRequest('auth', null)



/**
 * declare main class
 */
class Engine {
    private request: IReframeRequest
    private response: IReframeResponse
    private meta: IMetaReframe
    private server = server

    constructor (meta: IMetaReframe, options: IOptionStartEngine) {
        this.meta = meta
        this.start(options)
    }

    protected start(options: IOptionStartEngine) {
        /**
         * Setup var
         */
        this.server.use((ctx: Context, next: Next) => {
            ctx.auth = null
            this.request = reframeRequest(ctx, ctx.auth)
            this.response = reframeResponse(ctx)

            return next()
        })

        const preparedMiddlewares = [logger()]

        /**
         * Prepare global middlewares.
         */
        for (const globalMiddleware of this.meta.middlewares) {
            preparedMiddlewares.push(async (_: Context, next: Next) => {
                globalMiddleware({ request: this.request, response: this.response })
                return next()
            })
        }
        


        /**
         * Inject controller
         */
        for (const controller of this.meta.controllers) {

            /**
             * Prepare controller middlewares.
             */
            for (const middleware of controller.middlewares) {
                preparedMiddlewares.push(async (_: Context, next: Next) => {
                    middleware({ request: this.request, response: this.response })
                    return next()
                })
            }

            /**
             * Inject route handler with middleware if exists.
             */
            for (const routeHandler of (controller.routeHandlers ?? [])) {

                this.server[routeHandler.htttpMethod ?? 'get'](
                    routeHandler.route.replace(/\/+$/, ''),
                    ...preparedMiddlewares,
                    async (_: Context) => {
                        return routeHandler.handler({ request: this.request, response: this.response })
                    }
                )
            }
        }
        

        /**
         * start server
         */
        serve({
            fetch: this.server.fetch,
            port: options.port
        }, (info) => {
            console.log(`Server listening at ${options.port}`)
        })
    }
}

export default function HonoEngine(meta: IMetaReframe, options: IOptionStartEngine) {
    return new Engine(meta, options)
}