import axios from "axios";
import { logger } from "./shared/logger";
import { Trip } from "./interfaces/Trip";
import moment from "moment-timezone";
import { Stop } from "./interfaces/Stop";
import { Agency } from "./interfaces/Agency";

interface Seta {
    arrival: {
        waypont: string;
        services?: {
            service: string; // Route short name
            arrival: string; // HH:mm
            type: "planned" | "realtime";
            destination: string;
            fleetCode: "MO" | "RE" | "PC";
            dutyId: string;
            busnum: string; // can be empty string
            serviceType: "EX" | "UR";
            occupancyStatus:
                | null
                | "EMPTY"
                | "MANY_SEATS_AVAILABLE"
                | "FEW_SEATS_AVAILABLE"
                | "STANDING_ROOM_ONLY"
                | "CRUSHED_STANDING_ROOM_ONLY"
                | "FULL"
                | "NOT_ACCEPTING_PASSENGERS"; // ignore this field
            codice_corsa: string; // Route ID
            posti_totali: number | null;
            num_passeggeri: number | null;
        }[];
        error?: "no arrivals scheduled in next 90 minutes";
    };
}

const stops: Stop[] = [
    {
        stopId: "MO10",
        stopName: "Modena Autostazione",
        platform: "Est."
    },
    {
        stopId: "MO10",
        stopName: "Modena Autostazione",
        platform: "Est."
    },
    {
        stopId: "MO3",
        stopName: "Modena Autostazione",
        platform: "1"
    },
    {
        stopId: "MO2076",
        stopName: "San Cesario"
    }
];
const setaMo: Agency = {
    lang: "it",
    logoUrl: "https://www.setaweb.it/images/favicon/favicon.ico",
    name: "SETA",
    timezone: "Europe/Rome",
    phone: "059 416711",
    stops,
    tripFn: getTrips,
    url: "https://www.setaweb.it/mo/"
};

const instance = axios.create({
    baseURL: "https://avm.setaweb.it/SETA_WS/services/arrival/",
    timeout: 10000
});

export async function getTrips(
    stopCode: string
): Promise<Trip[] | { err: string }> {
    let data: Seta;
    try {
        data = (await instance.post("/" + stopCode)).data;
        logger.debug("SETA data fetched successfully");
    } catch (err) {
        if (axios.isAxiosError(err)) {
            logger.debug("SETA data axios error:");
            logger.debug(err.response?.data);

            data = err.response?.data || {
                arrival: {
                    waypont: stopCode,
                    error: "no arrivals scheduled in next 90 minutes"
                }
            };
        } else {
            logger.error("SETA data unknown error:");
            logger.error(err);
            data = {
                arrival: {
                    waypont: stopCode,
                    error: "no arrivals scheduled in next 90 minutes"
                }
            };
        }
    }

    if (!data?.arrival || typeof data?.arrival !== "object") {
        logger.error("Bad response");
        logger.error(data);
        return { err: "Errore nel caricamento dei dati" };
    }

    const { error, services } = data.arrival;
    if (error === "no arrivals scheduled in next 90 minutes") {
        return { err: "Nessuna corsa nei prossimi 90 minuti" };
    } else if (!Array.isArray(services)) {
        logger.error("Bad response");
        logger.error(data);
        return { err: "Errore nel caricamento dei dati" };
    }

    const res: Trip[] = [];
    for (const e of services) {
        const i = res.findIndex(m => m.tripId === e.codice_corsa);

        // Skip non-realtime data
        if (i !== -1 && res[i].scheduleRelationship === "NO_DATA") {
            res.splice(i, 1);
        } else if (i !== -1 && res[i].scheduleRelationship === "SCHEDULED") {
            continue;
        }
        logger.debug(`${moment().tz("Europe/Rome").format("L")} ${e.arrival}`);
        const t = moment
            .tz(
                `${moment().tz("Europe/Rome").format("L")} ${e.arrival}`,
                "L HH:mm",
                "Europe/Rome"
            )
            .unix();
        const r =
            e.num_passeggeri && e.posti_totali
                ? e.num_passeggeri / e.posti_totali
                : null;
        const trip: Trip = {
            tripId: e.codice_corsa,
            shortName: e.service,
            longName: e.destination,
            vehicleType: 3,
            scheduledArrival: t,
            scheduledDeparture: t,
            scheduleRelationship:
                e.type === "realtime" ? "SCHEDULED" : "NO_DATA",
            realtimeArrival: t,
            realtimeDeparture: t,
            platform: stop.platform, // convert to class
            occupancyStatus: r
                ? r < 0.1
                    ? "EMPTY"
                    : r < 0.6
                    ? "MANY_SEATS_AVAILABLE"
                    : r < 0.8
                    ? "FEW_SEATS_AVAILABLE"
                    : r < 1
                    ? "STANDING_ROOM_ONLY"
                    : r < 1.1
                    ? "CRUSHED_STANDING_ROOM_ONLY"
                    : r < 1.5
                    ? "FULL"
                    : undefined
                : undefined,
            passengersNum: e.num_passeggeri || undefined,
            maxPassengers: e.posti_totali || undefined,
            vehicleCode: e.busnum || undefined,
            canceled: false, // doesn't support true
            // additionalInfo: undefined
            backgroundColor: e.serviceType === "EX" ? "#1267B7" : "#FFC100",
            textColor: "#FFFFFF"
        };
        res.push(trip);
    }
    return res;
}

async function test() {
    const res = await setaMo.tripFn(s);
    if (Array.isArray(res)) {
        console.log("corse", res);
    } else {
        console.log("errore", res);
    }
}

// test();

// const a = {
//     arrival: {
//         waypont: "MO2076",
//         services: [
//             {
//                 service: "760",
//                 arrival: "15:06",
//                 type: "planned",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41048",
//                 busnum: "",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7748-4457116",
//                 posti_totali: null,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:08",
//                 type: "realtime",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41048",
//                 busnum: "371",
//                 serviceType: "EX",
//                 occupancyStatus: "MANY_SEATS_AVAILABLE",
//                 codice_corsa: "MO760-Di-7748-4457116",
//                 posti_totali: 83,
//                 num_passeggeri: 10
//             },
//             {
//                 service: "760",
//                 arrival: "15:08",
//                 type: "planned",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41811",
//                 busnum: "",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7835-3360583",
//                 posti_totali: null,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:08",
//                 type: "realtime",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41811",
//                 busnum: "677",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7835-3360583",
//                 posti_totali: 66,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:11",
//                 type: "planned",
//                 destination: "PIUMAZZO",
//                 fleetCode: "MO",
//                 dutyId: "41004",
//                 busnum: "",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7774-4457104",
//                 posti_totali: null,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:16",
//                 type: "realtime",
//                 destination: "PIUMAZZO",
//                 fleetCode: "MO",
//                 dutyId: "41004",
//                 busnum: "216",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7774-4457104",
//                 posti_totali: 76,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:39",
//                 type: "planned",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41616",
//                 busnum: "",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7835-3360588",
//                 posti_totali: null,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:48",
//                 type: "realtime",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41616",
//                 busnum: "343",
//                 serviceType: "EX",
//                 occupancyStatus: "MANY_SEATS_AVAILABLE",
//                 codice_corsa: "MO760-Di-7835-3360588",
//                 posti_totali: 86,
//                 num_passeggeri: 9
//             },
//             {
//                 service: "760",
//                 arrival: "16:29",
//                 type: "planned",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41827",
//                 busnum: "",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7835-4457086",
//                 posti_totali: null,
//                 num_passeggeri: null
//             },
//             {
//                 service: "760",
//                 arrival: "15:46",
//                 type: "realtime",
//                 destination: "VIGNOLA",
//                 fleetCode: "MO",
//                 dutyId: "41827",
//                 busnum: "361",
//                 serviceType: "EX",
//                 occupancyStatus: null,
//                 codice_corsa: "MO760-Di-7835-4457086",
//                 posti_totali: 76,
//                 num_passeggeri: null
//             }
//         ]
//     }
// };
