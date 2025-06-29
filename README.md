<p align="center">
    <a href="https://sparrowapp.dev">
    <img src="https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png" width="350" alt="logo"/>
    </a>
	<h4 align="center">One-stop API management tool </h4>
</p>

![screenshot](https://sparrowassets.blob.core.windows.net/publicassest/Sparrow-Dashboard-Readme.png)

![TypeScript](https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=2F73BF)
![Nest](https://img.shields.io/badge/-NestJs-black?style=for-the-badge&logo=nestjs&color=E0234D)
![Mongoose](https://img.shields.io/badge/-MongoDB-black?style=for-the-badge&logoColor=white&logo=mongodb&color=127237)
![Rust](https://img.shields.io/badge/-Rust-black?style=for-the-badge&logoColor=white&logo=rust&color=000000)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=Tauri&logoColor=white)
![Svelte](https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)\
[![Quality Gate Status](https://sonar.techdomeaks.com/api/project_badges/measure?project=sparrow&metric=alert_status&token=sqb_aaefedc197c76ac808596f3e44d5e8d5b06ed348)](https://sonar.techdomeaks.com/dashboard?id=sparrow)

## 📋 Table of Contents

1. 🐦 [What is Sparrow ?](#what-is-sparrow)
2. 🔨 [Installation](#installation)
3. 👨‍💻 [Recommended IDE Setup](#recommended-ide-setup)
4. ❤️ [How to Contribute ?](#contributors)
5. 📨 [Subscribe to our Newsletter](#subscribe-to-our-newsletter)

## <a name="what-is-sparrow">🐦 What is Sparrow ?</a>

Sparrow is your next go-to API development buddy which can help you test, debug, and distribute better APIs while collaborating with your colleagues and making you a better programmer.

## <a name="installation">🔨 Installation</a>

### Prerequisite:

To install this project, you will need to have the following installed on your machine :

![Docker](https://img.shields.io/badge/-Docker-black?style=for-the-badge&logoColor=white&logo=docker&color=2496ED)
![NODE](https://img.shields.io/badge/-Node.js-black?style=for-the-badge&logoColor=white&logo=nodedotjs&color=339933)
![Yarn](https://img.shields.io/badge/-Yarn-black?style=for-the-badge&logoColor=white&logo=yarn&color=2C8EBB)
![Rust](https://img.shields.io/badge/-Rust-black?style=for-the-badge&logoColor=white&logo=rust&color=000000)

Check if you already have the prerequisites installed by running the below commands in your terminal

1. Node: node -v
2. Yarn: yarn check
3. Rust: rustc --version
4. Docker(Optional): docker --version

Install the required dependencies by heading over to the links below,

1. [Node](https://nodejs.org/en)
2. [Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
3. [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)
4. [Docker](https://docs.docker.com/desktop/)

### Installation Steps:

#### -> Required Steps

```bash
# Clone the repo
git clone https://github.com/sparrowapp-dev/sparrow-app

# Move into the project root
cd sparrow-app

# Install dependencies and Husky hooks
yarn

# Copy desktop app .env.example to .env
cp apps/@sparrow-desktop/.env.example apps/@sparrow-desktop/.env

# Copy web app .env.example to .env
cp apps/@sparrow-web/.env.example apps/@sparrow-web/.env
```

> You can customize the environment variables in `.env` if required. Refer the [Environment Variable Guide](./docs/ENVIRONMENT_VARIABLE_GUIDE.md) to understand more.

After completing the required steps of setting up the repository and env, follow one of the below methods to setup the required services:

#### -> [METHOD 1] Docker Method

- To install all services(mongo + api server + auth server + proxy server) as docker containers, and start the web app on port 1422, run:

  `yarn docker:up `

- To install individual services, run:

        yarn docker:<SERVICE NAME>

  - `yarn docker:mongo` - Runs only mongo in a docker container
  - `yarn docker:sparrow-api` - Runs only the api server
  - `yarn docker:sparrow-auth` - Runs only the auth service
  - `yarn docker:sparrow-proxy` - Runs only the proxy service

  Points to remember:

  - `Running yarn docker:up will also start web app on localhost:1422. You can comment it out in docker compose if you want to run the app locally.`

#### -> [METHOD 2] Non-Docker Method

- Go to following repositories of individual services and check their README in order to setup them on your local.

  - [Sparrow API](https://github.com/sparrowapp-dev/sparrow-api)
  - [Sparrow Auth](https://github.com/sparrowapp-dev/sparrow-app-auth)
  - [Sparrow Proxy](https://github.com/sparrowapp-dev/sparrow-proxy-service)

  Points to remember:

  - `Mongo setup is already included in Sparrow API setup.`

#### -> Run The App Locally

```bash
# Run the desktop app in dev mode
yarn desktop-start

# Run the web app in dev mode
yarn web-start
```

The above command will start the app/web-app in development mode and watch for changes on local.

### Default User for Login:

Sparrow creates a default user to help you get started quickly and easily.

**Login Credentials:**

- **Email:** `dev@sparrow.com`
- **Password:** `12345678@`

## <a name="self-host">👨‍💻 Self Host</a>

[Click here](./docs/SELF_HOST.md) to Self Host Sparrow.

## <a name="recommended-ide-setup"> 💻 Recommended IDE Setup</a>

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## <a name="contributors">❤️ How to Contribue ?</a>

You can checkout [Contributing Guidelines](./docs/CONTRIBUTING.md)

## <a name="subscribe-to-our-newsletter">📨 Newsletter</a>

Subscribe to our newsletter by applying [here!](https://sparrows-newsletter.beehiiv.com/subscribe)
