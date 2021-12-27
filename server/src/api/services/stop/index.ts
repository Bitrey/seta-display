import { join } from "path";
import { logger } from "../../../shared/logger";
import { Trip } from "../../../interfaces/Trip";
import { Base } from "../../../agencies/Base";
import { CustomErr } from "../../../interfaces/CustomErr";
import { tripFnReturn } from "../../../interfaces/tripFn";
import { isFnErr } from "../../../interfaces/FnErr";

interface StopReq {
    agencies: string | string[];
    stops: string | string[];
    limit?: number;
}

const fPath = join(__dirname, "../../../agencies");

export const stopService = async ({
    agencies,
    stops,
    limit
}: StopReq): Promise<{ trips?: Trip[]; err?: CustomErr }> => {
    const trips: Trip[] = [];
    const errs: Set<CustomErr> = new Set(); // to prevent same error
    try {
        let stopsNotFound = [];
        const p: Promise<tripFnReturn>[] = [];
        const C: typeof Base[] = [];
        for (const agency of agencies) {
            const Cls = require(join(fPath, agency)).default as typeof Base;
            for (const _stopId of stops) {
                const s = Cls.stops.find(e => e.stopId.toString() === _stopId);
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
                p.push(Cls.getTrips(s, 10));
                C.push(Cls);
            }
        }
        const tripReturns = await Promise.all(p);
        tripReturns.forEach((t, i) => {
            if (isFnErr(t)) {
                errs.add(t.err);
            } else {
                trips.push(...t);
            }
        });
        if (stopsNotFound.length > 0) {
            // const _s = [];
            // for (const stop of stopsNotFound) {
            //     for (const agency of agencies) {
            //         if (
            //             (
            //                 require(join(fPath, agency)).default as typeof Base
            //             ).stops.filter(e => e.stopId === stop).length ===
            //             agencies.length
            //         ) {
            //             _s.push(stop);
            //         }
            //     }
            // }
            // if (_s.length > 0) {
            // throw new ReferenceError(_s.join(", "));
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
            // }
        }

        trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);
        if (trips.length === 0) {
            if (errs.size === 0) {
                logger.debug("No trips and " + errs.size + " errors");
                throw new Error("Error while loading data");
            } /* if ([...errs].find(e => e.status < 400))*/ else {
                logger.debug("No trips and no errors");
                throw new Error([...errs].map(e => e.msg).join(", "));
            }
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
