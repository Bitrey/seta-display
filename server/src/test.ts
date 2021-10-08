import moment from "moment-timezone";
import { Seta } from "./agencies/seta";

async function test() {
    const trips = await Seta.getTrips("MO6119");
    if (Seta.isTripsErr(trips)) {
        return console.log(trips.err);
    }
    // DEBUG - map to HH:mm
    console.log(
        trips.map(e => ({
            ...e,
            scheduledDeparture: moment
                .unix(e.scheduledDeparture)
                .tz(Seta.agency.timezone)
                .format("HH:mm"),
            realtimeDeparture: moment
                .unix(e.realtimeDeparture)
                .tz(Seta.agency.timezone)
                .format("HH:mm")
        })),
        trips.length
    );
}

test();
