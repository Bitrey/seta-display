import axios, { Axios, AxiosResponse } from "axios";
import { readFileSync } from "fs";
import { logger } from "../../shared/logger";
import { Stop } from "../../interfaces/Stop";
import { Agency } from "../../interfaces/Agency";
import { tripFn, tripFnErr, tripFnReturn } from "../../interfaces/tripFn";
import { Base } from "../Base";
import { join } from "path";
import { parseStringPromise } from "xml2js";
import { ResErr } from "../../interfaces/ResErr";
import { Trip } from "../../interfaces/Trip";
import moment from "moment-timezone";

type _TperSingleRes = `TperHellobus: ${string} ${
    | "Previsto"
    | "DaSatellite"} ${number}:${number}`;

export class Tper implements Base {
    public static agency: Agency = {
        lang: "it",
        logoUrl: "https://solweb.tper.it/resources/images/logo-t.png",
        name: "TPER spa",
        timezone: "Europe/Rome",
        phone: "051 290290",
        url: "https://www.tper.it/"
    };

    static get stops(): Stop[] {
        return JSON.parse(
            readFileSync(join(__dirname, "./stops.json"), { encoding: "utf-8" })
        );
    }

    private static _instance = axios.create({
        baseURL: "https://hellobuswsweb.tper.it/web-services/hello-bus.asmx",
        timeout: 10000
    });

    public static getTrips: tripFn = async (stop, maxResults) => {
        let data: string;
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
                                    logger.debug(err.response?.data);

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
                    if (str.startsWith("TperHellobus: ")) str = str.substr(14);
                    else throw new Error("Invalid TperHellobus response");
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
                                const s1 = e.substr(busNumIndex);
                                const sIndex = s1.search(/[0-9]+/g);
                                if (sIndex === -1) {
                                    logger.error(
                                        "Invalid TPER s2 string format"
                                    );
                                    return;
                                }
                                busNum = s1.substr(sIndex)?.split(" ")[0];
                            }
                            const time = _t.unix();
                            const t: Trip = {
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
                            return t as any;
                        })
                        .filter(e => !!e);
                } catch (err) {
                    logger.error(err);
                    return {
                        err: { msg: "Error while loading data", status: 500 }
                    };
                }
            }

            if (!trips) {
                logger.debug("TPER no trips");
                return {
                    err: { msg: "Error while loading data", status: 500 }
                };
            }
            trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);
            return trips;
        } catch (err) {
            logger.error(err);
            return { err: { msg: "Error while loading data", status: 500 } };
        }
    };

    public static isTripsErr(r: tripFnReturn): r is tripFnErr {
        return "err" in r;
    }
}

export default Tper;
