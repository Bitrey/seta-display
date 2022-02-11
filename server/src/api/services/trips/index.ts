import { join } from "path";
import { logger } from "../../../shared/logger";
import { Trip } from "../../../interfaces/Trip";
import { Base } from "../../../agencies/Base";
import { CustomErr } from "../../../interfaces/CustomErr";
import { tripFnReturn } from "../../../interfaces/tripFn";
import { isFnErr } from "../../../interfaces/FnErr";
import { settings } from "../../../settings";
import { Redis } from "../../../db";
import { Stop } from "../../../interfaces/Stop";

interface TripsReq {
    agencies: string | string[];
    stops: string[];
    limit?: number;
}

interface _TripsToBeCached {
    [stopId: string]: Trip[];
}

export const tripsService = async ({
    agencies,
    stops,
    limit
}: TripsReq): Promise<{ trips?: Trip[]; err?: CustomErr }> => {
    const trips: Trip[] = [];

    for (let i = 0; i < stops.length; i++) {
        const stopCache = await Redis.getCachedTrips(stops[i]);
        if (stopCache !== null) {
            logger.debug(`Trips for stopId ${stops[i]} are cached`);
            trips.push(...stopCache);
            stops.splice(i, 1); // remove from stops to be fetched
            i--;
        } else {
            logger.debug("Cache empty for stopId " + stops[i]);
        }
    }
    const errs: Set<CustomErr> = new Set(); // to prevent same error

    try {
        const tripsToBeCached: _TripsToBeCached = {};

        let stopsNotFound = [];
        const p: [stop: Stop, trips: Promise<tripFnReturn>][] = [];

        for (const agency of agencies) {
            const Cls = require(join(settings.agenciesPath, agency))
                .default as typeof Base;

            for (const _stopId of stops) {
                const s = Cls.stops.find(e => e.stopId === _stopId);
                if (!s) {
                    logger.debug(
                        "stopId " +
                            _stopId +
                            " of agency " +
                            Cls.agency.name +
                            " not found"
                    );
                    stopsNotFound.push(_stopId);
                    continue;
                }
                tripsToBeCached[s.stopId] = [];
                p.push([s, Cls.getTrips(s, 10)]);
            }
        }
        const tripReturns = await Promise.all(p.map(e => e[1]));

        for (const [i, t] of tripReturns.entries()) {
            const stopId = p[i][0].stopId;

            if (isFnErr(t)) {
                errs.add(t.err);
                if (t.err.status >= 400) {
                    // Rrror, trips were not fetched
                    delete tripsToBeCached[stopId];
                }
            } else {
                // Trip successfully fetched
                trips.push(...t);
                tripsToBeCached[stopId].push(...t);
            }
        }

        if (stopsNotFound.length > 0) {
            const _s: string[] = [];
            for (const s of stopsNotFound) {
                if (
                    stopsNotFound.filter(e => e === s).length ===
                    agencies.length
                ) {
                    _s.push(s);
                }
            }
            if (_s.length > 0) {
                throw new ReferenceError([...new Set(_s)].join(", "));
            }
        }

        if (Object.keys(tripsToBeCached).length > 0) {
            logger.debug(
                `Caching trips for ${Object.keys(tripsToBeCached).length} stops`
            );

            const p = [];
            for (const stopId in tripsToBeCached) {
                p.push(Redis.cacheTrips(stopId, tripsToBeCached[stopId]));
            }
            const r = await Promise.all(p);
            if (!r.every(v => !!v)) {
                logger.warn("Error while caching trips");
            }
        }

        trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);

        if (trips.length === 0) {
            if (errs.size === 0) {
                return {
                    err: { msg: "No trip planned", status: 200 }
                };
            }
            // if ([...errs].find(e => e.status < 400))*/
            logger.debug("No trips and " + errs.size + " errors");
            throw new Error([...errs].map(e => e.msg).join(", "));
        }

        return { trips: trips.slice(0, limit || undefined) };
    } catch (err) {
        if (err instanceof ReferenceError) {
            logger.debug("Stop not found");
            return {
                err: { msg: `Stop ${err.message} not found`, status: 400 }
            };
        } else {
            const status = Math.max(...[...errs].map(e => e.status));
            if (status < 400) logger.debug(err);
            else logger.error(err);
            const msg =
                status < 400
                    ? [...errs]
                          .sort((a, b) => a.status - b.status)
                          .map(e => e.msg)[0]
                    : "Error while loading data";
            return {
                err: {
                    msg,
                    status
                }
            };
        }
    }
};
