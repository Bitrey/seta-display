import moment from "moment-timezone";
import { Seta } from "./agencies/seta";
import { isFnErr } from "./interfaces/FnErr";

async function test() {
    const s = Seta.stops.find(e => e.stopId === "MO3600");
    if (!s) {
        return console.error("debug stop not found");
    }

    const trips = await Seta.getTrips(s, 10);
    if (isFnErr(trips)) {
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
        // .filter(e => e.scheduleRelationship === "SCHEDULED"),
        trips.length
    );
}

// test();
