import { AxiosInstance } from "axios";
import moment from "moment-timezone";
import { Agency } from "../interfaces/Agency";
import { Stop } from "../interfaces/Stop";
import { tripFn } from "../interfaces/tripFn";
import { newsFn } from "../interfaces/newsFn";

export abstract class Base {
    public static agency: Agency;
    private static _instance: AxiosInstance;
    public static getTrips: tripFn;
    public static getNews: newsFn;
    public static getStopIds: () => Promise<string[]>;
    public static getStop: (stopId: string) => Promise<Stop>;

    public static getTime() {
        return moment();
    }
    public static getTimeStr(timezone = "Europe/Rome", format = "HH:mm") {
        return Base.getTime().tz(timezone).format(format);
    }
}
