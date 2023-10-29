import UserController from "./app/Controllers/Users/UserController";
import TestMiddleware from "./app/Middlewares/TestMiddleware";
import Reframe from "./Reframe";
import FastifyEngine from "./reframe/engines/fastify";


Reframe.middleware([
    TestMiddleware
]).controller([
    UserController
]).start(FastifyEngine, { prefix: 'v1', port: 8000 })