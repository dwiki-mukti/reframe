import { IReframeResponse } from "@/Reframe/providers/decorator"
import { Context } from "hono"
import { ContentfulStatusCode } from "hono/utils/http-status"



/**
 * adaptor response
 */
export default function reframeResponse(context: Context): IReframeResponse {
    let statusCode = 200

    return {
        json: (data: Record<string, any>) => {
            return context.json(data, statusCode as ContentfulStatusCode)
        },
        status: (status: number) => {
            statusCode = status
            return this
        }
    }
}