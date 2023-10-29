import { isArray } from "@/utils";

type ISingleValidations = ('required' | 'string' | 'number' | `enum:${string}` | `max:${number}` | `length:${number}`)[]
type IDynamicValidations = (
    {
        type: 'structure',
        rule?: ISingleValidations,
        structure?: Record<string, IValidations>,
    } |
    {
        type: 'object',
        rule?: ISingleValidations,
        ruleKey?: ISingleValidations,
        ruleValue?: IValidations
    } |
    {
        type: 'array',
        rule?: ISingleValidations,
        ruleValue?: IValidations
    }
)
export type IValidations = (ISingleValidations | IDynamicValidations)
export type IReframeValidations = Record<string, IValidations>
interface IResult {
    data?: Record<string, any>,
    invalids?: Record<string, string[]>
}
type ISubValidator = (params: {
    fieldName: string,
    request: any,
    rule: IValidations,
    mutator?: { prefixValue?: string, suffixValue?: string, prefixKey?: string, suffixKey?: string }
}) => IResult
type IValidator = (params: {
    request: any,
    validations: Record<string, IValidations>,
    mutator?: { prefixKey?: string, suffixKey?: string }
}) => IResult
















/**
 * Sub Validator
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


    if (isArray(rule)) {
        /**
         * Validating single data
         */
        const messages: string[] = []
        const singleRule: ISingleValidations = (rule as any)

        if (singleRule.includes('required') && !request) {
            // return invalid required data
            messages.push(`${mutator?.prefixValue ?? 'data'} is required ${mutator?.suffixValue ?? '!'}`)
        } else if (singleRule.includes('string') && (typeof (request) != 'string')) {
            // return invalid type string
            messages.push(`${mutator?.prefixValue ?? 'data'} must a string ${mutator?.suffixValue ?? '!'}`)
        } else if (singleRule.includes('number') && isNaN(request)) {
            // return invalid type string
            messages.push(`${mutator?.prefixValue ?? 'data'} must a number ${mutator?.suffixValue ?? '!'}`)
        }

        if (messages.length) {
            invalidResult[fieldName] = messages
        } else {
            dataResult[fieldName] = request
        }
    } else {
        const dynamicRule: IDynamicValidations = (rule as any)
        if (dynamicRule.type == 'array') {
            /**
             * Validating data array
             */
            if (!isArray(request)) {
                invalidResult[fieldName] = [`must an array!`]
            } else {
                (request as Array<any>).forEach((itemArray, keyArray) => {
                    const { invalids } = subValidator({
                        fieldName: `${fieldName}[${keyArray}]`,
                        request: itemArray,
                        rule: dynamicRule.ruleValue
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
        } else if (dynamicRule.type == 'object') {
            for (const [keyObject, valueObject] of Object.entries(request)) {
                // declare var
                const currentFieldName = `${fieldName}.${keyObject}`


                // validate key & value object
                const validateKey = subValidator({
                    fieldName: currentFieldName,
                    request: keyObject,
                    rule: dynamicRule.ruleKey,
                    mutator: { prefixValue: 'key object' }
                })
                const validateValue = subValidator({
                    fieldName: currentFieldName,
                    request: valueObject,
                    rule: dynamicRule.ruleValue,
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
        } else {
            const validateStructure = validator({
                request: request,
                validations: dynamicRule.structure,
                mutator: { prefixKey: fieldName }
            })
            if (Object.keys(validateStructure?.invalids ?? {}).length) {
                invalidResult = validateStructure?.invalids
            } else {
                dataResult = validateStructure?.data ?? {}
            }
        }
    }



    // Returning data
    return Object.keys(invalidResult).length ? { invalids: invalidResult } : { data: dataResult }
}






/**
 * Validator
 */
export const validator: IValidator = function ({
    request,
    validations,
    mutator
}) {
    let dataResult = {}
    let invalidResult = {}
    const prefixKey = mutator?.prefixKey ? `${mutator.prefixKey}.` : ''
    const suffixKey = mutator?.suffixKey ? `.${mutator.suffixKey}` : ''

    // Validating record
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