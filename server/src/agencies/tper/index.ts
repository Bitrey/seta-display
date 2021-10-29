import axios from "axios";
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
        name: "TPER",
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
        try {
            const req = (await this._instance.get("/QueryHellobus", {
                params: {
                    fermata: stop.stopId,
                    linea: " ",
                    oraHHMM: " "
                }
            })) as { data: string };
            rawData = req.data;
            // console.log(rawData);
            logger.debug("TPER data fetched successfully");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                logger.debug("TPER data axios error:");
                logger.debug(err.response?.data);

                data = err.response?.data || "Unknown error";
            } else {
                logger.error("TPER data unknown error:");
                logger.error(err);

                data = "Unknown error";
            }
        }

        if (!rawData) {
            return { err: "Error while loading data" } as ResErr;
        }
        try {
            const xmlData: any = await parseStringPromise(rawData);
            let xmlStr: string = xmlData.string._;
            if (xmlStr.startsWith("TperHellobus: ")) xmlStr = xmlStr.substr(14);
            else throw new Error("Invalid TperHellobus response");
            trips = xmlStr.split(", ").map(e => {
                const s = e.split(" ");
                const time = moment
                    .tz(
                        `${moment().tz("Europe/Rome").format("L")} ${s[2]}`,
                        "L HH:mm",
                        "Europe/Rome"
                    )
                    .unix();
                const t: Trip = {
                    shortName: s[0],
                    longName: "",
                    realtimeArrival: time,
                    realtimeDeparture: time,
                    scheduledArrival: time,
                    scheduledDeparture: time,
                    vehicleType: 3,
                    scheduleRelationship:
                        s[1] === "Previsto" ? "NO_DATA" : "SCHEDULED"
                };
                return t;
            });
        } catch (err) {
            logger.error(err);
        }

        if (!trips) {
            return { err: "Error while loading data" };
        }

        trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);
        return trips;
    };

    public static isTripsErr(r: tripFnReturn): r is tripFnErr {
        return "err" in r;
    }
}

export default Tper;
