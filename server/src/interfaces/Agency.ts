import { Stop } from "./Stop";
import { Trip } from "./Trip";

export interface Agency {
    name: string;
    timezone: string; // TZ database name
    lang: string; // ISO 639-1:2002
    logoUrl: string;
    stops: Stop[];
    tripFn: (stopId: string) => Promise<Trip[] | { err: string }>;
    phone?: string;
    url?: string;
}
