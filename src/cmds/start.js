import { logger } from "../utils/logging";
import child_process from "node:child_process";
import path from "node:path";

export default async function start(args) {
    const projectName = path.basename(process.cwd());
    const isDev = (args.dev || args.d);

    logger.log(`deploying ${projectName}...`);

    const base = `docker compose -f .habitat/docker-compose.yml ${isDev ? "-f .habitat/docker-compose.dev.yml" : ""}`.trim();
    const flags = isDev ? "--build" : "-d";
    const command = [base, "up", flags].join(" ");

    /* run the docker command */
    child_process.execSync(command, { stdio: "inherit" });

    if (!isDev) logger.log("deployment completed.");
}