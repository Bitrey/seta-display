import { Router } from "express";
import { logger } from "../../shared/logger";
import { newsController } from "../controllers/news";
export const router = Router();

logger.info("Loading API routes");

import { tripsController } from "../controllers/trips";
import { timeController } from "../controllers/time";
import { stopController } from "../controllers/stop";
import { adsController } from "../controllers/ads";

/**
 * @swagger
 *  components:
 *    schemas:
 *      AdsReq:
 *        type: object
 *        required:
 *          - agency
 *        properties:
 *          agency:
 *            type: string
 *            description: Name of the agency (all lowercase)
 *            example: seta
 *          fromDate:
 *            type: string
 *            format: date
 *            description: Starting ISO 8601 date to filter ads
 *            example: 2021-12-25T14:31:23.704Z
 *          toDate:
 *            type: string
 *            format: date
 *            description: Finishing ISO 8601 date to filter ads
 *            example: 2021-12-27T14:31:23.704Z
 *          limit:
 *            type: integer
 *            minimum: 1
 *            description: Limit the results
 *            example: 10
 */

/**
 * @openapi
 * /api/ads:
 *  post:
 *    description: Fetch ads for a specific agency
 *    tags:
 *      - api
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AdsReq'
 *    responses:
 *      '200':
 *        description: Ads
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Ad'
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
router.post("/ads", adsController);

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
 *            type: string
 *            description: ID of the stop
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
 *    parameters:
 *      - in: query
 *        name: stopId
 *        description: ID of the stop
 *        required: true
 *        schema:
 *          type: string
 *          example: MO2076
 *      - in: query
 *        name: agency
 *        description: Name of the agency (all lowercase)
 *        required: true
 *        schema:
 *          type: string
 *          example: seta
 *    responses:
 *      '200':
 *        description: Stop info
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
 *      TripsReq:
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
 *            description: ID of the stop (can be an array of stopIds)
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
 * /api/trips:
 *  post:
 *    description: Fetch trips with realtime information
 *    tags:
 *      - api
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/TripsReq'
 *    responses:
 *      '200':
 *        description: Array of Trip objects
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Trip'
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
router.post("/trips", tripsController);

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
 *            description: Name of the agency (all lowercase)
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
 *      Time:
 *        type: object
 *        required:
 *          - time
 *        properties:
 *          time:
 *            type: string
 *            description: Formatted time
 *            example: 09:45
 */

/**
 * @openapi
 * /api/time:
 *  post:
 *    description: Fetch current time on the server using the agency's timezone
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
 *        description: Current time in specified format
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Time'
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
