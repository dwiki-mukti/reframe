
export function isArray(data: any): Boolean {
    return data?.constructor == Array
}

export function isObject(data: any): Boolean {
    return data?.constructor == Object
}