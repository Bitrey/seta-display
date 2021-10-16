import { Router } from "express";
import { display } from "../..";
import { logger } from "../../shared/logger";
export const router = Router();

logger.info("Loading API routes");

import { body, validationResult } from "express-validator";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { Base } from "../../agencies/Base";
import { Trip } from "../../interfaces/Trip";
import { ResErr } from "../../interfaces/ResErr";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

/**
 * @swagger
 *  components:
 *    schemas:
 *      StopReq:
 *        type: object
 *        required:
 *          - agency
 *          - stopId
 *        properties:
 *          stopId:
 *            oneOf:
 *              - type: string
 *              - type: array
 *                items:
 *                  type: string
 *            description: Stop code
 *            example: MO2076
 *          agency:
 *            type: string
 *            description: Name of the agency (all lowercase)
 *            example: seta
 */

/**
 * @openapi
 * /api/stop:
 *  post:
 *    description: Fetch realtime information for a stop
 *    tags:
 *      - api
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/StopReq'
 *    responses:
 *      '200':
 *        description: Realtime info
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Stop'
 *      '400':
 *        description: Bad request
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '500':
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 */
router.post(
    "/stop",
    body("agency")
        .trim()
        .custom(v => {
            // prettier-ignore
            const agencyNames = readdirSync(fPath).filter(e => lstatSync(join(fPath, e)).isDirectory());
            try {
                v = JSON.parse(v);
            } catch (err) {}
            // prettier-ignore
            if (!v || (typeof v !== "string" && (!Array.isArray(v) || v.some(u => !u)))) {
                throw new Error("Invalid agency (must be string or array of strings)");
            } else if ((Array.isArray(v) ? v : [v]).some(u => !agencyNames.includes(u))) {
                throw new Error("Agency not found");
            }
            return true;
        }),
    body("stopId")
        .trim()
        .custom(v => {
            try {
                v = JSON.parse(v);
            } catch (err) {}
            // prettier-ignore
            if (!v || (typeof v !== "string" && (!Array.isArray(v) || v.some(e => !e)))) {
                throw new Error("Invalid stopId (must be string or array of strings)");
            } else if ((Array.isArray(v) ? v : [v]).some(u => !display.stops.find(e => e.stopId === u))) {
                throw new Error("Stop not found");
            }
            return true;
        }),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    err: errors
                        .array()
                        .map(e => e.msg)
                        .join(", ")
                } as ResErr);
            }

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

            const trips: Trip[] = [];
            const errs: Set<string> = new Set(); // to prevent same error
            for (const agency of agencies) {
                const Cls = require(join(fPath, agency)).default as typeof Base;
                for (const _stopId of stops) {
                    const s = display.stops.find(e => e.stopId === _stopId);
                    if (!s) {
                        logger.debug(
                            "stopId " +
                                _stopId +
                                " of agency " +
                                Cls.agency.name +
                                " not found"
                        );
                        continue;
                    }
                    const t = await Cls.getTrips(s, 10);
                    if (Cls.isTripsErr(t)) {
                        errs.add(t.err);
                    } else {
                        trips.push(...t);
                    }
                }
            }

            trips.sort((a, b) => a.realtimeArrival - b.realtimeDeparture);
            return res.json(
                trips.length === 0
                    ? errs.size === 0
                        ? <ResErr>{ err: "Error while loading data" }
                        : <ResErr>{ err: [...errs].join(", ") }
                    : trips
            );
        } catch (err) {
            logger.error(err);
            res.status(400).json({ err: "Error while loading data" } as ResErr);
        }
    }
);
