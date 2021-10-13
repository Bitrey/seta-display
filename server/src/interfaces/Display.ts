import { Stop } from "./Stop";

// type _atLeastOneStop = [Stop, ...Stop[]]; // The minimum is 1 string.

export interface IDisplay {
    displayName?: string;
    stops: Stop[];
    showMap?: boolean;
    showPlatform?: boolean;
    showArrival?: boolean; // other than just departure
    showPassengersNum?: boolean; // other than just occupancyStatus
    showVehicleCode?: boolean;
}

function _isBool(arg: unknown): arg is boolean {
    return typeof arg === "boolean";
}

export class Display implements IDisplay {
    displayName: string;
    stops: Stop[];
    showMap: boolean;
    showPlatform: boolean;
    showArrival: boolean; // other than just departure
    showPassengersNum: boolean; // other than just occupancyStatus
    showVehicleCode: boolean;

    constructor(d: IDisplay) {
        this.stops = d.stops;
        this.displayName = d.displayName || this.stops[0].stopName;
        this.showMap = _isBool(d.showMap) ? d.showMap : false;
        this.showPlatform = _isBool(d.showPlatform) ? d.showPlatform : false;
        this.showArrival = _isBool(d.showArrival) ? d.showArrival : false;
        this.showPassengersNum = _isBool(d.showPassengersNum)
            ? d.showPassengersNum
            : false;
        this.showVehicleCode = _isBool(d.showVehicleCode)
            ? d.showVehicleCode
            : false;
    }
}
