import { Router } from "express";
import { display } from "../..";
import { Seta } from "../../agencies/seta";
import { logger } from "../../shared/logger";
export const router = Router();

logger.info("Loading API routes");

import { body, param, validationResult } from "express-validator";
import { Stop } from "../../interfaces/Stop";
import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { Base } from "../../agencies/Base";

const fPath = join(__dirname, "../../agencies");
logger.info(`Agencies dir path is "${fPath}"`);

/**
 * @swagger
 * /api/{stopId}:
 *  get:
 *    description: Changes username
 *    tags:
 *      - account
 *    parameters:
 *      - in: path
 *        name: stopId
 *        schema:
 *          type: string
 *        required: true
 *        description: stopId of the stop
 *      - in: query
 *        name: agency
 *        schema:
 *          type: string
 *        required: false
 *        description: Agency of the stop. Fetches from all agencies if not specified
 *    responses:
 *      '200':
 *        description: Realtime info
 *      '400':
 *        description: Bad request
 *      '500':
 *        description: Server error
 */
router.get(
    "/:agency/:stopId",
    param("agency").isString().notEmpty().withMessage("Invalid agency"),
    param("agency").custom(v => {
        if (
            !readdirSync(fPath)
                .filter(e => lstatSync(join(fPath, e)).isDirectory())
                .includes(v)
        ) {
            throw new Error("Agency not found");
        }
        return true;
    }),
    param("stopId").isString().notEmpty().withMessage("Invalid stopId"),
    param("stopId").custom(v => {
        if (!display.stops.find(e => e.stopId === v)) {
            throw new Error("Stop not found");
        }
        return true;
    }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(400)
                .json({ err: errors.array().map(e => e.msg) });
        }

        const { stopId } = req.params as { stopId: string };
        const s = display.stops.find(e => e.stopId === stopId);

        const Cls = require(join(
            fPath,
            (req.params as { agency: string }).agency
        ) as string).default as typeof Base;

        const trips = await Cls.getTrips(s as Stop, 10);
        return res.json(trips);
    }
);
