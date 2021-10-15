import bodyParser from "body-parser";
import express from "express";
import { join } from "path";
import swaggerUi from "swagger-ui-express";
import { ResErr } from "../interfaces/ResErr";

import { logger } from "../shared/logger";
import { specs } from "./config/swagger";
import { router as routes } from "./routes";

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

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

const PORT = Number(process.env.PORT) || 5000;
const IP = process.env.IP || "127.0.0.1";
app.listen(PORT, IP, () => logger.info(`API server started at ${IP}:${PORT}`));
