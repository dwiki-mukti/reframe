import { IReframeResponse } from "@/Reframe/providers/decorator"
import { FastifyReply } from "fastify"




/**
 * adaptor response
 */
export default function reframeResponse(res: FastifyReply): IReframeResponse {
    return {
        json: (data: Record<string, any>) => {
            return res.send(data)
        },
        status: (status: number) => {
            return reframeResponse(res.status(status))
        }
    }
}