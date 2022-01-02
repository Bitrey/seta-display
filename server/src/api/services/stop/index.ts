import { logger } from "../../../shared/logger";
import { CustomErr } from "../../../interfaces/CustomErr";
import { getAllStops } from "../../shared/getAllStops";
import { Stop } from "../../../interfaces/Stop";

interface StopReq {
    agency: string;
    stopId: string;
}

export const stopService = async ({
    agency,
    stopId
}: StopReq): Promise<{ stop?: Stop; err?: CustomErr }> => {
    try {
        const stop = (await getAllStops(agency)).find(s => s === stopId);
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
