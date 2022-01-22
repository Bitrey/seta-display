import { createClient } from "redis";
import redis from "redis";
import { Trip } from "../interfaces/Trip";
import { logger } from "../shared/logger";
import { Stop } from "../interfaces/Stop";
import { settings } from "../settings";

/*
    <stop name>: <number of cached trips>
    <stop name>_<index>: <trip object>
    Example
    MO2076: 4
    means that there will be the following trips
    MO2076_0, MO2076_1, MO2076_2, MO2076_3
 */
export class Redis {
    private static _client: redis.RedisClientType<any> | null;

    public static async getClient(): Promise<redis.RedisClientType<any> | null> {
        try {
            if (!Redis._client) {
                const newClient = createClient({ url: process.env.REDIS_URL });
                logger.info("Connecting to Redis...");
                await newClient.connect();
                logger.info("Connected to Redis");
                this._client = newClient;
                // await Redis._waitForConnection(newClient);
            }
            return Redis._client as redis.RedisClientType<any>;
        } catch (err) {
            logger.error("Error while connecting to Redis");
            logger.error(err);
            return null;
        }
    }

    private static _getStopKeyName(stopId: string, index: number): string {
        return stopId + "_" + index;
    }

    // private static _waitForConnection(
    //     client: redis.RedisClientType<any>
    // ): Promise<void> {
    //     return new Promise((resolve, reject) => {
    //         const t = setTimeout(reject, settings.redisConnectionTimeoutMs);
    //         client.once("ready", () => {
    //             clearTimeout(t);
    //             resolve();
    //         });
    //     });
    // }

    private static _valuesToStr(o: any): Record<string, string> {
        Object.keys(o).forEach(k => {
            if (typeof o[k] === "object") {
                return o[k].toString();
            }

            o[k] = "" + o[k];
        });

        return o;
    }

    private static async _cacheTrip(
        stopId: string,
        trip: Trip,
        index: number
    ): Promise<boolean> {
        const client = await Redis.getClient();
        if (!client) return false;

        const key = Redis._getStopKeyName(stopId, index);

        await client.hSet(key, Redis._valuesToStr(trip));
        await client.expire(key, settings.redisCacheSec);

        return true;
    }

    public static async cacheTrips(
        stopId: string,
        trips: Trip[]
    ): Promise<boolean> {
        try {
            const client = await Redis.getClient();
            if (!client) throw new Error("Client is null");

            const p: Promise<any>[] = [];
            for (const [i, t] of trips.entries()) {
                p.push(Redis._cacheTrip(stopId, t, i));
            }

            const l = trips.length.toString();
            await Promise.all([
                ...p,
                client.setEx(stopId, settings.redisCacheSec, l)
            ]);
            logger.debug(`Cached stopId ${stopId} with ${l} trips`);

            return true;
        } catch (err) {
            logger.error(
                `Redis error while caching ${trips.length} trips for stopId ${stopId}`
            );
            logger.error(err);
            return false;
        }
    }

    public static async getCachedTrips(stopId: string): Promise<Trip[] | null> {
        try {
            const client = await Redis.getClient();
            if (!client) throw new Error("Client is null");

            // logger.debug("Running getCachedTrips for stopId " + stopId);
            const l = await client.get(stopId);
            if (!l) return null;

            // logger.debug(`There are ${l} cached trips for stopId ${stopId}`);

            const p: Promise<any>[] = [];
            for (let i = 0; i < parseInt(l); i++) {
                const key = Redis._getStopKeyName(stopId, i);
                // logger.debug(`Reading cache for trip with key ${key}`);
                p.push(client.hGetAll(key));
            }

            return (await Promise.all(p)).filter(p => !!p) as Trip[];
        } catch (err) {
            logger.error(
                `Redis error while reading cached trips for stopId ${stopId}`
            );
            logger.error(err);
            return null;
        }
    }

    // (async () => {
    //   const client = createClient();

    //   client.on('error', (err) => console.log('Redis Client Error', err));

    //   await client.connect();

    //   await client.set('key', 'value');
    //   const value = await client.get('key');
    // })();
}
