
import { Controller, Get, IReframeHandlerParams, Post } from "@/Reframe/providers/decorator";


@Controller({
    prefix: 'NameRoute'
})
class NameController {
    @Get('/')
    async index({ response }: IReframeHandlerParams) {


        /**
         * Response
         */
        return response.json({
            data: {},
            message: 'Success!'
        })
    }





    @Post('/')
    async store({ request, response }: IReframeHandlerParams) {
        /**
         * Validating request
         */
        const validated = await request.validate({
            // Write your validations...
        })


        /**
         * Response
         */
        return response.json({
            data: {},
            message: 'Success!'
        })
    }





    @Get('/:id')
    async show({ response }: IReframeHandlerParams) {
        /**
         * Check Exist data
         */
        // Write your query...


        /**
         * Response
         */
        return response.json({
            data: {},
            message: 'Success!'
        })
    }





    @Post('/:id')
    async update({ request, response }: IReframeHandlerParams) {
        /**
         * Check Exist data
         */
        // Write your query...


        /**
         * Validating request
         */
        const validated = await request.validate({
            // Write your validations...
        })


        /**
         * Response
         */
        return response.json({
            data: {},
            message: 'Success!'
        })
    }





    @Post('/:id')
    async delete({ request, response }: IReframeHandlerParams) {
        /**
         * Check Exist data
         */
        // Write your query...


        /**
         * Response
         */
        return response.json({
            data: {},
            message: 'Success!'
        })
    }
}
export default NameController