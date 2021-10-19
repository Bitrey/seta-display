// Naming convention: httpmethodUrlpath

import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { join } from "path";
import { logger } from "../../shared/logger";
import { stopReqService } from "../services";
import { getAgencyNames } from "../shared/getAgencyNames";
import { getAllStops } from "../shared/getAllStops";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

export const stopReqSchema = Joi.object({
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
                    return helper.error("Agency not found");
                }
                return true;
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
                    return helper.error("Stop not found");
                }
                return true;
            })
    )
});

export const stopReqController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let { agency, stopId } = req.body as {
        agency: string | string[];
        stopId: string | string[];
    };

    try {
        agency = JSON.parse(agency as any);
    } catch (err) {}

    try {
        stopId = JSON.parse(stopId as any);
    } catch (err) {}

    const stops = Array.isArray(stopId) ? stopId : [stopId];
    const agencies = Array.isArray(agency) ? agency : [agency];

    const { value, error } = stopReqSchema.validate({ stops, agencies });
    if (error) {
        return next(error.message);
    }

    const { trips, err } = await stopReqService({ stops, agencies });
    if (err) {
        return next(err);
    }

    res.json(trips);
};
