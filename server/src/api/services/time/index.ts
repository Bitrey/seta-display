import moment from "moment";
import { join } from "path";
import { Base } from "../../../agencies/Base";
import { CustomErr } from "../../../interfaces/CustomErr";
import { settings } from "../../../settings";
import { logger } from "../../../shared/logger";

interface TimeReq {
    agency: string;
    format?: string;
}

export const timeService = ({
    agency,
    format
}: TimeReq): { time?: string; err?: CustomErr } => {
    try {
        const Cls = require(join(settings.agenciesPath, agency))
            .default as typeof Base;
        return {
            time: moment()
                .tz(Cls.agency.timezone)
                .format(format || "hh:mm")
        };
    } catch (err) {
        logger.error(err);
        return { err: { msg: "Error while loading time", status: 500 } };
    }
};
