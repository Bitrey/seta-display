import path, { relative } from "path";
import { cwd } from "process";
import swaggerJsdoc from "swagger-jsdoc";
import { logger } from "../../shared/logger";
export const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TPL Display",
            version: "1.0",
            description: "TPL Display"
        },
        servers: [
            {
                url: "http://localhost:3000/"
            }
        ]
    },
    // apis: [path.join(__dirname, "..", "routes", "*.ts")]
    apis: [
        // path.join(__dirname, "/../routes") + "*.js",
        // path.join(__dirname, "/../routes") + "*.ts",
        path.join(__dirname, "/../../") + "*.js",
        path.join(__dirname, "/../../") + "*.ts"
    ]
};

logger.debug(
    `APIs path at "${options.apis.map(e => relative(cwd(), e)).join('", "')}"`
);

export const specs = swaggerJsdoc(options);
