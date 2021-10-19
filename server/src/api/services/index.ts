import { join } from "path";
import { logger } from "../../shared/logger";
import { Trip } from "../../interfaces/Trip";
import { Base } from "../../agencies/Base";

interface StopReq {
    agencies: string | string[];
    stops: string | string[];
}

const fPath = join(__dirname, "../../agencies");

export const stopReqService = async ({
    agencies,
    stops
}: StopReq): Promise<{ trips?: Trip[]; err?: string }> => {
    try {
        const trips: Trip[] = [];
        const errs: Set<string> = new Set(); // to prevent same error
        for (const agency of agencies) {
            const Cls = require(join(fPath, agency)).default as typeof Base;
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
                    continue;
                }
                const t = await Cls.getTrips(s, 10);
                if (Cls.isTripsErr(t)) {
                    errs.add(t.err);
                } else {
                    trips.push(...t);
                }
            }
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
        logger.error(err);
        return { err: "Error while loading data" };
    }
};
