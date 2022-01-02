import { join } from "path";
import { Base } from "../../agencies/Base";
import { Stop } from "../../interfaces/Stop";
import { settings } from "../../settings";
import { logger } from "../../shared/logger";

export const getAllStops = async (agencyName?: string): Promise<string[]> => {
    const agencies = Array.isArray(agencyName) ? agencyName : [agencyName];
    const stops: string[] = [];

    try {
        for (const a of agencies) {
            const Cls = require(join(settings.agenciesPath, a))
                .default as typeof Base;
            stops.push(...(await Cls.getStopIds()));
        }
    } catch (err) {
        logger.error("Error in getAllStops");
        logger.error(err);
    }

    return stops;
};
