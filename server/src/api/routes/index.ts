import { Router } from "express";
import { logger } from "../../shared/logger";
import { newsController } from "../controllers/news";
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
 *            oneOf:
 *              - type: string
 *              - type: array
 *                items:
 *                  type: string
 *            description: Name of the agency (all lowercase)
 *            example: seta
 *          limit:
 *            type: integer
 *            minimum: 1
 *            description: Limit the results
 *            example: 10
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

/**
 * @swagger
 *  components:
 *    schemas:
 *      NewsReq:
 *        type: object
 *        required:
 *          - agency
 *        properties:
 *          agency:
 *            oneOf:
 *              - type: string
 *              - type: array
 *                items:
 *                  type: string
 *            description: Name of the agency (all lowercase)
 *            example: seta
 *          fromDate:
 *            type: string
 *            format: date
 *            description: Starting ISO 8601 date to filter news
 *            example: 2021-12-25T14:31:23.704Z
 *          toDate:
 *            type: string
 *            format: date
 *            description: Finishing ISO 8601 date to filter news
 *            example: 2021-12-27T14:31:23.704Z
 *          limit:
 *            type: integer
 *            minimum: 1
 *            description: Limit the results
 *            example: 10
 */

/**
 * @openapi
 * /api/news:
 *  post:
 *    description: Fetch news for a specific agency
 *    tags:
 *      - api
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/NewsReq'
 *    responses:
 *      '200':
 *        description: News
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/News'
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
router.post("/news", newsController);
