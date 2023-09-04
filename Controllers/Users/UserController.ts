import { Controller, Get, IReframeHandler } from "@/Framework/Core";


function isArray(data: any): Boolean {
    return data?.constructor == Array
}
function isObject(data: any): Boolean {
    return data?.constructor == Object
}


function abort(message: any) {
    return message
}
const sampleRequest = {
    username: 'dwiki@email.com',
    password: 'pass',
    phone: ['0852282828', '879892137087'],
    absensi: {
        2121212: 'H',
        3212313: 'I',
        1231321: 'H'
    },
    hobies: {
        sports: ['renang', 'jogging'],
        arts: []
    },
    sample_object_object: {
        out_1: {
            in_1_1: 'hello',
            in_1_2: 'panda'
        },
        out_2: {
            in_2_1: 'hello',
            in_2_2: 'world'
        }
    }
}
const sampleValidations = {
    username: ['string', 'required', 'exists:users,username,$userId'],
    password: ['string', 'min:18', 'required'],
    phone: {
        array: ['required', 'length:5'],
        ruleValue: ['number']
    },
    absensi: {
        object: ['required'],
        ruleKey: ['number'],
        ruleValue: ['string']
    },
    hobies: {
        object: ['required'],
        ruleKey: ['enum:sports,arts'],
        ruleValue: {
            array: ['required', 'length:3'],
            ruleValue: ['number']
        }
    },
    sample_object_object: {
        object: ['required'],
        ruleKey: ['string'],
        ruleValue: {
            object: ['required'],
            ruleKey: ['string'],
            ruleValue: ['string']
        }
    }
}


type IResultSubValidator = {
    data?: Record<string, any>,
    invalid?: Record<string, any>
}


function subValidator(
    fieldName: any,
    request: any,
    rule: any,
    mutator?: { prefix?: string, suffix?: string }
): IResultSubValidator {
    /**
     * Declare result var
     */
    let dataResult: Record<string, any> = {}
    let invalidResult: Record<string, any> = {}


    /**
     * Proccess validating
     */
    if (rule.object) {
        /**
         * Validating data object
         */
        if (!isObject(request)) {
            invalidResult[fieldName] = [`must a json!`]
        } else {
            let invalidObjectResult = {}
            let dataObjectResult = {}
            for (const [keyObject, valueObject] of Object.entries(request)) {
                // declare var
                let invalidObjects = []


                // validate key object
                const validateKey = subValidator(`${fieldName}.${keyObject}`, keyObject, rule.ruleKey, { prefix: 'key object' })


                // validate value object
                const validateValue = subValidator(`${fieldName}.${keyObject}`, valueObject, rule.ruleValue, { prefix: 'value object' })


                // merge validate key & value
                if (isArray(validateKey?.invalid?.[`${fieldName}.${keyObject}`])) {
                    invalidObjects = [
                        ...(invalidObjects ?? []),
                        ...validateKey?.invalid?.[`${fieldName}.${keyObject}`]
                    ]
                }

                if (isArray(validateValue?.invalid?.[`${fieldName}.${keyObject}`])) {
                    invalidObjects = [
                        ...(invalidObjects ?? []),
                        ...validateValue?.invalid?.[`${fieldName}.${keyObject}`]
                    ]
                } else {
                    invalidObjectResult = {
                        ...(invalidObjectResult ?? {}),
                        ...(validateValue?.invalid?.[`${fieldName}.${keyObject}`] ?? {})
                    }
                }
                if (invalidObjects.length) {
                    invalidObjectResult[`${fieldName}.${keyObject}`] = invalidObjects
                } else {
                    dataObjectResult[keyObject] = valueObject
                }
            }
            if (Object.keys(invalidObjectResult).length) {
                invalidResult[fieldName] = invalidObjectResult
            } else {
                dataResult[fieldName] = dataObjectResult
            }
        }
    } else if (rule.array) {
        /**
         * Validating data array
         */
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
        /**
         * Validating single data
         */
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


    /**
     * Prepare result & returning data
     */
    let results: IResultSubValidator = {}
    if (Object.keys(invalidResult).length) {
        results.invalid = invalidResult
    } else {
        results.data = dataResult
    }
    return results
}


async function validator(validations: Record<string, any>, onFailed?: any) {
    let dataValidateds: any = {}
    let invalids = {}

    for (const [fieldName, rule] of Object.entries(validations)) {
        const { data, invalid } = subValidator(fieldName, sampleRequest[fieldName], rule)

        if (rule.object) {
            invalids = { ...invalids, ...(invalid?.[fieldName] ?? {}) }
        } else {
            invalids = { ...invalids, ...invalid }
        }
        dataValidateds = { ...dataValidateds, ...data }
    }


    if (Object.keys(invalids).length) {
        if (onFailed) onFailed(invalids)
        return abort(invalids)
    } else {
        return dataValidateds
    }
}


@Controller()
export class UserController {
    @Get()
    async index({ request, response }: IReframeHandler) {

        const validated = await validator(sampleValidations)


        return response.json(validated)
    }
}