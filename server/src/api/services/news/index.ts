import { join } from "path";
import { logger } from "../../../shared/logger";
import { Base } from "../../../agencies/Base";
import { isFnErr } from "../../../interfaces/FnErr";
import { News } from "../../../interfaces/News";
import { newsFnReturn } from "../../../interfaces/newsFn";
import axios from "axios";
import { settings } from "../../../settings";
import moment from "moment";

interface NewsReq {
    agencies: string[];
    limit?: number;
    fromDate?: moment.Moment;
    toDate?: moment.Moment;
}

interface _LastRead {
    [agencyName: string]: moment.Moment;
}

interface _NewsCache {
    [agencyName: string]: News[];
}

export class NewsService {
    private static _cache: _NewsCache = {};
    private static _lastRead: _LastRead = {};

    public static async service({
        agencies,
        limit,
        fromDate,
        toDate,
        ...args
    }: NewsReq) {
        const news: News[] = [];

        try {
            for (let i = 0; i < agencies.length; i++) {
                if (agencies[i] in NewsService._lastRead) {
                    // Check if news are too old
                    if (
                        moment().diff(
                            NewsService._lastRead[agencies[i]],
                            "minutes"
                        ) > settings.newsCacheTimeMin
                    ) {
                        delete NewsService._lastRead[agencies[i]];
                        i--;
                        continue;
                    }

                    logger.debug(
                        "Loading news from cache for agency " + agencies[i]
                    );
                    news.push(...NewsService._cache[agencies[i]]);
                    agencies.splice(i, 1);
                    i--;
                }
            }

            const p: [agencyName: string, news: Promise<newsFnReturn>][] = [];
            for (const agency of agencies) {
                const Cls = require(join(settings.agenciesPath, agency))
                    .default as typeof Base;
                if (typeof Cls.getNews === "function") {
                    p.push([agency, Cls.getNews(args)]);
                }
            }
            const newsReturns = await Promise.all(p.map(e => e[1]));
            for (const [i, n] of newsReturns.entries()) {
                if (isFnErr(n)) {
                    return { err: n.err };
                }

                news.push(...n);
                NewsService._cache[p[i][0]] = n;
                NewsService._lastRead[p[i][0]] = moment();
            }

            if (agencies.length > 0) {
                logger.debug(
                    "News successfully fetched for agencies=" +
                        agencies +
                        "; limit=" +
                        limit +
                        "; fromDate=" +
                        fromDate +
                        "; toDate=" +
                        toDate +
                        "; args=" +
                        JSON.stringify(args || {})
                );
            }

            news.sort((a, b) => (a.date && b.date ? b.date.diff(a.date) : 0));

            return {
                news: [...news]
                    .slice(0, limit || undefined)
                    .filter(e =>
                        e.date
                            ? (fromDate
                                  ? e.date.isSameOrAfter(fromDate)
                                  : true) &&
                              (toDate ? e.date.isSameOrBefore(toDate) : true)
                            : true
                    )
            };
        } catch (err) {
            logger.error(err);
            return {
                err: {
                    msg: "Error while fetching news",
                    status: axios.isAxiosError(err) ? 400 : 500
                }
            };
        }
    }
}
