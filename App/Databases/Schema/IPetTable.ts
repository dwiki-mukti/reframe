import { Generated, Insertable, Selectable, Updateable } from "kysely"

export interface PetTable {
    id: Generated<number>
    name: string
    owner_id: number
    species: 'dog' | 'cat'
}
  
export type Pet = Selectable<PetTable>
export type NewPet = Insertable<PetTable>
export type PetUpdate = Updateable<PetTable>