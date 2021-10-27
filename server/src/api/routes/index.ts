import { Router } from "express";
import { logger } from "../../shared/logger";
export const router = Router();

logger.info("Loading API routes");

import { stopController } from "../controllers/stop";
import { timeController } from "../controllers/time";

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
router.post("/stop", stopController);

/**
 * @swagger
 *  components:
 *    schemas:
 *      TimeReq:
 *        type: object
 *        required:
 *          - agency
 *        properties:
 *          agency:
 *            type: string
 *            description: Agency - needed in order to get the correct timezone
 *            example: seta
 *          format:
 *            type: string
 *            description: Moment.js time format
 *            example: hh:mm
 */

/**
 * @swagger
 *  components:
 *    schemas:
 *      TimeRes:
 *        type: object
 *        required:
 *          - time
 *        properties:
 *          time:
 *            type: string
 *            description: Formatted time
 *            example: MO2076
 */

/**
 * @openapi
 * /api/time:
 *  post:
 *    description: Fetch current time on the server
 *    tags:
 *      - api
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/TimeReq'
 *    responses:
 *      '200':
 *        description: Current time
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/TimeRes'
 *      '500':
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 */
router.post("/time", timeController);
