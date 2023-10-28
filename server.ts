import UserController from "./App/Controllers/Users/UserController";
import TestMiddleware from "./App/Middlewares/TestMiddleware";
import Reframe from "./Reframe";
import FastifyEngine from "./Reframe/Engines/FastifyEngine";


Reframe.middleware([
    TestMiddleware
]).controllers([
    UserController
]).start(FastifyEngine, { prefix: 'v1', port: 8000 })