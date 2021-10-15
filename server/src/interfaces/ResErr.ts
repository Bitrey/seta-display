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
