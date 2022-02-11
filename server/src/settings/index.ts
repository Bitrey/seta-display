import { join } from "path";

export const settings = {
    adsFilePath: join(__dirname, "../../ads/ads.json"),
    agenciesPath: join(__dirname, "../agencies"),
    agencyFilesPath: join(__dirname, "../../agency_files"),
    stopsCacheTimeMin: 60,
    adsCacheTimeMin: 30,
    newsCacheTimeMin: 3,
    redisCacheSec: 10 // DEBUG
};
