// import "./test";
import "./api";
import { Display } from "./interfaces/Display";
import { Stop } from "./interfaces/Stop";

const stops: Stop[] = [
    {
        stopId: "MO2076",
        stopName: "San Cesario"
    },
    {
        stopId: "MO10",
        stopName: "Modena Autostazione"
    }
];

export const display = new Display({
    stops,
    // displayName: "San Cesario",
    showArrival: false,
    showMap: false,
    showPassengersNum: true,
    showPlatform: false,
    showVehicleCode: true
});
