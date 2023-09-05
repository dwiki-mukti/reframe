import UserController from "./Controllers/Users/UserController";
import Reframe from "./Reframe";
import FastifyEngine from "./Reframe/Engines/FastifyEngine";
import fastifyCors from "@fastify/cors";
import formBodyPlugin from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";



const activeEngine = FastifyEngine
    // .register(formBodyPlugin) // acc application/x-www-form-urlencoded
    // .register(fastifyMultipart, { attachFieldsToBody: 'keyValues' }) // acc multipart/form-data
    // .register(fastifyCors, { origin: "*" }) // acc cors



Reframe.engine(activeEngine)
    .factory([
        UserController
    ])
    .start({ port: 8000 })