import { readFile } from "fs";
import moment from "moment";
import { settings } from "../../../settings";
import { Ad } from "../../../interfaces/Ad";
import { promisify } from "util";
import { logger } from "../../../shared/logger";
import { CustomErr } from "../../../interfaces/CustomErr";

interface AdsReq {
    agency: string;
    limit?: number;
    fromDate?: moment.Moment;
    toDate?: moment.Moment;
}

export const adsService = async ({
    agency,
    fromDate,
    toDate,
    limit
}: AdsReq): Promise<{ ads?: Ad[]; err?: CustomErr }> => {
    let ads: Ad[];

    try {
        const readFilePromise = promisify(readFile);

        ads = (await readFilePromise(settings.adsFilePath, {
            encoding: "utf-8"
        })) as any;

        ads.sort((a, b) => b.date.diff(a.date));

        logger.debug("Ads service successful");

        return {
            ads: ads
                .filter(
                    e =>
                        e.agency === agency &&
                        (fromDate ? e.date.isSameOrAfter(fromDate) : true) &&
                        (toDate ? e.date.isSameOrBefore(toDate) : true)
                )
                .slice(0, limit || undefined)
        };
    } catch (err) {
        logger.error("Error while loading ads");
        logger.error(err);
        return { err: { msg: "Error while loading ads", status: 500 } };
    }
};
