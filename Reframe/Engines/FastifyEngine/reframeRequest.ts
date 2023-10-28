import { IReframeRequest } from "@/Reframe/decorator"
import { IValidations, validator } from "@/Reframe/validator"
import { FastifyReply, FastifyRequest } from "fastify"

/**
 * adaptor request
 */
export default function reframeRequest(req: FastifyRequest, res: FastifyReply): IReframeRequest {
    return {
        body: req.body,
        params: req.params,
        headers: req.headers,
        url: req.url,
        query: req.query,
        auth: req.auth,
        validate: (
            validations: Record<string, IValidations>,
            onInvalid?: (invalidMessage: Record<string, any[]>) => any
        ) => {
            const { invalids, data } = validator({ request: req.body, validations })
            if (Object.keys(invalids ?? {}).length) {
                if (onInvalid) onInvalid(invalids)
                return res.status(422).send(invalids)
            } else {
                return data
            }
        }
    }
}

