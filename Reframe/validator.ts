import { isArray, isObject } from "@/Utils";

type ISingleValidations = ('required' | 'string' | 'number' | `enum:${string}` | `max:${number}` | `length:${number}`)[]
export type IDynamicValidations = (
    ISingleValidations |
    {
        object: ISingleValidations,
        ruleKey?: ISingleValidations,
        ruleValue?: IDynamicValidations
    } |
    {
        object: ISingleValidations,
        structure?: Record<string, IDynamicValidations>,
    } |
    {
        array: ISingleValidations,
        ruleValue?: IDynamicValidations
    }
)
export type IReframeValidations = Record<string, IDynamicValidations>
interface IResult {
    data?: Record<string, any>,
    invalids?: Record<string, string[]>
}
type ISubValidator = (params: {
    fieldName: any,
    request: any,
    rule: any,
    mutator?: { prefixValue?: string, suffixValue?: string, prefixKey?: string, suffixKey?: string }
}) => IResult
type IValidator = (params: {
    request: any,
    validations: Record<string, IDynamicValidations>,
    mutator?: { prefixKey?: string, suffixKey?: string }
}) => IResult




/**
 * Validator
 */
const subValidator: ISubValidator = function ({
    fieldName,
    request,
    rule,
    mutator
}) {
    // Declare result var
    let dataResult: Record<string, any> = {}
    let invalidResult: Record<string, any> = {}
    fieldName = `${mutator?.prefixKey ? `${mutator.prefixKey}.` : ''}${fieldName}${mutator?.suffixKey ? `.${mutator.suffixKey}` : ''}`


    // Proccess validating
    if (rule.object) {
        // Validating data object
        if (!isObject(request)) {
            invalidResult[fieldName] = [`must a json!`]
        } else {
            if (rule.structure) {
                const validateStructure = validator({
                    request: request,
                    validations: rule.structure,
                    mutator: { prefixKey: fieldName }
                })
                if (Object.keys(validateStructure?.invalids ?? {}).length) {
                    invalidResult = validateStructure?.invalids
                } else {
                    dataResult = validateStructure?.data ?? {}
                }
            } else {
                for (const [keyObject, valueObject] of Object.entries(request)) {
                    // declare var
                    const currentFieldName = `${fieldName}.${keyObject}`


                    // validate key & value object
                    const validateKey = subValidator({
                        fieldName: currentFieldName,
                        request: keyObject,
                        rule: rule.ruleKey,
                        mutator: { prefixValue: 'key object' }
                    })
                    const validateValue = subValidator({
                        fieldName: currentFieldName,
                        request: valueObject,
                        rule: rule.ruleValue,
                        mutator: { prefixValue: 'value object' }
                    })


                    // inject invalid result
                    invalidResult = {
                        ...invalidResult,
                        ...(validateValue?.invalids ?? {})
                    }
                    const invalidObjects = [
                        ...(validateKey?.invalids?.[currentFieldName] ?? []),
                        ...(validateValue?.invalids?.[currentFieldName] ?? [])
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
        }
    } else if (rule.array) {
        // Validating data array
        if (!isArray(request)) {
            invalidResult[fieldName] = [`must an array!`]
        } else {
            (request as Array<any>).forEach((itemArray, keyArray) => {
                const { invalids } = subValidator({
                    fieldName: `${fieldName}[${keyArray}]`,
                    request: itemArray,
                    rule: rule.ruleValue
                })

                if (Object.keys(invalids ?? {})?.length) {
                    invalidResult = { ...invalidResult, ...(invalids) }
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
            messages.push(`${mutator?.prefixValue ?? 'data'} is required ${mutator?.suffixValue ?? '!'}`)
        } else if (rule.includes('string') && (typeof (request) != 'string')) {
            // return invalid type string
            messages.push(`${mutator?.prefixValue ?? 'data'} must a string ${mutator?.suffixValue ?? '!'}`)
        } else if (rule.includes('number') && isNaN(request)) {
            // return invalid type string
            messages.push(`${mutator?.prefixValue ?? 'data'} must a number ${mutator?.suffixValue ?? '!'}`)
        }

        if (messages.length) {
            invalidResult[fieldName] = messages
        } else {
            dataResult[fieldName] = request
        }
    }


    // Returning data
    return Object.keys(invalidResult).length ? { invalids: invalidResult } : { data: dataResult }
}




















export const validator: IValidator = function ({
    request,
    validations,
    mutator
}) {
    let dataResult = {}
    let invalidResult = {}
    const prefixKey = mutator?.prefixKey ? `${mutator.prefixKey}.` : ''
    const suffixKey = mutator?.suffixKey ? `.${mutator.suffixKey}` : ''

    for (const [fieldName, rule] of Object.entries(validations)) {

        const validateRequest = subValidator({
            fieldName: `${prefixKey}${fieldName}${suffixKey}`,
            request: request?.[fieldName],
            rule: rule
        })

        invalidResult = { ...invalidResult, ...(validateRequest?.invalids ?? {}) }
        dataResult = { ...dataResult, ...(validateRequest?.data ?? {}) }
    }

    // Returning data
    return Object.keys(invalidResult).length ? { invalids: invalidResult } : { data: dataResult }
}