import { IReframeRequest } from "@/Reframe/providers/decorator";
import { IValidations, validator } from "@/Reframe/providers/validator";
import { Context } from "hono";


/**
 * adaptor request
 */
export default function reframeRequest(context: Context, auth: any | null): IReframeRequest {
    return {
        body: context.req.json,
        params: context.req.param,
        headers: context.req.header,
        url: context.req.url,
        query: context.req.query,
        auth: auth,
        validate: (
            validations: Record<string, IValidations>,
            onInvalid?: (invalidMessage: Record<string, any[]>) => any
        ) => {
            const { invalids, data } = validator({ request: context.req.json(), validations })
            if (Object.keys(invalids ?? {}).length) {
                if (onInvalid) onInvalid(invalids)
                return context.json(invalids, 422)
            } else {
                return data
            }
        }
    }
}