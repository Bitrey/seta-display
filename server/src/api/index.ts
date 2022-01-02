import bodyParser from "body-parser";
import express, { ErrorRequestHandler } from "express";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import { CustomErr } from "../interfaces/CustomErr";
import { FnErr } from "../interfaces/FnErr";

import { logger } from "../shared/logger";
import { specs } from "./config/swagger";
import { router as routes } from "./routes";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Swagger
if (process.env.NODE_ENV !== "production") {
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(specs, { explorer: true })
    );
}

app.use(express.static(join(__dirname, "../../frontend/public")));

app.use("/api", routes);

// DEBUG
// logger.warn("Using frontend route");
// app.get("/", (req, res) => {
//     res.sendFile(join(__dirname, "../../frontend/index.html"));
// });

app.all("*", (req, res) => {
    res.status(404).json({ err: "Not found" });
});

const isCustomErr = (err: unknown): err is CustomErr => {
    return (
        !!err &&
        typeof err === "object" &&
        typeof (err as any).msg === "string" &&
        !Number.isNaN(parseInt((err as any).status))
    );
};

const isParseErr = (err: unknown): err is { status: number } => {
    return (
        !!err &&
        typeof err === "object" &&
        err instanceof SyntaxError &&
        (err as any).type === "entity.parse.failed"
    );
};

// Error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (isCustomErr(err)) {
        logger.debug("Custom error: " + err.msg);
        return res.status(err.status).json({ err: err.msg });
    } else if (isParseErr(err)) {
        logger.debug("Parse error: " + err);
        return res
            .status(err.status || 400)
            .json({ err: "Error while parsing request body" });
    } else {
        logger.debug("NOT custom error:");
        logger.error(err);
        return res.status(400).json(err);
    }
};
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const IP = process.env.IP || "127.0.0.1";
app.listen(PORT, IP, () => logger.info(`API server started at ${IP}:${PORT}`));
