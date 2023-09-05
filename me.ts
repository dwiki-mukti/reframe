import { FastifyRegister } from "fastify";

const me: FastifyRegister = function (plugin, opts) {
    
}
console.log(me);






export type ReturnValueMapper<
    Func extends (...args: any[] /* impossible */) => any,
    ReturnValue
> = (...args: any[]) => ReturnValue;

type ReplaceReturnType<
    T extends (...a: any) => any, TNewReturn
> = (...a: Parameters<T>) => TNewReturn;

type WithOptional = ReplaceReturnType<(n?: number) => string, Promise<string>>;
let x!: WithOptional; // Typed as (n?: number) => Promise<string>
x() // Valid
x(1); //Ok