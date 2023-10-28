import { IReframeHandlerParams } from "@/Reframe/decorator";


export default ({ request, response }: IReframeHandlerParams) => {
    console.log('Test Global middleware!');
}