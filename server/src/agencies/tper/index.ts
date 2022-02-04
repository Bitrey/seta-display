import axios, { AxiosResponse } from "axios";
import { readFileSync } from "fs";
import { join } from "path";
import { parseStringPromise } from "xml2js";
import { cwd } from "process";
import moment from "moment-timezone";
import Parser from "rss-parser";
import { logger } from "../../shared/logger";
import { Stop } from "../../interfaces/Stop";
import { Agency } from "../../interfaces/Agency";
import { tripFn } from "../../interfaces/tripFn";
import { Base } from "../Base";
import { Trip } from "../../interfaces/Trip";
import { newsFn } from "../../interfaces/newsFn";
import { News } from "../../interfaces/News";
import { settings } from "../../settings";

// type _TperSingleRes = `TperHellobus: ${string} ${| "Previsto"
//     | "DaSatellite"} ${number}:${number}`;

const NewsTypes = [
    "primaPagina",
    "tutte",
    "bologna",
    "ferrara",
    "ferrovia",
    "carBikeSharing",
    "contrassegniSosta"
] as const;
type NewsType = typeof NewsTypes[number];

interface AllBusLd {
    matricola: string;
    livello: "basso" | "medio" | "alto";
}

export class Tper implements Base {
    public static agency: Agency = {
        lang: "it",
        logoUrl:
            "https://www.dropbox.com/s/hjggo1pftqyyf3c/logo_TPER_0.png?raw=1",
        name: "TPER spa",
        timezone: "Europe/Rome",
        phone: "051 290290",
        url: "https://www.tper.it/"
    };

    private static _stops: Stop[] | null = null;
    private static _lastStopReadDate: moment.Moment | null = null;

    static get stops(): Stop[] {
        if (
            !Tper._stops ||
            !Tper._lastStopReadDate ||
            moment().diff(Tper._lastStopReadDate, "minutes") >=
                settings.stopsCacheTimeMin
        ) {
            logger.debug("Caching TPER stops");
            Tper._stops = JSON.parse(
                readFileSync(join(cwd(), "./agency_files/tper/stops.json"), {
                    encoding: "utf-8"
                })
            ) as Stop[];
            Tper._lastStopReadDate = moment();
        }

        return Tper._stops;
    }

    private static _instance = axios.create({
        baseURL: "https://hellobuswsweb.tper.it/web-services/hello-bus.asmx",
        timeout: 10000
    });

    private static _getNewsUrl(type: NewsType): string {
        if (type === "primaPagina") return "https://www.tper.it/rss.xml";
        else if (type === "tutte")
            return "https://www.tper.it/tutte-le-news/rss.xml";
        else if (type === "ferrovia")
            return "https://www.tper.it/linee-ferroviarie/rss.xml";
        else
            return `https://www.tper.it/taxonomy/term/${
                type === "bologna"
                    ? "33"
                    : type === "ferrara"
                    ? "34"
                    : type === "carBikeSharing"
                    ? "438"
                    : type === "contrassegniSosta"
                    ? "437"
                    : (logger.error("NewsType non valido in getNews TPER"),
                      "33")
            }/all/rss.xml`;
    }

    public static getNews: newsFn = async ({ type }: { type: NewsType }) => {
        if (!NewsTypes.includes(type)) {
            return { err: { msg: "Invalid TPER news type", status: 400 } };
        }

        const news: News[] = [];
        try {
            // const execES6 = promisify(exec);
            const data = (await this._instance.get(Tper._getNewsUrl(type)))
                .data;
            // platform === "linux"
            // ? (await execES6("curl -s -k " + Tper._getNewsUrl(type)))
            //   .stdout :

            const parser = new Parser();
            const feed = await parser.parseString(data);

            feed.items.forEach((item: any) => {
                if (!item.title) return;
                news.push({
                    agency: this.agency.name,
                    logoUrl: this.agency.logoUrl,
                    date: moment.parseZone(item.isoDate),
                    title: item.title
                });
            });
        } catch (err) {
            logger.error("Error while fetching TPER news");
            logger.error(err);
        }

        return news;
    };

    public static getTrips: tripFn = async (stop, maxResults) => {
        let trips: Trip[] | null = null;
        let rawData: any;
        if (!stop.routes) {
            logger.error("TPER stop.routes not defined");
            return { err: { msg: "Error while loading data", status: 500 } };
        }

        try {
            const responses: (AxiosResponse<string> | Error)[] =
                await Promise.all(
                    stop.routes.map(route => {
                        const res = this._instance
                            .get("/QueryHellobus", {
                                params: {
                                    fermata: stop.stopId,
                                    linea: route,
                                    oraHHMM: " "
                                }
                            })
                            .catch(err => {
                                if (axios.isAxiosError(err)) {
                                    logger.debug("TPER data axios error:");
                                    logger.debug(
                                        err.response?.data ||
                                            err.response ||
                                            err.code
                                    );

                                    // data = err.response?.data || "Unknown error";
                                } else {
                                    logger.error("TPER data unknown error:");
                                    logger.error(err);

                                    // data = "Unknown error";
                                }
                                return err as Error;
                            });
                        logger.debug(
                            `TPER data fetched for stop ${stop.stopId} - line ${route}`
                        );
                        return res;
                    })
                );

            let noTrips = true;
            for (const res of responses) {
                if (res instanceof Error) continue;
                rawData = res.data;
                // console.log(rawData);

                if (!rawData) {
                    logger.error("TPER rawData is falsy");
                    return {
                        err: { msg: "Error while loading data", status: 500 }
                    };
                }
                try {
                    const xmlData: any = await parseStringPromise(rawData);
                    let str: string = xmlData.string._;
                    if (str.startsWith("TperHellobus: "))
                        str = str.substring(14);
                    else if (str.includes("ERR_TOO_MANY_REQUESTS_LOCK"))
                        throw new Error("TperHellobus requests limit reached");
                    else if (str.includes("SERVICE FAILURE"))
                        throw new Error("TperHellobus service failed");
                    else
                        throw new Error(
                            `Invalid TperHellobus response: ${str}`
                        );
                    if (str.includes("OGGI NESSUNA ALTRA CORSA DI")) continue;

                    trips = str
                        .split(", ")
                        .map(e => {
                            const s = e.split(" ");
                            const _t = moment.tz(
                                `${moment().tz("Europe/Rome").format("L")} ${
                                    s[2]
                                }`,
                                "L HH:mm",
                                "Europe/Rome"
                            );
                            const busNumIndex = e.search(
                                /\(Bus[0-9]+ CON PEDANA\)/g
                            );
                            let busNum: string | undefined = undefined;
                            if (busNumIndex !== -1) {
                                const s1 = e.substring(busNumIndex);
                                const sIndex = s1.search(/[0-9]+/g);
                                if (sIndex === -1) {
                                    logger.error(
                                        "Invalid TPER s2 string format"
                                    );
                                    return;
                                }
                                busNum = s1.substring(sIndex)?.split(" ")[0];
                            }
                            const time = _t.unix();
                            const t: Trip = {
                                agencyName: this.agency.name,
                                logoUrl: this.agency.logoUrl,
                                shortName: s[0],
                                longName: "",
                                realtimeArrival: time,
                                realtimeDeparture: time,
                                scheduledArrival: time,
                                scheduledDeparture: time,
                                vehicleType: 3,
                                scheduleRelationship:
                                    s[1] === "Previsto"
                                        ? "NO_DATA"
                                        : "SCHEDULED",
                                vehicleCode: busNum,
                                minTillArrival: _t.diff(moment(), "minutes")
                            };
                            if (t.minTillArrival && t.minTillArrival < 0) {
                                return;
                            }
                            noTrips = false;
                            return t as any;
                        })
                        .filter(e => !!e);
                } catch (err) {
                    logger.error("Error while fetching TPER routes");
                    logger.error(err);
                    return {
                        err: { msg: "Error while loading data", status: 500 }
                    };
                }
            }

            if (!trips) {
                logger.debug("TPER no trips");
                if (noTrips) {
                    return {
                        err: {
                            msg: "No more trips planned for today",
                            status: 200
                        }
                    };
                } else {
                    return {
                        err: { msg: "Error while loading data", status: 500 }
                    };
                }
            }

            try {
                const { data } = await this._instance.get("/QueryAllBusLd");
                const xmlData: any = await parseStringPromise(data);
                const arr: AllBusLd[] = JSON.parse(xmlData.string._).AllBusLd;
                const v = trips.map(t => t.vehicleCode);
                arr.forEach(e => {
                    if (v.includes(e.matricola)) {
                        const i = trips?.findIndex(
                            t => t.vehicleCode === e.matricola
                        );
                        if (!trips || !i || i === -1) {
                            logger.error("i -1 in TPER QueryAllBusLd");
                        } else {
                            trips[i].occupancyStatus =
                                e.livello === "basso"
                                    ? "MANY_SEATS_AVAILABLE"
                                    : e.livello === "medio"
                                    ? "FEW_SEATS_AVAILABLE"
                                    : "FULL";
                        }
                    }
                });
            } catch (err) {
                logger.error(err);
            }

            trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

            for (let i = 0; i < trips.length; i++) {
                for (const key in trips[i]) {
                    const _k = key as keyof typeof trips[typeof i];
                    if (trips[i][_k] === undefined) delete trips[i][_k];
                }
            }

            return trips;
        } catch (err) {
            logger.error(err);
            return { err: { msg: "Error while loading data", status: 500 } };
        }
    };
}

export default Tper;
