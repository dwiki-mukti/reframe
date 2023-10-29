import { IReframeHandlerParams } from "@/Reframe/providers/decorator";


export default ({ request, response }: IReframeHandlerParams) => {
    console.log('Test Global middleware!');
}