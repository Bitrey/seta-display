import { join } from "path";
import { Base } from "../../agencies/Base";
import { Stop } from "../../interfaces/Stop";
import { settings } from "../../settings";
import { logger } from "../../shared/logger";

export const getAllStops = (agencyName?: string): Stop[] => {
    const agencies = Array.isArray(agencyName) ? agencyName : [agencyName];
    const stops: Stop[] = [];

    try {
        agencies.forEach(a => {
            const Cls = require(join(settings.agenciesPath, a))
                .default as typeof Base;
            stops.push(...Cls.stops);
        });
    } catch (err) {
        logger.error("Error in getAllStops");
        logger.error(err);
    }

    return stops;
};
