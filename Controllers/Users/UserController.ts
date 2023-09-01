import { Controller, Get, IReframeHandler } from "@/Framework/Core";

@Controller()
export class UserController {
	@Get()
	index({ request, response }: IReframeHandler) {
		return response.json({
			title: "reframe js",
			description: "Adaptive pattern for ts framework",
		});
	}
}
