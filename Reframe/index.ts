import "reflect-metadata";
import { IReframeHandler } from "./decorator";

/**
 * Interface declaration
 */
export type IHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all'

interface IRouteHandler {
    htttpMethod?: IHttpMethod,
    route?: string,
    handler: IReframeHandler
}
interface IController {
    prefix?: string,
    middlewares?: Array<undefined | IReframeHandler>,
    routeHandlers: Array<undefined | IRouteHandler>
}
export interface IMetaReframe {
    plugins?: Array<undefined | { plugin: any, opts?: any }>,
    middlewares?: Array<undefined | IReframeHandler>,
    controllers?: Array<undefined | IController>,
}

export interface IOptionStartEngine {
    prefix?: string,
    port?: number
}



/**
 * Core framework
 */
const htttpMethodAlloweds = ['get', 'post', 'put', 'patch', 'delete', 'all']
class Reframe {
    private meta: IMetaReframe = {
        plugins: [],
        middlewares: [],
        controllers: []
    }


    public plugin = (plugin: any, opts?: any) => {
        this.meta.plugins = this.meta.plugins.concat({ plugin, opts })
        return this
    }


    public middleware(middlewares: IReframeHandler[]) {
        this.meta.middlewares = this.meta.middlewares.concat(middlewares)
        return this
    }


    public controllers(controllers: (new () => any)[]) {
        let metaControllers: IController[] = []


        for (const ClassController of controllers) {
            const controller = new ClassController
            const routeHandlers: Array<IRouteHandler> = []

            for (const keyProp of Reflect.ownKeys(ClassController.prototype)) {
                const htttpMethod: IHttpMethod = Reflect.getMetadata('method', controller, keyProp)
                const route: string = Reflect.getMetadata('route', controller, keyProp)
                const handler = controller[keyProp]

                if (htttpMethodAlloweds.includes(htttpMethod) && route && handler) {
                    routeHandlers.push({
                        htttpMethod,
                        handler,
                        route
                    })
                }
            }

            metaControllers.push({
                prefix: Reflect.getMetadata('prefix', ClassController),
                middlewares: Reflect.getMetadata('middlewares', ClassController),
                routeHandlers
            })
        }


        this.meta.controllers = this.meta.controllers.concat(metaControllers)
        return this
    }


    start(engine: (meta: IMetaReframe, options: IOptionStartEngine) => any, options?: IOptionStartEngine) {
        engine(this.meta, options)
    }
}
export default (new Reframe)