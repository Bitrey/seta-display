import { CustomErr } from "./CustomErr";

/**
 * @swagger
 *  components:
 *    schemas:
 *      FnErr:
 *        type: object
 *        required:
 *          - err
 *        properties:
 *          err:
 *            type: object
 *            required:
 *              - msg
 *              - status
 *            description: Error object
 *            properties:
 *              msg:
 *                  type: string
 *                  description: Error message
 *              status:
 *                  type: number
 *                  description: HTTP status code
 */

export interface FnErr {
    err: CustomErr;
}
export function isFnErr(err: unknown): err is FnErr {
    return (
        typeof err === "object" &&
        err !== null &&
        "err" in err &&
        typeof (err as any).err === "object" &&
        (err as any).err !== null &&
        "msg" in (err as any).err &&
        "status" in (err as any).err &&
        typeof (err as any).err.msg === "string" &&
        typeof (err as any).err.status === "number"
    );
}
