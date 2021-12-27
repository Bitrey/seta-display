/**
 * @swagger
 *  components:
 *    schemas:
 *      ResErr:
 *        type: object
 *        required:
 *          - err
 *        properties:
 *          err:
 *            type: string
 *            description: Error message
 */

export interface ResErr {
    err: string;
}
export function isResErr(err: unknown): err is ResErr {
    return typeof err === "string";
}
