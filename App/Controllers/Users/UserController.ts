
import DB from "@/App/Database/DB";
import { Controller, Get, IReframeHandlerParams, Post } from "@/Reframe/decorator";


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
            ping: 'pong'
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

    /** Test Connection */
    @Get('/person')
    async person({ response }: IReframeHandlerParams) {
        const result = await DB.selectFrom('person')
            .innerJoin('pet', 'pet.owner_id', 'person.id')
            .select(['person.first_name as Nama Pemilik', 'pet.name as Pet', 'pet.species as Spesies'])
            .execute();

        return response.json({
            data: result
        })
    }
}
export default UserController