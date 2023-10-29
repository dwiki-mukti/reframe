import { PersonTable } from './IPersonTable'
import { PetTable } from './IPetTable'

/** Declare Interface For Use In Connection */
export default interface Schema {
  person: PersonTable
  pet: PetTable
}
