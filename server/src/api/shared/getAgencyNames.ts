import { lstatSync, readdirSync } from "fs";
import { join } from "path";

export const getAgencyNames = (
    fPath = join(__dirname, "../../agencies")
): string[] => {
    return readdirSync(fPath).filter(e =>
        lstatSync(join(fPath, e)).isDirectory()
    );
};
