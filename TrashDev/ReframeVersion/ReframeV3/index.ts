import { isArray, isObject } from "@/Utils";
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

type ISingleValidations = ('required' | 'string' | 'number' | `enum:${string}` | `max:${number}` | `length:${number}`)[]
export type IDynamicValidations = (
    ISingleValidations |
    {
        object?: ISingleValidations,
        ruleKey?: ISingleValidations,
        ruleValue?: IDynamicValidations
    } |
    {
        object?: ISingleValidations,
        structure?: Record<string, IDynamicValidations>,
    } |
    {
        array?: ISingleValidations,
        ruleValue?: IDynamicValidations
    }
)
export type IReframeValidations = Record<string, IDynamicValidations>
type IResultSubValidator = {
    data?: Record<string, any>,
    invalid?: Record<string, any>
}



















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
export function validator(req: Record<string, any>, abort: (invalidMessage: any) => void) {
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
            return abort(invalids)
        } else {
            return dataValidateds
        }
    }
}


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