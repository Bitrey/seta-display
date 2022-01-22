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

export class AdsService {
    private static _cache: Ad[] | null = null;
    private static _lastRead: moment.Moment | null = null;

    public static async service({
        agency,
        fromDate,
        toDate,
        limit
    }: AdsReq): Promise<{ ads?: Ad[]; err?: CustomErr }> {
        let ads: Ad[];

        try {
            if (
                AdsService._cache &&
                AdsService._lastRead &&
                !(
                    moment().diff(AdsService._lastRead, "minutes") >
                    settings.adsCacheTimeMin
                )
            ) {
                logger.debug("Loading ads from cache");
                ads = AdsService._cache;
            } else {
                const readFilePromise = promisify(readFile);

                ads = JSON.parse(
                    await readFilePromise(settings.adsFilePath, {
                        encoding: "utf-8"
                    })
                ) as any;

                AdsService._cache = ads;
                AdsService._lastRead = moment();

                logger.debug("Ads successfully read from file, now caching");
            }

            ads = ads.map(e =>
                e.date && moment.parseZone(e.date).isValid()
                    ? { ...e, date: moment.parseZone(e.date) }
                    : e
            );

            ads.sort((a, b) => b.date.diff(a.date));

            logger.debug("Ads service successful");

            return {
                ads: ads
                    .filter(
                        e =>
                            e.agency === agency &&
                            (fromDate
                                ? e.date.isSameOrAfter(fromDate)
                                : true) &&
                            (toDate ? e.date.isSameOrBefore(toDate) : true)
                    )
                    .slice(0, limit || undefined)
            };
        } catch (err) {
            logger.error("Error while loading ads");
            logger.error(err);
            return { err: { msg: "Error while loading ads", status: 500 } };
        }
    }
}
