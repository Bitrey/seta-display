import axios from "axios";
import moment from "moment-timezone";
import { logger } from "../../shared/logger";
import { Trip } from "../../interfaces/Trip";
import { Stop } from "../../interfaces/Stop";
import { Agency } from "../../interfaces/Agency";
import { tripFn, tripFnErr, tripFnReturn } from "../../interfaces/tripFn";
import { Base } from "../Base";
import { join } from "path/posix";
import { readFileSync } from "fs";

interface _SetaRes {
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

export class Seta implements Base {
    public static agency: Agency = {
        lang: "it",
        logoUrl: "https://www.setaweb.it/images/favicon/favicon.ico",
        name: "SETA",
        timezone: "Europe/Rome",
        phone: "059 416711",
        url: "https://www.setaweb.it/mo/"
    };

    public static stops: Stop[] = JSON.parse(
        readFileSync(join(__dirname, "./stops.json"), { encoding: "utf-8" })
    );

    private static _instance = axios.create({
        baseURL: "https://avm.setaweb.it/SETA_WS/services/arrival/",
        timeout: 10000
    });

    public static getTrips: tripFn = async (stop, maxResults) => {
        let data: _SetaRes;
        try {
            data = (await this._instance.post("/" + stop.stopId)).data;
            logger.debug("SETA data fetched successfully");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                logger.debug("SETA data axios error:");
                logger.debug(err.response?.data);

                data = err.response?.data || {
                    arrival: {
                        waypont: stop.stopId,
                        error: "no arrivals scheduled in next 90 minutes"
                    }
                };
            } else {
                logger.error("SETA data unknown error:");
                logger.error(err);
                data = {
                    arrival: {
                        waypont: stop.stopId,
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
        } else if (error || !Array.isArray(services)) {
            logger.error("Bad response");
            logger.error(data);
            return { err: "Errore nel caricamento dei dati" };
        }

        const res: Trip[] = [];
        for (const e of services) {
            const i = res.findIndex(m => m.tripId === e.codice_corsa);

            let scheduledDeparture;

            // Skip non-realtime data
            if (i !== -1) {
                if (res[i].scheduleRelationship === "NO_DATA") {
                    scheduledDeparture = res[i].scheduledDeparture;
                    res.splice(i, 1);
                } else if (res[i].scheduleRelationship === "SCHEDULED") {
                    continue;
                }
            }

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
                scheduledArrival: scheduledDeparture || t,
                scheduledDeparture: scheduledDeparture || t,
                scheduleRelationship:
                    e.type === "realtime" ? "SCHEDULED" : "NO_DATA",
                realtimeArrival: t,
                realtimeDeparture: t,
                platform: stop.platform,
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

            if (trip.realtimeArrival >= Base.getTime().unix()) {
                res.push(trip);
            }
        }
        res.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

        return maxResults ? res.slice(0, maxResults) : res;
    };

    public static isTripsErr(r: tripFnReturn): r is tripFnErr {
        return "err" in r;
    }
}
