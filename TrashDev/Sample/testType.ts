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



type DynamicMe =
  {
    object: string,
    ruleKey?: string,
    ruleValue?: string
  }
  | {
    array: string,
    ruleValue?: string
  }
// | {
//   object: string,
//   structure?: string
// }

const you: DynamicMe = {
  array: '',
  
}