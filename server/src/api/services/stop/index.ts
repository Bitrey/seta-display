import { logger } from "../../../shared/logger";
import { CustomErr } from "../../../interfaces/CustomErr";
import { IStop } from "../../../interfaces/Stop";
import { getAllStops } from "../../shared/getAllStops";

interface StopReq {
    agency: string;
    stopId: string;
}

export const stopService = async ({
    agency,
    stopId
}: StopReq): Promise<{ stop?: IStop; err?: CustomErr }> => {
    try {
        const stop = getAllStops(agency).find(s => s.stopId === stopId);
        if (!stop) throw new ReferenceError();
        return { stop };
    } catch (err) {
        logger.error("Error while loading stop");

        if (err instanceof ReferenceError) {
            logger.error("Bad validation for stopService, stop doesn't exist");
        } else logger.error(err);

        return { err: { msg: "Error while loading stop", status: 500 } };
    }
};
