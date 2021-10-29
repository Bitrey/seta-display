import { join } from "path";
import { logger } from "../../../shared/logger";
import { Trip } from "../../../interfaces/Trip";
import { Base } from "../../../agencies/Base";
import { CustomErr } from "../../../interfaces/CustomErr";

interface StopReq {
    agencies: string | string[];
    stops: string | string[];
}

const fPath = join(__dirname, "../../../agencies");

export const stopService = async ({
    agencies,
    stops
}: StopReq): Promise<{ trips?: Trip[]; err?: CustomErr }> => {
    try {
        const trips: Trip[] = [];
        const errs: Set<string> = new Set(); // to prevent same error
        for (const agency of agencies) {
            const Cls = require(join(fPath, agency)).default as typeof Base;
            let stopFound = false;
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
                    continue;
                }
                stopFound = true;
                const t = await Cls.getTrips(s, 10);
                if (Cls.isTripsErr(t)) {
                    errs.add(t.err);
                } else {
                    trips.push(...t);
                }
            }
            if (!stopFound) throw new ReferenceError();
        }

        trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);
        if (trips.length === 0) {
            if (errs.size === 0) {
                throw new Error("Error while loading data");
            } else {
                throw new Error([...errs].join(", "));
            }
        }
        return { trips };
    } catch (err) {
        if (err instanceof ReferenceError) {
            logger.debug("Stop not found");
            return { err: { msg: "Stop not found", status: 400 } };
        } else {
            logger.error(err);
            return { err: { msg: "Error while loading data", status: 500 } };
        }
    }
};
