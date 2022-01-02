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

export interface Stop {
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

export interface RedisStop
    extends Omit<Stop, "routes" | "coordX" | "coordY" | "lat" | "lon"> {
    routesSetName?: string;
    coordX?: string;
    coordY?: string;
    lat?: string;
    lon?: string;
}

export function isStop(stop: unknown): stop is Stop {
    if (!stop || typeof stop !== "object") return false;
    const s: Stop = stop as any;
    return typeof s.stopId === "string" && typeof s.stopName === "string";
    // DEBUG: continue this if needed
}
