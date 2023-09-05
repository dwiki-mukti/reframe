import { Controller, Get, IReframeHandlerParams, Post } from "@/Reframe";


@Controller()
export default class UserController {
    @Get()
    async index({ response }: IReframeHandlerParams) {
        return response.json({
            ping: 'pong'
        })
    }

    @Post()
    async store({ request, response }: IReframeHandlerParams) {

        const validated = await request.validate({
            username: ['string', 'required'], // example single field
            phone: { // example array
                array: ['required', 'length:3'],
                ruleValue: ['number']
            },
            absensi: { // example object
                object: ['required'],
                ruleKey: ['number'],
                ruleValue: ['string']
            },
            hobies: { // example object-array
                object: ['required'],
                ruleKey: ['enum:sports,arts'],
                ruleValue: {
                    array: ['required', 'length:3'],
                    ruleValue: ['string']
                }
            },
            sample_object_object: { // example object-object
                object: ['required'],
                ruleKey: ['string'],
                ruleValue: {
                    object: ['required'],
                    ruleKey: ['number'],
                    ruleValue: ['number']
                }
            }
        })

        return response.json(validated)
    }
}