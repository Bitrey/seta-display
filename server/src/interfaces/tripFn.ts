import { CustomErr } from "./CustomErr";
import { Stop } from "./Stop";
import { Trip } from "./Trip";

export interface tripFnErr {
    err: CustomErr;
}
export type tripFnReturn = Trip[] | tripFnErr;
export type tripFn = (stop: Stop, maxResults?: number) => Promise<tripFnReturn>;
