import axios, { AxiosResponse } from "axios";
import { readFile, readFileSync, writeFile } from "fs";
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
import { promisify } from "util";
import { stringifyArray } from "../../api/shared/stringifyArray";
import { FnErr, isFnErr } from "../../interfaces/FnErr";

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

interface DataVersion {
    stops: string;
}

interface TempStops {
    [stopId: string]: Stop;
}

interface PassengerLevel {
    busCode: string;
    level: "MANY_SEATS_AVAILABLE" | "FEW_SEATS_AVAILABLE" | "FULL";
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

    private static _lastUpdateCheckDate: moment.Moment | null = null;
    private static _isUpdatingStops = false;

    private static async _updateStopsData() {
        if (
            Tper._lastUpdateCheckDate &&
            moment().diff(Tper._lastUpdateCheckDate, "hours") <= 3
        ) {
            logger.debug(
                "TPER stop data already checked at " +
                    Tper._lastUpdateCheckDate
                        .tz("Europe/Rome")
                        .format("DD/MM/YYYY HH:mm:ss")
            );
            return;
        } else if (Tper._isUpdatingStops) {
            logger.warn("TPER not updating stops: already updating...");
            return;
        }

        Tper._isUpdatingStops = true;

        let lastVersion;
        let cachedVersion;
        let cachedFile: DataVersion | null = null;

        try {
            // fetch current version
            const { data } = await this._instance.get(
                "https://solwsweb.tper.it/web-services/open-data.asmx/OpenDataVersione"
            );

            const obj = await parseStringPromise(data);

            lastVersion = moment(
                obj.DataSet["diffgr:diffgram"][0].NewDataSet[0].Table.find(
                    (e: any) => e.nome_file.includes("lineefermate")
                ).versione[0],
                "YYYYMMDD"
            );

            logger.debug(
                "TPER data last version is " +
                    lastVersion.tz("Europe/Rome").format("DD/MM/YYYY")
            );
        } catch (err) {
            logger.error("Error while fetching TPER last data version");
            logger.error(err);
            Tper._isUpdatingStops = false;
            return;
        }

        const dataVersionPath = join(
            settings.agencyFilesPath,
            "./tper/dataVersion.json"
        );

        try {
            // get cached version
            const readFilePromise = promisify(readFile);

            cachedFile = JSON.parse(
                await readFilePromise(dataVersionPath, {
                    encoding: "utf-8"
                })
            );

            cachedVersion = moment.unix(parseInt(cachedFile?.stops as string));
            if (!moment.isMoment(cachedVersion))
                throw new Error("Invalid unix date");

            logger.debug(
                "TPER data cached version is " +
                    cachedVersion.tz("Europe/Rome").format("DD/MM/YYYY")
            );
        } catch (err) {
            logger.warn("Invalid TPER dataVersion.json file, creating one");
            logger.warn(err);
        }

        if (cachedVersion && cachedVersion.isSame(lastVersion)) {
            logger.debug("TPER stop data is already the latest");
            Tper._isUpdatingStops = false;
            return;
        }

        logger.info("Updating TPER stops to latest...");

        try {
            const { data } = await this._instance.get(
                "https://solwsweb.tper.it/web-services/open-data.asmx/OpenDataLineeFermate"
            );

            logger.debug("Fetched TPER new stops data");

            const obj = await parseStringPromise(data);

            const raw = obj.DataSet[
                "diffgr:diffgram"
            ][0].NewDataSet[0].Table.map((e: any) => ({
                stopId: e.codice_fermata[0],
                stopName: e.denominazione[0],
                routes: e.codice_linea, // keep as array
                coordX: parseFloat(e.coordinata_x[0]),
                coordY: parseFloat(e.coordinata_y[0]),
                lat: parseInt(e.latitudine[0]),
                lon: parseInt(e.longitudine[0]),
                zone: parseInt(e.codice_zona[0])
            })) as any[];

            const stops: TempStops = {};

            for (let i = 0; i < raw.length; i++) {
                const { stopId } = raw[i];
                if (stopId in stops) {
                    if (!stops[stopId].routes) {
                        logger.error(
                            "Error while updating TPER stops: no routes array"
                        );
                    }
                    stops[stopId].routes?.push(raw[i].routes[0]);
                } else {
                    stops[stopId] = raw[i];
                }
            }

            const writeFilePromise = promisify(writeFile);

            await writeFilePromise(
                join(settings.agencyFilesPath, "./tper/stops.json"),
                stringifyArray(Object.values(stops))
            );

            const updatedFile: DataVersion = cachedFile || ({} as any);
            updatedFile.stops = lastVersion.unix().toString();

            await writeFilePromise(
                join(settings.agencyFilesPath, "./tper/dataVersion.json"),
                JSON.stringify(updatedFile, null, 4)
            );
        } catch (err) {
            logger.error("Error while updating TPER stops file");
            logger.error(err);
            Tper._isUpdatingStops = false;
            return;
        }

        Tper._lastUpdateCheckDate = moment();

        logger.info("TPER stop data have been updated");
        Tper._isUpdatingStops = false;
    }

    static get stops(): Stop[] {
        // DEBUG
        this._updateStopsData();

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

    private static async _getTripsForRoute(
        stopId: string,
        route?: string
    ): Promise<Trip[] | FnErr> {
        let trips: Trip[] | null = null;
        let rawData: any;

        let res;
        try {
            res = await this._instance.get("/QueryHellobus", {
                params: {
                    fermata: stopId,
                    linea: route || " ",
                    oraHHMM: " "
                }
            });
            logger.debug(
                `TPER fetching data for stop ${stopId} - line ${route}`
            );
        } catch (err) {
            if (axios.isAxiosError(err)) {
                logger.debug("TPER data axios error:");
                logger.debug(err.response?.data || err.response || err.code);
                // DEBUG - MAP ERROR!!

                // data = err.response?.data || "Unknown error";
            } else {
                logger.error("TPER data unknown error:");
                logger.error(err);

                // data = "Unknown error";
            }
            return {
                err: { msg: "Error while fetching stop", status: 500 }
            } as FnErr;
        }

        let noTrips = true;

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
            if (str.startsWith("TperHellobus: ")) str = str.substring(14);
            else if (str.includes("ERR_TOO_MANY_REQUESTS_LOCK"))
                return {
                    err: {
                        msg: "TperHellobus requests limit reached",
                        status: 500
                    }
                } as FnErr;
            else if (str.includes("SERVICE FAILURE"))
                return {
                    err: { msg: "TperHellobus service failed", status: 500 }
                } as FnErr;
            else if (/FERMATA [0-9]+ NON GESTITA/g.test(str)) {
                return {
                    err: { msg: `Stop ${stopId} is unknown`, status: 200 }
                } as FnErr;
            } else
                return {
                    err: {
                        msg: `Invalid TperHellobus response: ${str}`,
                        status: 500
                    }
                } as FnErr;

            if (str.includes("OGGI NESSUNA ALTRA CORSA DI"))
                return [] as Trip[];

            trips = str
                .split(", ")
                .map(e => {
                    const s = e.split(" ");
                    const _t = moment.tz(
                        `${moment().tz("Europe/Rome").format("L")} ${s[2]}`,
                        "L HH:mm",
                        "Europe/Rome"
                    );
                    const busNumIndex = e.search(/\(Bus[0-9]+ CON PEDANA\)/g);
                    let busNum: string | undefined = undefined;
                    if (busNumIndex !== -1) {
                        const s1 = e.substring(busNumIndex);
                        const sIndex = s1.search(/[0-9]+/g);
                        if (sIndex === -1) {
                            logger.error("Invalid TPER s2 string format");
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
                        scheduledArrival: s[1] === "Previsto" ? time : -1,
                        scheduledDeparture: s[1] === "Previsto" ? time : -1,
                        vehicleType: 3,
                        scheduleRelationship:
                            s[1] === "Previsto" ? "NO_DATA" : "SCHEDULED",
                        vehicleCode: busNum,
                        minTillArrival: _t.diff(moment(), "minutes")
                    };
                    if (
                        Number.isInteger(t.minTillArrival) &&
                        (t.minTillArrival as number) < 0
                    ) {
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

        trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

        for (let i = 0; i < trips.length; i++) {
            for (const key in trips[i]) {
                const _k = key as keyof typeof trips[typeof i];
                if (trips[i][_k] === undefined) delete trips[i][_k];
            }
        }

        return trips;
        // } catch (err) {
        //     logger.error(err);
        //     return { err: { msg: "Error while loading data", status: 500 } };
        // }
    }

    private static async _getPassengerLevel(): Promise<
        FnErr | PassengerLevel[]
    > {
        try {
            const { data } = await this._instance.get("/QueryAllBusLd");
            const xmlData: any = await parseStringPromise(data);
            const arr: AllBusLd[] = JSON.parse(xmlData.string._).AllBusLd;
            return arr.map(
                e =>
                    ({
                        busCode: e.matricola,
                        level:
                            e.livello === "basso"
                                ? "MANY_SEATS_AVAILABLE"
                                : e.livello === "medio"
                                ? "FEW_SEATS_AVAILABLE"
                                : "FULL"
                    } as PassengerLevel)
            );
        } catch (err) {
            logger.warn("TPER error while fetching passenger level");
            if (axios.isAxiosError(err)) {
                logger.warn(err.response?.data || err);
            } else {
                logger.error(err);
            }
            return {
                err: {
                    msg: "TPER error while fetching passenger level",
                    status: 500
                }
            } as FnErr;
        }
    }

    public static getTrips: tripFn = async stopId => {
        try {
            let routes: string[];
            const trips: Trip[] = [];

            // check if stop and routes are known
            const stop = Tper.stops.find(s => s.stopId === stopId);
            if (stop?.routes) {
                // routes are known from stops file
                routes = stop.routes;
            } else {
                // if routes are not known, load them from a first fetch
                const _tempTrips = await Tper._getTripsForRoute(stopId);
                if (isFnErr(_tempTrips)) {
                    if (_tempTrips.err.status >= 400) {
                        // error while loading routes
                        logger.debug("TPER error while loading _tempTrips");
                        return _tempTrips;
                    } else {
                        // probably stop not found but everything ok
                        logger.debug(
                            `TPER _tempTrips status code < 400 for stopId "${stopId}"`
                        );
                    }
                }

                routes = !isFnErr(_tempTrips)
                    ? [...new Set(_tempTrips.map(t => t.shortName))]
                    : [];

                logger.debug(
                    `TPER unknown stop "${stopId}", fetched routes: "${routes.join(
                        '", "'
                    )}"`
                );
            }

            const errors: FnErr[] = [];

            // If routes is empty, fetch trips with no route specified
            for (const route of routes.length > 0 ? routes : [undefined]) {
                const t = await Tper._getTripsForRoute(stopId, route);
                if (isFnErr(t)) errors.push(t);
                else trips.push(...t);
            }

            const unacceptableErrors = errors.filter(e => e.err.status >= 400);
            if (unacceptableErrors.length > 0 || trips.length === 0) {
                return {
                    err: {
                        msg:
                            [
                                ...new Set(
                                    unacceptableErrors.map(e => e.err.msg)
                                )
                            ].join(", ") ||
                            [...new Set(errors.map(e => e.err.msg))].join(", "),
                        status: Math.max(...errors.map(e => e.err.status))
                    }
                } as FnErr;
            }

            const passengerLevel = await Tper._getPassengerLevel();

            // fill passenger level
            if (!isFnErr(passengerLevel)) {
                const busCodes = passengerLevel.map(e => e.busCode);
                for (let i = 0; i < trips.length; i++) {
                    const { vehicleCode } = trips[i];
                    if (!vehicleCode || !busCodes.includes(vehicleCode)) {
                        continue;
                    }

                    const occupancyStatus = passengerLevel.find(
                        p => p.busCode === vehicleCode
                    );
                    if (!occupancyStatus) continue;
                    trips[i].occupancyStatus = occupancyStatus.level;
                }
            }

            trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

            // delete undefined keys
            for (let i = 0; i < trips.length; i++) {
                for (const key in trips[i]) {
                    const _k = key as keyof typeof trips[typeof i];
                    if (trips[i][_k] === undefined) delete trips[i][_k];
                }
            }

            return trips;
            // } catch (err) {
            //     logger.error(err);
            //     return { err: { msg: "Error while loading data", status: 500 } };
            // }
        } catch (err) {
            logger.error("TPER error while fetching trips");
            logger.error(err);
            return {
                err: { msg: "Error while fetching trips", status: 500 }
            } as FnErr;
        }
    };
}

export default Tper;
