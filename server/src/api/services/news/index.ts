import { join } from "path";
import { logger } from "../../../shared/logger";
import { Base } from "../../../agencies/Base";
import { CustomErr } from "../../../interfaces/CustomErr";
import { isFnErr } from "../../../interfaces/FnErr";
import { News } from "../../../interfaces/News";
import { newsFnReturn } from "../../../interfaces/newsFn";
import axios from "axios";
import { settings } from "../../../settings";

interface NewsReq {
    agencies: string | string[];
    limit?: number;
    fromDate?: moment.Moment;
    toDate?: moment.Moment;
}

export const newsService = async ({
    agencies,
    limit,
    fromDate,
    toDate,
    ...args
}: NewsReq): Promise<{ news?: News[]; err?: CustomErr }> => {
    const news: News[] = [];

    try {
        const p: Promise<newsFnReturn>[] = [];
        for (const agency of agencies) {
            const Cls = require(join(settings.agenciesPath, agency))
                .default as typeof Base;
            if (typeof Cls.getNews === "function") {
                p.push(Cls.getNews(args));
            }
        }
        const newsReturns = await Promise.all(p);
        for (const n of newsReturns) {
            if (isFnErr(n)) {
                return { err: n.err };
            }
            news.push(...n);
        }

        news.sort((a, b) => (a.date && b.date ? b.date.diff(a.date) : 0));

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

        return {
            news: [...news]
                .slice(0, limit || undefined)
                .filter(e =>
                    e.date
                        ? (fromDate ? e.date.isSameOrAfter(fromDate) : true) &&
                          (toDate ? e.date.isSameOrBefore(toDate) : true)
                        : true
                )
        };
    } catch (err) {
        logger.error("Error while running news service");
        logger.error(err);
        return {
            err: {
                msg: "Error while fetching news",
                status: axios.isAxiosError(err) ? 400 : 500
            }
        };
    }
};
