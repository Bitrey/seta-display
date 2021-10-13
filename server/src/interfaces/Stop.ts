import { Trip } from "./Trip";
import { tripFn, tripFnReturn } from "./tripFn";

export interface IStop {
    stopId: string;
    stopName: string;
    additionalInfo?: string;
    visibleFields?: (keyof Trip)[];
    platform?: string;
    lat?: number;
    lon?: number;
    // getTrips: (maxResults?: number) => Promise<tripFnReturn>;
}

export class Stop implements IStop {
    stopId: string;
    stopName: string;
    additionalInfo?: string;
    visibleFields?: (keyof Trip)[];
    platform?: string;
    lat?: number;
    lon?: number;
    // getTrips: (maxResults?: number) => Promise<tripFnReturn>;

    constructor(s: IStop) {
        this.stopId = s.stopId;
        this.stopName = s.stopName;
        this.additionalInfo = s.additionalInfo;
        this.visibleFields = s.visibleFields;
        this.platform = s.platform;
        this.lat = s.lat;
        this.lon = s.lon;
        // this.getTrips = s.getTrips;
    }
}
