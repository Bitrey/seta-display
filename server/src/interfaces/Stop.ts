import { Trip } from "./Trip";

export interface Stop {
    stopId: string;
    stopName: string;
    additionalInfo?: string;
    visibleFields?: (keyof Trip)[];
    platform?: string;
    tripFn: (stop: Stop) => Promise<Trip[] | { err: string }>;
}
