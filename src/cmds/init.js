import prompts from "prompts";
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import YAML from "yaml";

import { TemplateBuilder } from "../utils/template";
import { logger } from "../utils/logging";
import { Module, loadPackage, findProjectFolders, findProjectOutput } from "../utils/files";
import { installDependencies } from "../utils/dependencies";
import { findBuildCommand, findStartCommand, findDevCommand } from "../utils/scripts";

export default async function init(args) {
    const projectName = path.basename(process.cwd());
    const habitatPath = path.join(process.cwd(), ".habitat");
    const templatePath = path.join(Module.__dirname(import.meta.url), "../templates/");

    const exclude = args.exclude ? args.exclude.split(",") : [];

    /* check for required files */
    if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
        logger.error("Unable to find required package.json");
        return;
    }

    /* ask permission to overwrite existing config */
    if (!args.force && fs.existsSync(habitatPath)) {
        const response = await prompts({
            type: "confirm",
            name: "continue",
            message: "The current directory has an existing .habitat folder. Continue?",
            initial: true
        });

        if (!response.continue) return;

        TemplateBuilder.deleteDirectory(habitatPath);
    }

    console.log("\n");
    logger.log(`initializing ${projectName}...`);

    const root = await loadPackage(process.cwd());
    const isWorkspacesEnabled = root.workspaces != undefined;

    try {
        /* install habitat in the root package if not already present */
        await installDependencies(["@outwalk/habitat@latest"], process.cwd()).catch((error) => logger.error(error.message));

        /* scan directories for node projects */
        const projects = (await findProjectFolders(process.cwd())).filter((project) => !exclude.includes(path.basename(project)));
        const production = { name: projectName, services: {} };
        const development = { services: {} };

        /* create a COPY directive for each project if workspaces are enabled */
        const copyWorkspaceManifest = (isWorkspacesEnabled) ? projects.slice(1).map((project) => `COPY ${project}/package*.json ./${project}/`).join("\n").replaceAll(`${process.cwd()}/`, "") : "";

        for (let project of projects) {
            const { engines, scripts } = await loadPackage(project);
            const relativeProjectPath = path.relative(process.cwd(), project);
            const isRootProject = (projects.indexOf(project) == 0);
            const folder = path.basename(project);

            /* ignore the root package.json if using npm workspaces */
            if (isWorkspacesEnabled && isRootProject) continue;

            /* determine the node version being targeted */
            const [version] = (engines?.node ?? process.versions.node.split(".")[0]).match(/\d+[^.|]/g);

            /* determine the port that the application runs on */
            const doesEnvFileExist = fs.existsSync(path.join(project, ".env"));
            const envConfig = doesEnvFileExist ? dotenv.parse(Buffer.from(fs.readFileSync(path.join(project, ".env")))) : null;
            const port = envConfig ? Number(envConfig.PORT) : (3000 + Math.max(0, projects.indexOf(project) - 1));

            /* create and inject the template variables */
            const template = new TemplateBuilder(templatePath, path.join(habitatPath, folder));

            template.inject("node-version", version);
            template.inject("copy-workspace-manifest", copyWorkspaceManifest);
            template.inject("copy-project-manifest", `COPY --from=prod-dependencies ${path.join("/app", relativeProjectPath, "package.json")} ./package.json`);
            template.inject("copy-project-input", `COPY ${relativeProjectPath ? relativeProjectPath : "./"} ./${relativeProjectPath}`);
            template.inject("copy-project-output", await findProjectOutput(project));
            template.inject("install-command-prod", `npm ci ${isWorkspacesEnabled ? "--workspaces" : ""}`.trim());
            template.inject("install-command-dev", `npm install ${isWorkspacesEnabled ? "--workspaces" : ""}`.trim());
            template.inject("build-command", `${findBuildCommand(scripts)} ${isWorkspacesEnabled ? `--workspace=${folder}` : ""}`.trim());
            template.inject("start-command", JSON.stringify(findStartCommand(scripts).split(" ")));
            template.inject("dev-command", JSON.stringify(`${findDevCommand(scripts)} ${isWorkspacesEnabled ? `--workspace=${folder}` : ""}`.trim().split(" ")));
            template.inject("port", port);

            template.build();

            /* add the project to the docker-compose.yml file */
            production.services[folder] = {};
            production.services[folder].build = { context: "..", target: "production", dockerfile: `.habitat/${folder}/dockerfile` };
            production.services[folder].container_name = folder;
            production.services[folder].image = (isWorkspacesEnabled ? projectName + "/" + folder : folder);
            production.services[folder].ports = [`${port}:${port}`];

            /* add the project development overrides to the docker-compose.dev.yml file */
            development.services[folder] = {};
            development.services[folder].build = { target: "development" };
            development.services[folder].image = (isWorkspacesEnabled ? projectName + "/" + folder : folder) + ":dev";
            development.services[folder].volumes = [`../${relativeProjectPath}:/app/${relativeProjectPath}`];
            development.services[folder].environment = { NODE_ENV: "development", CHOKIDAR_USEPOLLING: true };

            /* if a .env file exist, include it in the build */
            if (doesEnvFileExist) {
                production.services[folder].env_file = [`${path.relative(habitatPath, project)}/.env`];
                development.services[folder].env_file = [`${path.relative(habitatPath, project)}/.env`];
            }
        }

        /* add a comment to help identify the behavior of the development config */
        const DEV_COMMENT = "# This file overwrites values in docker-compose.yml for development mode.\n\n";

        /* generate a docker-compose.yml file */
        fs.writeFileSync(path.join(habitatPath, "docker-compose.yml"), YAML.stringify(production));
        fs.writeFileSync(path.join(habitatPath, "docker-compose.dev.yml"), DEV_COMMENT + YAML.stringify(development));

        logger.log("initialization complete.");
    } catch (error) {
        logger.error(error.message);
    }
}