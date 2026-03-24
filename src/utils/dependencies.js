import { spawnSync } from "node:child_process";

/* install the dependencies required for a project */
export function installDependencies(dependencies, directory) {
    return new Promise((resolve, reject) => {
        const command = /^win/.test(process.platform) ? "npm.cmd" : "npm";

        /* spawn the child process and handle errors */
        const spawnProcess = (command, args) => {
            const { status, error } = spawnSync(command, args, { cwd: directory, stdio: "ignore" });
            if (status != 0) throw new Error("failed to install @outwalk/habitat.");
            if (error) throw error;
        };

        try {
            spawnProcess(command, ["install", "--save"].concat(dependencies));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}