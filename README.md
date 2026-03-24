# Outwalk Habitat

![build](https://github.com/OutwalkStudios/habitat/workflows/build/badge.svg)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/OutwalkStudios/habitat/blob/main/LICENSE)
[![twitter](https://img.shields.io/badge/follow-on%20twitter-4AA1EC.svg)](https://twitter.com/OutwalkStudios)

Habitat is a modern environment orchestration tool built on top of Docker and Docker Compose.
Habitat provides a clean abstraction over Docker enabling you to quickly initialize and deploy production applications without worrying about writing and optimizing dockerfiles.

---

## Getting Started

### Initilize a Habitat project.

You can initialize a new project by running the following command. This installs habitat in your project and generates a dockerfile for each project found in the workspace, a docker-compose.yml and a docker-compose.dev.yml are also created for adding services and running the application in development mode. Once the local copy of habitat is installed, you may use the cli via the `habitat` command.

```
npx @outwalk/habitat init
```

### Build and Run the Application

Habitat provides commands to build and run your application for development and production.
The build and start commands both accept a `--dev` flag.

```
# build the application for production
npx habitat build

# start the application for production
npx habitat start

# start the application for development
npx habitat start --dev
```

For more information on commands, run `npx habitat --help`.

---

## Reporting Issues

If you are having trouble getting something to work with Habitat or run into any problems, you can create a new [issue](https://github.com/OutwalkStudios/habitat/issues).

---

## License

Habitat is licensed under the terms of the [**MIT**](https://github.com/OutwalkStudios/habitat/blob/main/LICENSE) license.