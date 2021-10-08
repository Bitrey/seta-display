import { Trip } from "./Trip";

export interface tripFnErr {
    err: string;
}
export type tripFnReturn = Trip[] | tripFnErr;
export type tripFn = (
    stopId: string,
    maxResults?: number
) => Promise<tripFnReturn>;
