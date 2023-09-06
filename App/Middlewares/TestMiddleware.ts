import { IReframeHandlerParams } from "@/Reframe";


export default ({ request, response }: IReframeHandlerParams) => {
    console.log('middleware called!');
}