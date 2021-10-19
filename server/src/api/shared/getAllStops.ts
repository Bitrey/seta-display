import { join } from "path";
import { Base } from "../../agencies/Base";
import { Stop } from "../../interfaces/Stop";

export const getAllStops = (
    agencyName = "seta",
    fPath = join(__dirname, "../../agencies")
): Stop[] => {
    return (require(join(fPath, agencyName)).default as typeof Base).stops;
};
