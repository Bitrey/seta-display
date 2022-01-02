import { FnErr } from "./FnErr";
import { News } from "./News";


export type newsFnReturn = News[] | FnErr;
export type newsFn = (...args: any[]) => Promise<newsFnReturn>;
