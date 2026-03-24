import { habitat } from "../utils/logging";

/* the list of commands with corresponding help menus */
const menus = {
    default: `
    Usage: ${habitat("habitat [command] <options>")}
    Options:
        ${habitat("-v, --version")} ........ Output the current version.
        ${habitat("-h, --help")} ........ Output the help menu.
    Commands:
        ${habitat("init")} <options> ........ Initializes the habitat application.
        ${habitat("build")} <options> ........ Builds the habitat application.
        ${habitat("start")} <options> ........ Starts the habitat application.
        ${habitat("stop")} <options> ........ Stops the habitat application.

    For help with a specific command run "habitat [command] --help"
    `,

    init: `
    Usage: ${habitat("habitat init <options>")}
    - Initializes the habitat application.

    Options:
        ${habitat("-e, --exclude")} ........ Specifies the folders to be excluded from initialization.
    `,

    build: `
    Usage: ${habitat("habitat build <options>")}
    - Builds the habitat application.

    Options:
        ${habitat("-d, --dev")} ........ Builds the habitat application in dev mode.
    `,

    start: `
    Usage: ${habitat("habitat start <options>")}
    - Starts the habitat application.

    Options:
        ${habitat("-d, --dev")} ........ Starts the habitat application in dev mode.
    `,

    stop: `
    Usage: ${habitat("habitat stop <options>")}
    - Stops the habitat application.
    `
};

/* print out the requested help menu */
export default function help(args) {
    const command = args._[0] == "help" ? args._[1] : args._[0];
    console.log(menus[command] || menus.default);
}