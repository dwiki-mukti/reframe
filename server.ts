import { UserController } from "@/Controllers/Users/UserController";
import { Reframe } from "@/Framework/Engines/FastifyEngine";

/**
 * !!! TODO: Redeclare type factory params !!!
 */
Reframe.factory([
    UserController
]).start({ port: 8000 })