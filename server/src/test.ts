import moment from "moment-timezone";
import { Seta } from "./agencies/seta";
import { Stop } from "./interfaces/Stop";

async function test() {
    // const trips = await Seta.getTrips("MO6119", 2);
    const s = new Stop({
        stopId: "MO6119",
        stopName: "San Cesario",
        // getTrips: null as any,
        platform: "5"
    });
    // s.getTrips = (n?: number) => Seta.getTrips(s.stopId, n);

    // const trips = await Seta.getTrips("MO3600", 2);
    const trips = await Seta.getTrips(s, 10);
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
        // .filter(e => e.scheduleRelationship === "SCHEDULED"),
        trips.length
    );
}

// test();
