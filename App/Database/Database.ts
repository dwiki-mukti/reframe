import { PersonTable } from './Interface/IPersonTable'
import { PetTable } from './Interface/IPetTable'

/** Declare Interface For Use In Connection */
export interface Database {
  person: PersonTable
  pet: PetTable
}
