import { createClient, RedisClientOptions } from "redis";
import { Agency } from "../../interfaces/Agency";
import { isStop, RedisStop, Stop } from "../../interfaces/Stop";
import { settings } from "../../settings";
import { logger } from "../../shared/logger";

// Stops are saved as <agencyName>_stops_<stopId>: Stop

interface _StopRedisHash {
    stop: {
        key: string; // stopId
        values: [string, string][]; // props
    };
    routes: string[];
}

class Redis {
    client;
    isConnected = false;

    constructor(
        options?:
            | Omit<RedisClientOptions<never, Record<string, never>>, "modules">
            | undefined
    ) {
        this.client = createClient(options);
        this.client.on("ready", () => {
            logger.info("Connected to Redis database");
            this.isConnected = true;
        });
    }

    public async getStopIds(agency: Agency): Promise<string[] | null> {
        const arr = await this.client.sMembers(this._getStopIdsKey(agency));
        return arr.length !== 0 ? arr : null;
    }

    /**
     * @returns number of stopIds added to the set
     */
    public async saveStopIds(
        agency: Agency,
        stopIds: string[]
    ): Promise<number> {
        return await this.client.sAdd(this._getStopIdsKey(agency), stopIds);
    }

    public async getRoutes(
        agency: Agency,
        stopId: string
    ): Promise<string[] | null> {
        const k = this._getStopRoutesKey(agency, stopId);
        const arr = await this.client.sMembers(k);
        return arr.length !== 0 ? arr : null;
    }

    public async saveRoutes(
        agency: Agency,
        stopId: string,
        routes: string[]
    ): Promise<number> {
        const k = this._getStopRoutesKey(agency, stopId);
        return await this.client.sAdd(k, routes);
    }

    public async getStop(agency: Agency, stopId: string): Promise<Stop | null> {
        const k = this._getStopKey(agency, stopId);
        if (!(await this.client.exists(k))) return null;

        const redisStop: RedisStop = (await this.client.hGetAll(k)) as any;
        const routes: string[] = [];

        // Push routes
        if (redisStop.routesSetName) {
            const k = this._getStopRoutesKey(agency, stopId);
            routes.push(...(await this.client.sMembers(k)));
        }

        const stop = {};

        for (const [key, val] of Object.entries(redisStop)) {
            // convert to number when possible
            (<any>stop)[key] =
                !isNaN(parseFloat(val)) &&
                Number.isSafeInteger(Math.round(parseFloat(val)))
                    ? parseFloat(val)
                    : val;
        }

        if (!isStop(stop)) {
            logger.error("Redis stop has an invalid format");
            logger.error(redisStop);
            return null;
        }

        // Assign routes
        stop.routes = routes;

        return stop;
    }

    public async saveStop(agency: Agency, stop: Stop): Promise<boolean> {
        const redisStop: Record<string, string> = {};

        if (Array.isArray(stop.routes)) {
            const k = this._getStopRoutesKey(agency, stop.stopId);
            redisStop.routesSetName = k;

            // Save routes
            if (!(await this.client.exists(k))) {
                await this.client
                    .multi()
                    .sAdd(k, stop.routes)
                    .expire(k, settings.cacheExpiryTime)
                    .exec();
            }
        }

        for (const [key, val] of Object.entries(stop)) {
            if (
                typeof val !== "object" &&
                typeof val !== "function" &&
                typeof val.toString === "function"
            ) {
                (<any>redisStop)[key] = val.toString();
            } else continue;
        }

        if (!isStop(redisStop)) {
            logger.error("Can't save stop to Redis, invalid format");
            logger.error(redisStop);
            return false;
        }

        const k = this._getStopKey(agency, stop.stopId);
        await this.client
            .multi()
            .hSet(k, redisStop)
            .expire(k, settings.cacheExpiryTime)
            .exec();

        return true;
    }

    private _getStopKey(agency: Agency, stopId: string) {
        return `${agency.name}_stop_${stopId}`;
    }

    private _getStopIdsKey(agency: Agency) {
        return `${agency.name}_stopIds`;
    }

    private _getStopRoutesKey(agency: Agency, stopId: string) {
        return `${agency.name}_stopRoutes_${stopId}`;
    }
}

export const redis = new Redis();
