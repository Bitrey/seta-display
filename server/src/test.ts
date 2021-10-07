import moment from "moment-timezone";
import { Seta } from "./agencies/seta";

async function test() {
    const trips = await Seta.getTrips("MO3600");
    if (!Array.isArray(trips)) {
        return console.log(trips.err);
    }
    console.log(
        trips.map(e => ({
            ...e,
            realtimeDeparture: moment
                .unix(e.realtimeDeparture)
                .tz(Seta.agency.timezone)
                .format("HH:mm")
        }))
    );
}

test();
