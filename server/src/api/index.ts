import bodyParser from "body-parser";
import express, { ErrorRequestHandler } from "express";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import { ResErr } from "../interfaces/ResErr";

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
logger.warn("Using frontend route");
app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "../../frontend/index.html"));
});

app.all("*", (req, res) => {
    res.status(404).json({ err: "Not found" } as ResErr);
});

interface CustomErr {
    msg: string;
    status: number;
}
const isCustomErr = (err: unknown): err is CustomErr => {
    return (
        !!err &&
        typeof err === "object" &&
        typeof (err as any).msg === "string" &&
        !Number.isNaN(parseInt((err as any).status))
    );
};

// Error handler
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (isCustomErr(err)) {
        return res.status(err.status).json({ err: err.msg });
    } else {
        return res.status(400).json(err);
    }
};
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;
const IP = process.env.IP || "127.0.0.1";
app.listen(PORT, IP, () => logger.info(`API server started at ${IP}:${PORT}`));
