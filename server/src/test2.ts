// io alla fine ho giusto bisogno di un array di orari, tempo reale o meno
// e possibilmente qualche dato tipo nome azienda, codice e nome fermata
// poi me ne frego altamente di da dove vengono

interface Settings {
    stopId: string;
    stopName: string;
    trips: Trip[];
    additionalInfo?: string;
    visibleFields?: (keyof Trip)[];
    tripFn: (url: string) => Trip[] | string;
}

interface Trip {
    tripId?: string;
    shortName: string; // Route number
    longName: string; // Route destination
    vehicleType: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; // See route_type in https://developers.google.com/transit/gtfs/reference#routestxt
    scheduledArrival: string; // UNIX Timestamp - can be the same as arrivalTime
    scheduledDeparture: string; // UNIX Timestamp - can be the same as departureTime
    scheduleRelationship: "SCHEDULED" | "SKIPPED" | "NO_DATA"; // See https://developers.google.com/transit/gtfs-realtime/reference#enum-schedulerelationship
    realtimeArrival: string; // UNIX Timestamp - can be the same as arrivalTime
    realtimeDeparture: string; // UNIX Timestamp - can be the same as departureTime
    platform?: string; // Visible only if enabled in settings
    occupancyStatus?:
        | "EMPTY"
        | "MANY_SEATS_AVAILABLE"
        | "FEW_SEATS_AVAILABLE"
        | "STANDING_ROOM_ONLY"
        | "CRUSHED_STANDING_ROOM_ONLY"
        | "FULL"
        | "NOT_ACCEPTING_PASSENGERS";
    vehicleCode?: string;
    agencyLogo?: string; // Small logo (icon size)
    canceled?: boolean; // Defaults to false
    additionalInfo?: string; // Scrolling text
    backgroundColor?: string; // HEX color - has no effect on LED matrix displays
    textColor?: string; // HEX color - has no effect on LED matrix displays
}

function isTrip(data: unknown): data is Trip {
    return !!data && typeof data === "object" && (data as any).shortName;
}
