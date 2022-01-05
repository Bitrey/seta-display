// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { stopService } from "../../services/stop";
import { getAgencyNames } from "../../shared/getAgencyNames";
import { getAllStops } from "../../shared/getAllStops";

export const stopSchema = Joi.object({
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
    stopId: Joi.string().min(1).required().messages({
        "string.min": "stopId must be at least 1 character long",
        "any.required": "stopId field is required"
    })
    // additional validation inside the controller (if stop exists)
});

export const stopController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, stopId } = req.body as { agency: string; stopId: string };

    const { error } = stopSchema.validate({ agency, stopId });
    if (error) {
        return next({ msg: error.message, status: 400 });
    } else if (getAllStops(agency).findIndex(e => e.stopId === stopId) === -1) {
        return next({
            msg: `Stop ${stopId} of agency ${agency} not found`,
            status: 400
        });
    }

    const { stop, err } = await stopService({ agency, stopId });
    if (err) {
        return next({ msg: err.msg, status: err.status });
    }

    res.json(stop);
};
