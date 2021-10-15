import { Trip } from "./Trip";
import { tripFn, tripFnReturn } from "./tripFn";

export interface IStop {
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
    // getTrips: (maxResults?: number) => Promise<tripFnReturn>;
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
    // getTrips: (maxResults?: number) => Promise<tripFnReturn>;

    constructor(s: IStop) {
        this.stopId = s.stopId;
        this.stopName = s.stopName;
        this.additionalInfo = s.additionalInfo;
        this.visibleFields = s.visibleFields;
        this.platform = s.platform;
        this.coordX = s.coordX;
        this.coordY = s.coordY;
        this.lat = s.lat;
        this.lon = s.lon;
        this.zone = s.zone;
        // this.getTrips = s.getTrips;
    }
}
