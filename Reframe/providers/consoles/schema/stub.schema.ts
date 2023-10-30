import { ColumnType, Generated } from "kysely"

export interface NameSchema {
    id: Generated<number>
    created_at: ColumnType<Date, string | undefined, never>
    updated_at: ColumnType<Date, string | undefined, never>
}