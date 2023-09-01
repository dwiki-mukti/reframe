/**
 * Import the necessary packages and types.
 */
import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { IHttpMethod, IReframeRequest } from "@/Framework/Core";

/**
 * Declare a new property on the FastifyRequest interface.
 */
declare module "fastify" {
	interface FastifyRequest {
		auth: any;
	}
}

/**
 * Initialize the Fastify server and add a new property to the request object.
 */
const server = fastify();
server.decorateRequest("auth", null);

/**
 * Adaptor function to convert a FastifyRequest to an IReframeRequest.
 */
function ReframeRequest(req: FastifyRequest): IReframeRequest {
	return {
		body: req.body,
		params: req.params,
		headers: req.headers,
		url: req.url,
		query: req.query,
		auth: req.auth,
		validate: () => {
			// !!! TODO: make request validator !!!
		},
	};
}

/**
 * Adaptor class to convert a FastifyReply to a ReframeResponse.
 */
class ReframeResponse {
	constructor(res: FastifyReply) {
		this.res = res;
	}

	public res: FastifyReply;

	public json(data: Record<string, any>) {
		return this.res.send(data);
	}

	public status(status: number) {
		return this.res.status(status);
	}
}

/**
 * The main ReframeInstance class.
 */
class ReframeInstance {
	/**
	 * Creates a new instance of the ReframeInstance class.
	 */
	constructor() {}

	/**
	 * The Fastify server instance.
	 */
	private server = fastify();

	/**
	 * The request object.
	 */
	private request = {};

	/**
	 * The response object.
	 */
	private response = {};

	/**
	 * Registers a plugin with the Fastify server.
	 * @param {any} params - The plugin parameters.
	 * @returns {ReframeInstance} The ReframeInstance object.
	 */
	register(params: any) {
		this.server.register(params);
		return this;
	}

	/**
	 * Registers a set of controllers with the Fastify server.
	 * @param {Function[]} controllers - The controllers to register.
	 * @returns {ReframeInstance} The ReframeInstance object.
	 */
	factory(controllers: (new () => any)[]) {
		for (const Controller of controllers) {
			const instance = new Controller();
			const propertyKeys = Reflect.ownKeys(Controller.prototype);
			const prefix: string = Reflect.getMetadata("prefix", instance) ?? "";
			const middlewares: Function[] = Reflect.getMetadata(
				"middlewares",
				instance,
			);

			/**
			 * Assign props request & reply
			 */
			this.server.addHook("preHandler", (request, reply, done) => {
				this.request = ReframeRequest(request);
				this.response = new ReframeResponse(reply);
				return done();
			});

			/**
			 * Register class controller.
			 */
			this.server.register(
				(appModule, options, doneAppModule) => {
					/**
					 * Inject middleware to app.
					 */
					for (const middleware of middlewares ?? []) {
						appModule.addHook(
							"preHandler",
							(request, reply, doneMiddleware) => {
								middleware({ request: this.request, response: this.response });
								return doneMiddleware();
							},
						);
					}

					/**
					 * Inject route-handler to app.
					 */
					for (const propertyKey of propertyKeys) {
						const path: string = Reflect.getMetadata(
							"path",
							instance,
							propertyKey,
						);
						const method: IHttpMethod = Reflect.getMetadata(
							"method",
							instance,
							propertyKey,
						);
						const handler = instance[propertyKey];

						/**
						 * Injecting route-handler to app.
						 */
						if (path && method && handler) {
							appModule[method](path, (request, reply) => {
								return handler({
									request: this.request,
									response: this.response,
								});
							});
						}
					}
					return doneAppModule();
				},
				{ prefix },
			);
		}
		return this;
	}

	/**
	 * This method starts the server and listens on the specified port.
	 * @param {Object} [params] - The server parameters.
	 * @param {number} [params.port=8000] - The port to listen on.
	 */
	start(params?: { port?: number }) {
		this.server.listen(
			{
				port: params?.port ?? 8000,
			},
			(err, address) => {
				if (err) {
					console.error(err);
					process.exit(1);
				}
				console.log(`Server listening at ${address}`);
			},
		);
	}
}

/**
 * The main Reframe object.
 */
export const Reframe = new ReframeInstance();
