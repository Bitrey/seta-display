import { AxiosInstance } from "axios";
import moment from "moment-timezone";
import { Agency } from "../interfaces/Agency";
import { Stop } from "../interfaces/Stop";
import { tripFn, tripFnErr, tripFnReturn } from "../interfaces/tripFn";

export abstract class Base {
    public static agency: Agency;
    public static stops: Stop[];
    private static _instance: AxiosInstance;
    public static getTrips: tripFn;
    public static isTripsErr: (r: tripFnReturn) => r is tripFnErr;

    public static getTime() {
        return moment();
    }
    public static getTimeStr(timezone = "Europe/Rome", format = "HH:mm") {
        return Base.getTime().tz(timezone).format(format);
    }
}
