import moment from "moment";

/**
 * @swagger
 *  components:
 *    schemas:
 *      Ad:
 *        type: object
 *        required:
 *          - agency
 *          - date
 *          - url
 *          - type
 *        properties:
 *          agency:
 *            type: string
 *            description: Name of the agency (all lowercase)
 *            example: seta
 *          date:
 *            type: string
 *            description: ISO 8601 date of the ad
 *            example: 2022-01-05T13:12:37.278Z
 *          url:
 *            type: string
 *            description: URL of the ad content
 *            example: https://www.dropbox.com/s/5mvadnlq97fk7f3/pexels-ekaterina-bolovtsova-6689233.mp4?raw=1
 *          type:
 *            type: string
 *            enum:
 *              - image
 *              - video
 *            description: Type of the content
 *            example: video
 */
export interface Ad {
    agency: string;
    date: moment.Moment;
    url: string;
    type: "image" | "video";
}
