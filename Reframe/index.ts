import "reflect-metadata";
import { IReframeHandler } from "@/reframe/providers/decorator";

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
    private plugins = [];
    private middlewares = [];
    private controllers = [];



    public plugin = (plugin: any, opts?: any) => {
        this.plugins = this.plugins.concat({ plugin, opts })
        return this
    }


    public middleware(middlewares: IReframeHandler[]) {
        this.middlewares = this.middlewares.concat(middlewares)
        return this
    }



    public controller(controllers: (new () => any)[]) {
        this.controllers = this.controllers.concat(controllers)
        return this
    }



    private frameBuilder(options: IOptionStartEngine): IMetaReframe {
        let metaControllers: IController[] = []


        for (const Blueprint of this.controllers) {
            const instance = new Blueprint
            const routeHandlers: Array<IRouteHandler> = []

            for (const keyProp of Reflect.ownKeys(Blueprint.prototype)) {
                const htttpMethod: IHttpMethod = Reflect.getMetadata('method', instance, keyProp)
                const route: string = Reflect.getMetadata('route', instance, keyProp)
                const handler = instance[keyProp]

                if (htttpMethodAlloweds.includes(htttpMethod) && route && handler) {
                    routeHandlers.push({
                        htttpMethod,
                        handler,
                        route: String('/' + (options.prefix ?? '') + '/' + (Reflect.getMetadata('prefix', Blueprint) ?? '') + '/' + route)
                            .replace(/[\\/]+/g, '/')
                    })
                }
            }

            metaControllers.push({
                middlewares: Reflect.getMetadata('middlewares', Blueprint),
                routeHandlers
            })
        }


        return {
            plugins: this.plugins,
            middlewares: this.middlewares,
            controllers: metaControllers
        }
    }


    start(engine: (meta: IMetaReframe, options: IOptionStartEngine) => any, options?: IOptionStartEngine) {
        engine(this.frameBuilder(options), options)
    }
}
export default (new Reframe)