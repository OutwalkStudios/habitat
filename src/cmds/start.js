import { logger } from "../utils/logging";
import { isDockerRunning } from "../utils/files";
import child_process from "node:child_process";
import path from "node:path";
import fs from "node:fs";

export default async function start(args) {
    const projectName = path.basename(process.cwd());
    const isDev = (args.dev || args.d);

    logger.log(`deploying ${projectName}...`);

    if (!fs.existsSync(path.join(process.cwd(), ".habitat", "docker-compose.yml"))) {
        throw new Error("unable to detect .habitat/docker-compose.yml config.");
    }

    if (isDev && !fs.existsSync(path.join(process.cwd(), ".habitat", "docker-compose.dev.yml"))) {
        throw new Error("unable to detect .habitat/docker-compose.dev.yml config.");
    }

    if (!await isDockerRunning()) {
        throw new Error("unable to connect to docker. please ensure docker is running.");
    }

    const base = `docker compose -f .habitat/docker-compose.yml ${isDev ? "-f .habitat/docker-compose.dev.yml" : ""}`.trim();
    const flags = isDev ? "--build" : "-d";
    const command = [base, "up", flags].join(" ");

    /* run the docker command */
    child_process.execSync(command, { stdio: "inherit" });

    if (!isDev) logger.log("deployment completed.");
}