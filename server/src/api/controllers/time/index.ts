// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import moment from "moment";
import { join } from "path";
import { logger } from "../../../shared/logger";
import { timeService } from "../../services/time";
import { getAgencyNames } from "../../shared/getAgencyNames";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

export const timeSchema = Joi.object({
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
    format: Joi.string()
        .min(1)
        .custom((v, helper) => {
            if (!moment(moment().format(v), v).isValid()) {
                return helper.error("any.error");
            }
            return true;
        })
        .messages({
            "string.min": "format must be at least 1 character long",
            "any.error": "Invalid time format"
        })
});

export const timeController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { agency, format } = req.body as { agency: string; format?: string };

    const { error } = timeSchema.validate({ agency, format });
    if (error) {
        return next({ msg: error.message, status: 400 });
    }

    const { time, err } = timeService({ agency, format });
    if (err) {
        return next({ msg: err, status: 500 });
    }

    res.json({ time } as { time: string });
};
