// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { join } from "path";
import { logger } from "../../../shared/logger";
import { newsService } from "../../services/news";
import { getAgencyNames } from "../../shared/getAgencyNames";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

export const newsSchema = Joi.object({
    agencies: Joi.array()
        .min(1)
        .items(
            Joi.string()
                .min(1)
                .required()
                .custom((v, helper) => {
                    // prettier-ignore
                    try {
                    v = JSON.parse(v);
                } catch (err) {}

                    if (!getAgencyNames().includes(v)) {
                        return helper.error("any.error");
                    }
                    return true;
                })
                .messages({
                    "string.min": "format must be at least 1 character long",
                    "any.required": "agencies field is required",
                    "any.error": "Agency not found"
                })
        )
        .messages({
            "array.min":
                "agency must be a string or an array with at least one agency"
        }),
    fromDate: Joi.string().optional().isoDate().messages({
        "string.isoDate": "fromDate date must be in valid ISO 8601 date format",
        "any.error": "Invalid fromDate"
    }),
    toDate: Joi.string().optional().isoDate().messages({
        "string.isoDate": "toDate date must be in valid ISO 8601 date format",
        "any.error": "Invalid toDate"
    }),
    limit: Joi.number()
        .optional()
        .min(1)
        .messages({ "number.min": "limit must be at least 1" })
});

export const newsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, fromDate, toDate, limit, ...rest } = req.body as {
        agency: string | string[];
        fromDate?: string;
        toDate?: string;
        limit?: number;
    };

    try {
        agency = JSON.parse(agency as string);
    } catch (err) {}

    const agencies = Array.isArray(agency) ? agency : [agency];

    const { error } = newsSchema.validate({
        agencies,
        fromDate,
        toDate,
        limit
    });
    if (error) {
        logger.debug("News controller validation failed");
        return next({ msg: error.message, status: 400 });
    }

    const { news, err } = await newsService({
        agencies,
        fromDate: fromDate as any,
        toDate: toDate as any,
        limit,
        ...rest
    });
    if (err) {
        logger.debug("News service failed");
        return next({ msg: err.msg, status: err.status });
    }

    res.json(news);
};
