/**
 * @swagger
 *  components:
 *    schemas:
 *      Agency:
 *        type: object
 *        required:
 *          - name
 *          - timezone
 *          - lang
 *          - logoUrl
 *        properties:
 *          id:
 *            type: string
 *            description: ID of the agency
 *            example: seta
 *          name:
 *            type: string
 *            description: Full name of the agency
 *            example: SETA S.p.A.
 *          timezone:
 *            type: string
 *            description: TZ database name as in https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 *            example: Europe/Rome
 *          lang:
 *            type: string
 *            description: Language in ISO 639-1 format as in https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 *            example: it
 *          logoUrl:
 *            type: string
 *            description: Small icon URL of the agency
 *            example: https://solweb.tper.it/resources/images/logo-t.png
 *          phone:
 *            type: string
 *            description: Phone number of the agency
 *            example: 059 416711
 *          url:
 *            type: string
 *            description: URL of the agency's website
 *            example: https://www.tper.it/
 */
export interface Agency {
    id?: string;
    name: string;
    timezone: string; // TZ database name
    lang: string; // ISO 639-1:2002
    logoUrl: string;
    phone?: string;
    url?: string;
}
