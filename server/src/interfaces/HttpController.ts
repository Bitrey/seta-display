import { RequestHandler } from "express";
import core from "express-serve-static-core";
import { ParsedQs } from "qs";

export type HttpController = (
    ...handlers: RequestHandler<
        core.ParamsDictionary,
        any,
        any,
        ParsedQs,
        Record<string, any>
    >[]
) => any;
