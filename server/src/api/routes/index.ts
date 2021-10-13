import { Router } from "express";
import { display } from "../..";
import { Seta } from "../../agencies/seta";
import { logger } from "../../shared/logger";
export const router = Router();

logger.info("Loading API routes");

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
router.get("/:stopId", async (req, res) => {
    const { stopId } = req.params;
    if (typeof stopId !== "string") {
        return res.status(400).json({ err: "Invalid stopId" });
    }

    const s = display.stops.find(e => e.stopId === stopId);
    if (!s) {
        return res.status(404).json({ err: "Stop not found" });
    }

    return res.json(await Seta.getTrips(s, 10));
});
