declare global {
    declare module "express" {
        // declare module "express" {
        export interface NextFunction {
            (err?: { msg: string; status?: number }): void;
            /**
             * "Break-out" of a router by calling {next('router')};
             * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.router}
             */
            (deferToNext: "router"): void;
            /**
             * "Break-out" of a route by calling {next('route')};
             * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.application}
             */
            (deferToNext: "route"): void;
            msg: string;
        }
    }
}
