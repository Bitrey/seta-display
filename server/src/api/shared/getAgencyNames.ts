import { lstatSync, readdirSync } from "fs";
import { join } from "path";
import { settings } from "../../settings";

export const getAgencyNames = (): string[] => {
    return readdirSync(settings.agenciesPath).filter(e =>
        lstatSync(join(settings.agenciesPath, e)).isDirectory()
    );
};
