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
 *          additionalInfo:
 *            type: string
 *            description: Additional information to print on the display
 *          platform:
 *            type: string
 *            description: Platform where the stop is located
 *          coordX:
 *            type: number
 *            description: X coordinate of the stop location
 *          coordY:
 *            type: number
 *            description: Y coordinate of the stop location
 *          lat:
 *            type: number
 *            description: Latitude of the stop location
 *          lon:
 *            type: number
 *            description: Longitude of the stop location
 *          zone:
 *            type: string
 *            description: Zone code of the stop
 */

export interface IStop {
    stopId: string;
    stopName: string;
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
        this.additionalInfo = s.additionalInfo;
        this.platform = s.platform;
        this.coordX = s.coordX;
        this.coordY = s.coordY;
        this.lat = s.lat;
        this.lon = s.lon;
        this.zone = s.zone;
    }
}
