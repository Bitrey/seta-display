import fs, { lstat, readdir } from "fs";
import { join } from "path";
import { promisify } from "util";
import { settings } from "../../settings";

interface _Files {
    file: string;
    stats: fs.Stats;
}

export const getAgencyNames = async (): Promise<string[]> => {
    const readdirES6 = promisify(readdir);
    const lstatES6 = promisify(lstat);

    const files: _Files[] = (await readdirES6(settings.agenciesPath)).map(
        e => ({
            file: e,
            stats: lstatES6(join(settings.agenciesPath, e)) as any
        })
    );
    const stats = await Promise.all(files.map(e => e.stats));
    files.forEach((e, i) => (files[i].stats = stats[i]));

    return files.filter(e => e.stats.isDirectory()).map(e => e.file);
};
