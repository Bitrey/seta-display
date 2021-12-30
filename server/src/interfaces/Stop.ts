import { Trip } from "./Trip";

/**
 * @swagger
 *  components:
 *    schemas:
 *      Stop:
 *        type: object
 *        required:
 *          - stopId
 *          - stopName
 *        properties:
 *          stopId:
 *            type: string
 *            description: Stop code
 *            example: MO2076
 *          stopName:
 *            type: string
 *            description: Name of the stop
 *            example: San Cesario
 *          routes:
 *            type: array
 *            items:
 *              type: string
 *              example: 25
 *            description: Routes that stop here
 *          additionalInfo:
 *            type: string
 *            description: Additional information to print on the display
 *          platform:
 *            type: string
 *            description: Platform where the stop is located
 *          coordX:
 *            type: number
 *            description: X coordinate of the stop location
 *            example: 686344
 *          coordY:
 *            type: number
 *            description: Y coordinate of the stop location
 *            example: 930918
 *          lat:
 *            type: number
 *            description: Latitude of the stop location
 *            example: 44.505762
 *          lon:
 *            type: number
 *            description: Longitude of the stop location
 *            example: 11.343174
 *          zone:
 *            type: string
 *            description: Zone code of the stop
 *            example: 500
 */

export interface IStop {
    stopId: string;
    stopName: string;
    routes?: string[];
    additionalInfo?: string;
    platform?: string;
    coordX?: number;
    coordY?: number;
    lat?: number;
    lon?: number;
    zone?: string;
}

export class Stop implements IStop {
    stopId: string;
    stopName: string;
    routes?: string[];
    additionalInfo?: string;
    visibleFields?: (keyof Trip)[];
    platform?: string;
    coordX?: number;
    coordY?: number;
    lat?: number;
    lon?: number;
    zone?: string;

    constructor(s: IStop) {
        this.stopId = s.stopId;
        this.stopName = s.stopName;
        this.routes = s.routes;
        this.additionalInfo = s.additionalInfo;
        this.platform = s.platform;
        this.coordX = s.coordX;
        this.coordY = s.coordY;
        this.lat = s.lat;
        this.lon = s.lon;
        this.zone = s.zone;
    }
}
