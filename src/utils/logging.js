import chalk from "chalk";

export const habitat = chalk.hex("#1ae87f");

export const logger = {
    log: (...message) => console.log(`${habitat("[habitat]")} - `, ...message),
    warn: (...message) => console.log(`${chalk.yellow("[habitat]")} - `, ...message),
    error: (...message) => console.log(`${chalk.red("[habitat]")} - `, ...message)
};