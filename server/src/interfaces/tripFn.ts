import { FnErr } from "./FnErr";
import { Stop } from "./Stop";
import { Trip } from "./Trip";


export type tripFnReturn = Trip[] | FnErr;
export type tripFn = (stop: Stop, maxResults?: number) => Promise<tripFnReturn>;
