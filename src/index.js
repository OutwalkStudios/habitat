#!/usr/bin/env node

import yargs from "yargs-parser";

import { logger } from "./utils/logging";

import version from "./cmds/version";
import help from "./cmds/help";
import init from "./cmds/init";
import build from "./cmds/build";
import start from "./cmds/start";
import stop from "./cmds/stop";

/* parse the cli arguments */
const args = yargs(process.argv.slice(2));
let cmd = args._[0] || "help";

/* determine what command to run */
if (args.version || args.v) cmd = "version";
else if (args.help || args.h) cmd = "help";

const commands = {
    "version": version,
    "help": help,
    "init": init,
    "build": build,
    "start": start,
    "stop": stop
};

try {
    if (commands[cmd]) await commands[cmd](args);
    else logger.error("unrecognized command.");
} catch (error) {
    logger.error(error.message);
}