// type tumbuhan = {
//   jenis: 'tumbuhan'
//   berbuah?: string[],
//   berumbi?: string[]
// }

// type hewan = {
//   jenis: 'hewan'
//   herbivora?: string,
//   karnivora?: string
// }


// type hidup = tumbuhan | hewan
// const makhlukHidup: hidup = {
//   jenis: 'tumbuhan',
//   berbuah: ["pepaya", "stroberi"],
//   berumbi: ["singkong"]
// }


type tumbuhan = {
  jenis: 'tumbuhan'
  berbuah?: string[],
  berumbi?: string[]
}

type hewan = {
  jenis: 'hewan'
  herbivora?: string,
  karnivora?: string
}


type hidup = tumbuhan | hewan
const makhlukHidup: hidup = {
  jenis: 'tumbuhan',
  berbuah: ["pepaya", "stroberi"],
  berumbi: ["singkong"]
}


// type ISingleValidations = ('required' | 'string' | 'number' | `enum:${string}` | `max:${number}` | `length:${number}`)[]
// export type IDynamicValidations = (
//   ISingleValidations |
//   // {
//   //   object: ISingleValidations,
//   //   ruleKey?: ISingleValidations,
//   //   ruleValue?: IDynamicValidations
//   // } |
//   {
//     object: ISingleValidations,
//     structure?: Record<string, IDynamicValidations>,
//   } |
//   {
//     array: ISingleValidations,
//     ruleValue?: IDynamicValidations
//   }
// )

// const me: Record<string, IDynamicValidations> = {
//   panda: {
//     array: ['required'],

//   }
// }



type ISingleValidations = ('required' | 'string' | 'number' | `enum:${string}` | `max:${number}` | `length:${number}`)[]
export type IDynamicValidations = (
  ISingleValidations |
  {
    type: 'structure',
    rule?: ISingleValidations,
    structure?: Record<string, IDynamicValidations>,
  } |
  {
    type: 'object',
    rule?: ISingleValidations,
    ruleKey?: ISingleValidations,
    ruleValue?: IDynamicValidations
  } |
  {
    type: 'array',
    rule?: ISingleValidations,
    ruleValue?: IDynamicValidations
  }
)

const me: IDynamicValidations = {
  type: 'object',
  rule: ['number'],
  ruleKey: ['number']
}