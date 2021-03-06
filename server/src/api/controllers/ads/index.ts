// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import moment from "moment";
import { AdsService } from "../../services/ads";
import { getAgencyNames } from "../../shared/getAgencyNames";

interface AdsReq {
    agency: string;
    limit?: number;
    fromDate?: moment.Moment;
    toDate?: moment.Moment;
}

export const adsSchema = Joi.object({
    agency: Joi.string()
        .min(1)
        .required()
        .custom((v, helper) => {
            if (!getAgencyNames().includes(v)) {
                return helper.error("any.error");
            }
            return true;
        })
        .messages({
            "string.min": "agency must be at least 1 character long",
            "any.required": "agency field is required",
            "any.error": "Agency not found"
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

export const adsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, fromDate, toDate, limit } = req.body as {
        agency: string;
        limit?: number;
        fromDate?: moment.Moment;
        toDate?: moment.Moment;
    };

    const { error } = adsSchema.validate({ agency, fromDate, toDate, limit });
    if (error) {
        return next({
            msg: error.message || "Data validation failed",
            status: 400
        });
    }

    if (fromDate) fromDate = moment.parseZone(fromDate);
    if (toDate) toDate = moment.parseZone(toDate);

    const { ads, err } = await AdsService.service({
        agency,
        fromDate,
        toDate,
        limit
    });
    if (err) {
        return next({
            msg: err.msg || "Error while loading data",
            status: err.status || 500
        });
    }

    res.json(ads);
};
