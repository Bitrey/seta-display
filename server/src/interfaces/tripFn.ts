import { Trip } from "./Trip";

interface tripFnErr {
    err: string;
}
export type tripFn = (stopId: string) => Promise<Trip[] | tripFnErr>;
