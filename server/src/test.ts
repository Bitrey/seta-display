import axios from "axios";

const instance = axios.create({
    baseURL: "https://avm.setaweb.it/SETA_WS/services/arrival/",
    timeout: 10000
});
// https://avm.setaweb.it/SETA_WS/services/arrival/

interface Agency {
    name: string;
    timezone: string; // TZ database name
    lang: string; // ISO 639-1:2002
    logoUrl: string;
    phone?: string;
    url?: string;
}

interface Stop {
    code: string;
    name: string;
    desc?: string;
    lat?: number;
    lon?: number;
    zoneId?: string;
    url?: string;
    additionalText?: string;
}

interface Route {
    agency: string; // Possibly referncing Agency.name
    // From https://developers.google.com/transit/gtfs/reference#routestxt
    // 0 - Tram, Streetcar, Light rail. Any light rail or street level system within a metropolitan area.
    // 1 - Subway, Metro. Any underground rail system within a metropolitan area.
    // 2 - Rail. Used for intercity or long-distance travel.
    // 3 - Bus. Used for short- and long-distance bus routes.
    // 4 - Ferry. Used for short- and long-distance boat service.
    // 5 - Cable tram. Used for street-level rail cars where the cable runs beneath the vehicle, e.g., cable car in San Francisco.
    // 6 - Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway). Cable transport where cabins, cars, gondolas or open chairs are suspended by means of one or more cables.
    // 7 - Funicular. Any rail system designed for steep inclines.
    // 11 - Trolleybus. Electric buses that draw power from overhead wires using poles.
    // 12 - Monorail. Railway in which the track consists of a single rail or a beam.
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    shortName: string; // Route number
    longName: string; // Route destination
    description?: string;
    backgroundColor?: string; // HEX color
    textColor?: string; // HEX color
}

type ResErr = { err: string | null };

interface ResOk {
    tripId?: string;
    line: string;
    plannedArrival: Date;
    realTimeArrival?: Date;
    destination: string;
    busCode?: string;
    occupancyStatus:
        | "EMPTY"
        | "MANY_SEATS_AVAILABLE"
        | "FEW_SEATS_AVAILABLE"
        | "STANDING_ROOM_ONLY"
        | "CRUSHED_STANDING_ROOM_ONLY"
        | "FULL"
        | "NOT_ACCEPTING_PASSENGERS";
}

// async function getInfo(fermata: string): ResErr | ResOk {
//     const { data } = await instance.post("/" + fermata);
//     if (data?.arrival?.error === "no arrivals scheduled in next 90 minutes") {
//         return { err: "Nessuna corsa nei prossimi 90 minuti" } as ResErr;
//     }
//     if (!Array.isArray(data?.arrival?.services)) {
//         console.error("Bad response", data);
//         return { err: "Errore nel caricamento dei dati" } as ResErr;
//     }
// }
