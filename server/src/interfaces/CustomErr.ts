/**
 * @swagger
 *  components:
 *    schemas:
 *      CustomErr:
 *        type: object
 *        required:
 *          - msg
 *          - status
 *        properties:
 *          msg:
 *            type: string
 *            description: Error message
 *            example: Error while loading data
 *          status:
 *            type: number
 *            description: HTTP status code
 *            example: 500
 */

export interface CustomErr {
    msg: string;
    status: number;
}
