import UserController from "./app/Controllers/Users/UserController";
import TestMiddleware from "./app/Middlewares/TestMiddleware";
import Reframe from "./Reframe";
// import FastifyEngine from "./reframe/engines/fastify";
import HonoEngine from "./Reframe/engines/hono";


// Reframe.middleware([
//     TestMiddleware
// ]).controller([
//     UserController
// ]).start(FastifyEngine, { prefix: 'v1', port: 8000 })

Reframe.middleware([
    TestMiddleware
])
.controller([
    UserController
]).start(HonoEngine, { prefix: 'v1', port: 8000 })