import moment from "moment";
import { join } from "path";
import { Base } from "../../../agencies/Base";
import { logger } from "../../../shared/logger";

const fPath = join(__dirname, "../../../agencies");

interface TimeReq {
    agency: string;
    format?: string;
}

export const timeService = ({
    agency,
    format
}: TimeReq): { time?: string; err?: string } => {
    try {
        const Cls = require(join(fPath, agency)).default as typeof Base;
        return {
            time: moment()
                .tz(Cls.agency.timezone)
                .format(format || "hh:mm")
        };
    } catch (err) {
        logger.error(err);
        return { err: "Error while loading time" };
    }
};
