import swaggerJsdoc from "swagger-jsdoc";
import { logger } from "../../shared/logger";

export const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "TPL Display",
            version: "1.0.0",
            description: "TPL Display"
        },
        servers: [
            {
                url: "http://localhost:5000/",
                description: "Documentazione API"
            }
        ]
    },
    // apis: [path.join(__dirname, "..", "routes", "*.ts")]
    apis: [
        // path.join(__dirname, "/../routes") + "*.js",
        // path.join(__dirname, "/../routes") + "*.ts",
        "**/*.ts"
    ]
};

logger.info(`APIs path at "${options.apis.join('", "')}"`);

export const specs = swaggerJsdoc(options);
