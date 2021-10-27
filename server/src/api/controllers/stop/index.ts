// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { join } from "path";
import { logger } from "../../../shared/logger";
import { stopService } from "../../services/stop";
import { getAgencyNames } from "../../shared/getAgencyNames";
import { getAllStops } from "../../shared/getAllStops";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

export const stopSchema = Joi.object({
    // displayId: Joi.string()
    //     .min(1)
    //     .required()
    //     .custom((v, helper) => {
    //         // DEBUG: check that displayId exists in the displays database
    //         return true;
    //     }),
    agencies: Joi.array().items(
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
    ),
    stops: Joi.array().items(
        Joi.string()
            .min(1)
            .required()
            .custom((v, helper) => {
                try {
                    v = JSON.parse(v);
                } catch (err) {}

                if (
                    !getAllStops()
                        // (console.log(Joi.ref("agencies")), undefined)
                        // Joi.ref("agencies").toString())
                        .map(e => e.stopId)
                        .includes(v)
                ) {
                    return helper.error("any.error");
                }
                return true;
            })
            .messages({
                "string.min": "format must be at least 1 character long",
                "any.required": "stops field is required",
                "any.error": "Stop not found"
            })
    )
});

export const stopController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, stopId } = req.body as {
        agency: string | string[];
        stopId: string | string[];
    };

    try {
        agency = JSON.parse(agency as string);
    } catch (err) {}

    try {
        stopId = JSON.parse(stopId as string);
    } catch (err) {}

    const stops = Array.isArray(stopId) ? stopId : [stopId];
    const agencies = Array.isArray(agency) ? agency : [agency];

    const { error } = stopSchema.validate({ stops, agencies });
    if (error) {
        return next({ msg: error.message, status: 400 });
    }

    const { trips, err } = await stopService({ stops, agencies });
    if (err) {
        return next({ msg: err, status: 500 });
    }

    res.json(trips);
};
