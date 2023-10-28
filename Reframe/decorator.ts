import "reflect-metadata";
import { IHttpMethod } from ".";
import { IReframeValidations } from "./validator";

/**
 * Type declaration
 */
export type IReframeRequest = {
    body: any,
    params: any,
    headers: any,
    url: string,
    query: any,
    auth: any,
    validate: (validations: IReframeValidations, onFailed?: (invalidMessage: Record<string, any[]>) => any) => any,
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
function HandlerDecorator({ method, route = '/' }: { method: IHttpMethod, route: string }): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        descriptor.writable = false
        Reflect.defineMetadata('route', route, target, propertyKey)
        Reflect.defineMetadata('method', method, target, propertyKey)
    }
}
export const Get = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'get', route }))
export const Post = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'post', route }))
export const Put = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'put', route }))
export const Patch = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'patch', route }))
export const Delete = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'delete', route }))
export const All = (route?: string): MethodDecorator => (HandlerDecorator({ method: 'all', route }))



/**
 * Class decorator Controller
 */
export function Controller(params?: {
    prefix?: string,
    middlewares?: ((params: any) => any)[]
}): ClassDecorator {
    return (target) => {
        if (params) {
            Reflect.defineMetadata('prefix', params.prefix, target)
            Reflect.defineMetadata('middlewares', params.middlewares, target)
        }
    }
}