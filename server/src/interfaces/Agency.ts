import { Stop } from "./Stop";
import { tripFn } from "./tripFn";

export interface Agency {
    name: string;
    timezone: string; // TZ database name
    lang: string; // ISO 639-1:2002
    logoUrl: string;
    phone?: string;
    url?: string;
}
