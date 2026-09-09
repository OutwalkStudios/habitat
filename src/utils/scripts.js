/* scan the scripts for the most likely build script */
export function findBuildCommand(scripts) {
    if (!scripts || typeof scripts != "object") throw new Error("unable to determine a build script.");

    const candidates = [];
    for (let [name, command] of Object.entries(scripts)) {
        let score = 0;

        if (name.toLowerCase() == "build") score += 100;
        if (name.toLowerCase().includes("build")) score += 50;

        /* check for other common build script names */
        if (["compile", "dist", "bundle", "prod", "production"].some((script) => name.toLowerCase().includes(script))) {
            score += 30;
        }

        /* penalize obvious non-build scripts names */
        if (["dev", "start", "serve", "test", "lint", "watch"].some((script) => name.toLowerCase().includes(script))) {
            score -= 40;
        }

        /* check command for known build tools */
        if (/\b(tsc|webpack|rollup|vite|esbuild|parcel|next build|nuxt build)\b/.test(command.toLowerCase())) {
            score += 40;
        }

        /* penalize dev-mode flags */
        if (/\b(--watch|--dev|--hot)\b/.test(command.toLowerCase())) {
            score -= 20;
        }

        if (score > 0) candidates.push({ name, command, score });
    }

    if (!candidates.length) throw new Error("unable to determine a build script.");

    candidates.sort((a, b) => b.score - a.score);

    return `npm run ${candidates[0].name}`;
}

/* scan the scripts for the most likely start script */
export function findStartCommand(scripts) {
    if (!scripts || typeof scripts != "object") throw new Error("unable to determine a start script.");

    const candidates = [];
    for (let [name, command] of Object.entries(scripts)) {
        let score = 0;

        if (name.toLowerCase() == "start") score += 100;
        if (name.toLowerCase().includes("start")) score += 50;

        /* check for other common start script names */
        if (["serve", "listen", "prod", "production", "preview"].some((script) => name.toLowerCase().includes(script))) {
            score += 30;
        }

        /* penalize obvious non-start scripts names */
        if (["dev", "watch", "test", "lint", "build", "compile", "dist"].some((script) => name.toLowerCase().includes(script))) {
            score -= 40;
        }

        /* check command for known runtime commands */
        if (/\b(node|nodemon|pm2|serve|next start|nuxt start)\b/.test(command.toLowerCase())) {
            score += 40;
        }

        /* penalize dev-mode flags */
        if (/\b(--watch|--dev|--hot)\b/.test(command.toLowerCase())) {
            score -= 20;
        }

        /* penalize obvious build tool commands */
        if (/\b(tsc|webpack|rollup|vite build|esbuild|parcel build)\b/.test(command.toLowerCase())) {
            score -= 40;
        }

        if (score > 0) candidates.push({ name, command, score });
    }

    if (!candidates.length) throw new Error("unable to determine a start script.");

    candidates.sort((a, b) => b.score - a.score);

    return `npm run ${candidates[0].name}`;
}

/* scan the scripts for the most likely dev script */
export function findDevCommand(scripts) {
    if (!scripts || typeof scripts != "object") throw new Error("unable to determine a dev script.");

    const candidates = [];
    for (let [name, command] of Object.entries(scripts)) {

        let score = 0;

        if (name.toLowerCase() == "dev") score += 100;
        if (name.toLowerCase().includes("dev")) score += 50;

        /* check for other common dev script names */
        if (["watch", "serve", "start:dev", "develop"].some((script) => name.toLowerCase().includes(script))) {
            score += 30;
        }

        /* check command for known dev tools */
        if (/\b(nodemon|ts-node-dev|vite|next dev|nuxt dev|webpack serve|parcel|astro dev)\b/.test(command.toLowerCase())) {
            score += 40;
        }

        /* check for hot reload and watch flags */
        if (/\b(--watch|--dev|--hot)\b/.test(command.toLowerCase())) {
            score += 30;
        }

        /* penalize obvious production or start commands */
        if (["start", "prod", "production"].some((script) => name.toLowerCase().includes(script))) {
            score -= 40;
        }

        /* penalize obvious build commands */
        if (["build", "compile", "dist"].some((script) => name.toLowerCase().includes(script))) {
            score -= 40;
        }

        /* penalize obvious pure runtime commands */
        if (/\b(node|pm2|next start|nuxt start)\b/.test(command.toLowerCase())) {
            score -= 30;
        }

        if (score > 0) candidates.push({ name, command, score });
    }

    if (!candidates.length) throw new Error("unable to determine a dev script.");

    candidates.sort((a, b) => b.score - a.score);

    return `npm run ${candidates[0].name}`;
}