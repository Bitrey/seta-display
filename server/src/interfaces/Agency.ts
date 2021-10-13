import { Stop } from "./Stop";
import { tripFn } from "./tripFn";

export interface Agency {
    id?: string;
    name: string;
    timezone: string; // TZ database name
    lang: string; // ISO 639-1:2002
    logoUrl: string;
    phone?: string;
    url?: string;
}
