
import { Controller, Get, IReframeHandlerParams, Post } from "@/Reframe/providers/decorator";


@Controller({
    prefix: 'user',
    middlewares: [
        ({ request, response }) => {
            console.log('Test middleware on controller!');
        }
    ]
})
class UserController {
    @Get()
    async index({ response }: IReframeHandlerParams) {
        return response.json({
            data: {},
            message: 'Success!'
        })
    }

    @Post()
    async store({ request, response }: IReframeHandlerParams) {

        const validated = await request.validate({
            username: ['string', 'required'], // example single field
            phone: { // example array
                type: 'array',
                rule: ['number'],
                ruleValue: ['number'],
            },
            absensi: { // example object
                type: 'object',
                rule: ['required'],
                ruleKey: ['number'],
                ruleValue: ['string']
            },
            hobies: { // example object-array
                type: 'object',
                rule: ['required'],
                ruleKey: ['enum:sports,arts'],
                ruleValue: {
                    type: 'array',
                    rule: ['required', 'length:3'],
                    ruleValue: ['string']
                }
            },
            sample_object_object: { // example object-object
                type: 'object',
                rule: ['required'],
                ruleKey: ['string'],
                ruleValue: {
                    type: 'object',
                    rule: ['required'],
                    ruleKey: ['string'],
                    ruleValue: ['number']
                }
            },
            object_structure: {
                type: 'array',
                rule: ['required'],
                ruleValue: {
                    type: 'structure',
                    rule: ['required'],
                    structure: {
                        idUser: ['number'],
                        statusAbsensi: ['number']
                    }
                }
            }
        })

        return response.json(validated)
    }
}
export default UserController