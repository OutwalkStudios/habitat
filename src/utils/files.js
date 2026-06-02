import path from "node:path";
import url from "node:url";
import fs from "node:fs/promises";
import { glob } from "glob";

/* module with object scope to mock the __filename and __dirname for esm */
export const Module = {
    __filename: (fileUrl) => {
        return (import.meta.url) ? url.fileURLToPath(fileUrl) : __filename;
    },
    __dirname: (fileUrl) => {
        return (import.meta.url) ? path.dirname(Module.__filename(fileUrl)) : __dirname;
    }
};

/* find all folders containing a package.json */
export async function findProjectFolders(root) {
    const results = [];

    const walk = async (directory) => {
        if (path.basename(directory) == "node_modules" || path.basename(directory).startsWith(".")) return;

        const entries = await fs.readdir(directory, { withFileTypes: true });
        const subtasks = [];

        for (let entry of entries) {
            if (entry.isFile() && entry.name == "package.json") results.push(directory);
            if (entry.isDirectory()) subtasks.push(walk(path.join(directory, entry.name)));
        }

        await Promise.all(subtasks);
    };

    await walk(root);
    return results;
}

/* find the project output contents */
export async function findProjectOutput(directory) {
    const root = path.relative(process.cwd(), directory);
    const output = [];

    /* if the project is using nextjs, use the frameworks specified build folders */
    if ((await glob("next.config.@(js|ts)", { cwd: directory })).length) {
        output.push(".next", "public", "next.config.js");
    }

    /* if no framework is detected, scan for standard output directories and copy them */
    else {
        const common = ["dist", "build", "output", "out", "static", "public"];
        output.push(...(await glob(`{${common.join(",")}}`, { cwd: directory, onlyDirectories: true })));
    }

    return output.map((output) => `COPY --from=build ${path.join("/app", root, output)} ./${output}`).join("\n");
}

/* load and validate the package.json from a directory */
export async function loadPackage(directory = process.cwd()) {
    return JSON.parse(await fs.readFile(path.join(directory, "package.json")));
}

/* check if docker is running */
export async function isDockerRunning() {
    const paths = ["/var/run/docker.sock", `${process.env.HOME}/.docker/run/docker.sock`];

    for (const path of paths) {
        try {
            await fs.access(path);
            return true;
        } catch {
            continue;
        }
    }

    return false;
}