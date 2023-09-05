import UserController from "./Controllers/Users/UserController";
import TestMiddleware from "./Middlewares/TestMiddleware";
import Reframe from "./Reframe";
import FastifyEngine from "./Reframe/Engines/FastifyEngine";
import fastifyCors from "@fastify/cors";
import formBodyPlugin from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";



const activeEngine = FastifyEngine
    .plugin(formBodyPlugin) // acc application/x-www-form-urlencoded
    .plugin(fastifyMultipart, { attachFieldsToBody: 'keyValues' }) // acc multipart/form-data
    .plugin(fastifyCors, { origin: "*" }) // acc cors



Reframe.engine(activeEngine, { prefix: 'v1' })
    .middleware([
        TestMiddleware
    ])
    .module([
        UserController
    ])
    .start({ port: 8000 })