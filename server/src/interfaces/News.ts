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
 *          logoUrl:
 *            type: string
 *            description: Small icon URL of the agency
 *            example: https://solweb.tper.it/resources/images/logo-t.png
 *          date:
 *            type: string
 *            format: date
 *            description: ISO 8601 date of the news
 *            example: 2021-12-26T12:08:51.415Z
 *          title:
 *            type: string
 *            description: Title of the news
 *            example: FPP2 face masks are now mandatory on all SETA vehicles
 */

export interface News {
    agency: string;
    logoUrl?: string;
    date?: moment.Moment;
    type?: string;
    title: string;
}
