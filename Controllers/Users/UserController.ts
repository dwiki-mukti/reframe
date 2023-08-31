import { Controller, Get, IReframeHandler } from "@/Framework/Core";


@Controller()
export class UserController {
    @Get()
    index({ request, response }: IReframeHandler) {
        return response.json({
            me: 'dwiki'
        })
    }
}