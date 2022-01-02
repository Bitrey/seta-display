// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { logger } from "../../../shared/logger";
import { tripsService } from "../../services/trips";
import { getAgencyNames } from "../../shared/getAgencyNames";

export const tripsSchema = Joi.object({
    // displayId: Joi.string()
    //     .min(1)
    //     .required()
    //     .custom((v, helper) => {
    //         // DEBUG: check that displayId exists in the displays database
    //         return true;
    //     }),
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
        ),
    stops: Joi.array()
        .min(1)
        .items(
            Joi.string()
                .min(1)
                .required()
                // this takes too much, check if stops exist in service
                // .custom((v, helper) => {
                //     try {
                //         v = JSON.parse(v);
                //     } catch (err) {}

                //     if (
                //         !getAllStops()
                //             // (console.log(Joi.ref("agencies")), undefined)
                //             // Joi.ref("agencies").toString())
                //             .map(e => e.stopId.toString())
                //             .includes(v.toString())
                //     ) {
                //         return helper.error("any.error");
                //     }
                //     return true;
                // })
                .messages({
                    "string.min": "format must be at least 1 character long",
                    "any.required": "stops field is required",
                    "any.error": "Stop not found"
                })
        ),
    limit: Joi.number()
        .min(1)
        .messages({ "number.min": "limit must be at least 1" })
});

export const tripsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, stopId, limit } = req.body as {
        agency: string | string[];
        stopId: string | string[];
        limit?: number;
    };

    try {
        agency = JSON.parse(agency as string);
    } catch (err) {}

    try {
        stopId = JSON.parse(stopId as string);
    } catch (err) {}

    const stops = (Array.isArray(stopId) ? stopId : [stopId]).map(e =>
        e.toString()
    );
    const agencies = Array.isArray(agency) ? agency : [agency];

    const { error } = tripsSchema.validate({ stops, agencies, limit });
    if (error) {
        logger.debug("Stop controller validation failed");
        return next({ msg: error.message, status: 400 });
    }

    const { trips, err } = await tripsService({ stops, agencies, limit });
    if (err) {
        logger.debug("Stop service failed");
        return next({ msg: err.msg, status: err.status });
    }

    res.json(trips);
};
