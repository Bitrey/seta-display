// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import moment from "moment";
import { timeService } from "../../services/time";
import { getAgencyNames } from "../../shared/getAgencyNames";

export const timeSchema = Joi.object({
    agency: Joi.string()
        .min(1)
        .required()
        .custom(async (v, helper) => {
            if (!(await getAgencyNames()).includes(v)) {
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
        return next({ msg: err.msg, status: err.status });
    }

    res.json({ time } as { time: string });
};
