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
 *          date:
 *            type: string
 *            format: date
 *            description: Date of the news
 *          type:
 *            type: string
 *            description: Type of the news
 *          title:
 *            type: string
 *            description: Title of the news
 */

export interface News {
    agency: string;
    date?: moment.Moment;
    type?: string;
    title: string;
}
