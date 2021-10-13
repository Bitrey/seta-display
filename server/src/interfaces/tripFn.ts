import { Stop } from "./Stop";
import { Trip } from "./Trip";

export interface tripFnErr {
    err: string;
}
export type tripFnReturn = Trip[] | tripFnErr;
export type tripFn = (stop: Stop, maxResults?: number) => Promise<tripFnReturn>;
