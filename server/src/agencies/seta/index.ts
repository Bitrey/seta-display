import axios from "axios";
import moment from "moment-timezone";
import https from "https";
import { join } from "path";
import { readFileSync } from "fs";
import { cwd } from "process";
import cheerio from "cheerio";
import { logger } from "../../shared/logger";
import { Trip } from "../../interfaces/Trip";
import { Stop } from "../../interfaces/Stop";
import { Agency } from "../../interfaces/Agency";
import { tripFn } from "../../interfaces/tripFn";
import { Base } from "../Base";
import { News } from "../../interfaces/News";
import { newsFn } from "../../interfaces/newsFn";
import { settings } from "../../settings";

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
        logoUrl:
            "https://www.dropbox.com/s/nk987x28t7u7dqc/logo_seta_bacino.png?raw=1",
        name: "SETA spa",
        timezone: "Europe/Rome",
        phone: "059 416711",
        url: "https://www.setaweb.it/mo/"
    };

    private static _stops: Stop[] | null = null;
    private static _lastStopReadDate: moment.Moment | null = null;

    static get stops(): Stop[] {
        if (
            !Seta._stops ||
            !Seta._lastStopReadDate ||
            moment().diff(Seta._lastStopReadDate, "minutes") >=
                settings.stopsCacheTimeMin
        ) {
            logger.debug("Caching SETA stops");
            Seta._stops = JSON.parse(
                readFileSync(join(cwd(), "./agency_files/seta/stops.json"), {
                    encoding: "utf-8"
                })
            ) as Stop[];
            Seta._lastStopReadDate = moment();
        }

        return Seta._stops;
    }

    private static _instance = axios.create({
        baseURL: "https://avm.setaweb.it/SETA_WS/services/arrival/",
        timeout: 10000
    });

    public static getNews: newsFn = async ({
        bacino
    }: {
        bacino: string | null;
    }) => {
        let data;
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        try {
            const _bacino: "mo" | "re" | "pc" | null =
                !!bacino && ["mo", "re", "pc"].includes(bacino)
                    ? (bacino as any)
                    : null;
            const res = await axios.get(
                _bacino
                    ? `https://www.setaweb.it/${_bacino}/news`
                    : "https://www.setaweb.it/news",
                { httpsAgent }
            );
            data = res.data;
        } catch (err) {
            logger.error("Error while fetching SETA news");
            logger.error(
                (axios.isAxiosError(err) && err.response?.data) || err
            );
            return {
                err: {
                    msg: "Error while fetching SETA news",
                    status:
                        (axios.isAxiosError(err) && err.response?.status) || 500
                }
            };
        }

        const $ = cheerio.load(data);
        const news: News[] = [];
        for (let i = 0; i < $(".title").length; i++) {
            news.push({
                agency: this.agency.name,
                logoUrl: this.agency.logoUrl,
                date: moment($(".date-title").eq(i).text(), "DD.MM.YYYY"),
                type: $(".bacini-title").eq(i).text(),
                title: $(".title").eq(i).text()
            });
        }

        return news;
    };

    public static getTrips: tripFn = async (stop, maxResults) => {
        let data: _SetaRes;
        try {
            data = (await this._instance.post("/" + stop.stopId)).data;
            logger.debug(`SETA data fetched for stop ${stop.stopId}`);
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
            return { err: { msg: "Error while loading data", status: 500 } };
        }

        const { error, services } = data.arrival;
        if (error === "no arrivals scheduled in next 90 minutes") {
            logger.debug("SETA no arrivals");
            return {
                err: {
                    msg: "No arrivals scheduled in the next 90 minutes",
                    status: 200
                }
            };
        } else if (error || !Array.isArray(services)) {
            logger.error("Bad response");
            logger.error(data);
            return { err: { msg: "Error while loading data", status: 500 } };
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

            const _t = moment.tz(
                `${moment().tz("Europe/Rome").format("L")} ${e.arrival}`,
                "L HH:mm",
                "Europe/Rome"
            );
            const t = _t.unix();
            const r =
                e.num_passeggeri && e.posti_totali
                    ? e.num_passeggeri / e.posti_totali
                    : null;
            const trip: Trip = {
                agencyName: this.agency.name,
                logoUrl: this.agency.logoUrl,
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
                textColor: "#FFFFFF",
                minTillArrival: _t.diff(moment().tz("Europe/Rome"), "minutes")
            };

            if (
                trip.realtimeArrival >= Base.getTime().unix() &&
                trip.minTillArrival &&
                trip.minTillArrival > 0
            ) {
                res.push(trip);
            }
        }
        res.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

        for (let i = 0; i < res.length; i++) {
            for (const key in res[i]) {
                const _k = key as keyof typeof res[typeof i];
                if (res[i][_k] === undefined) delete res[i][_k];
            }
        }

        return maxResults ? res.slice(0, maxResults) : res;
    };
}

export default Seta;
