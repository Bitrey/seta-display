/**
 * @swagger
 *  components:
 *    schemas:
 *      News:
 *        type: object
 *        required:
 *          - agency
 *          - title
 *        properties:
 *          agency:
 *            type: string
 *            description: Agency of the news
 *            example: seta
 *          date:
 *            type: string
 *            format: date
 *            description: Date of the news
 *            example: '2021-12-26T12:08:51.415Z'
 *          title:
 *            type: string
 *            description: Title of the news
 *            example: FPP2 face masks are now mandatory on all SETA vehicles
 */

export interface News {
    agency: string;
    date?: moment.Moment;
    type?: string;
    title: string;
}
