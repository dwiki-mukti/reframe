
import "reflect-metadata";

/**
 * Interface declaration
 */
export interface ReframeEngine {
    module: (controllers: (new () => any)[]) => ReframeEngine,
    middleware: (middlewareHandlers: IReframeHandler[]) => ReframeEngine,
    start: (options: { port: number }) => void,
}
interface ReframeOptions {
    prefix?: string
}
export interface IControllerDecorator {
    prefix?: string,
    middlewares?: string[]
}
export type IHttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'all'
export type IReframeRequest = {
    body: any,
    params: any,
    headers: any,
    url: string,
    query: any,
    auth: any,
    /**
     * !!! HERE !!!
     */
    // validate: (validations: IReframeValidations, onFailed?: (invalidMessage: Record<string, any[]>) => any) => any,
    validate: any,
    transporter?: any
}
export type IReframeResponse = {
    json: (data: Record<string, any>) => void
    status: (status: number) => IReframeResponse
}
export type IReframeHandlerParams = {
    request: IReframeRequest,
    response: IReframeResponse
}
export type IReframeHandler = (params?: IReframeHandlerParams) => void




















/**
 * Method decorator for route-handler
 */
function HandlerDecorator({ method, path = '/' }: { method: IHttpMethod, path: string }): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        descriptor.writable = false
        Reflect.defineMetadata('path', path, target, propertyKey)
        Reflect.defineMetadata('method', method, target, propertyKey)
    }
}
export const Get = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'get', path }))
export const Post = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'post', path }))
export const Put = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'put', path }))
export const Patch = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'patch', path }))
export const Delete = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'delete', path }))
export const All = (path?: string): MethodDecorator => (HandlerDecorator({ method: 'all', path }))



/**
 * Class decorator Controller
 */
export function Controller(params?: IControllerDecorator): ClassDecorator {
    return (target) => {
        if (params) {
            Reflect.defineMetadata('prefix', params.prefix, target)
            Reflect.defineMetadata('middlewares', params.middlewares, target)
        }
    }
}




/**
 * Core framework
 */
class Reframe {
    engine(coreEngine: any, options?: ReframeOptions): ReframeEngine {
        return ((options?.prefix) ? coreEngine.prefix(options?.prefix ?? '') : coreEngine) as ReframeEngine
    }
}
export default (new Reframe)