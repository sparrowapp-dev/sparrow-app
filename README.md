<p align="center">
    <a href="https://sparrowapp.dev">
    <img src="https://sparrowassets.blob.core.windows.net/publicassest/sparrow-logo.png" width="350" alt="logo"/>
    </a>
	<h4 align="center">One-stop API management tool </h4>
</p>

 
![screenshot](https://sparrowassets.blob.core.windows.net/publicassest/Improved-API-Workflow.png)


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
 
Sparrow is your next go to API development buddy which can help you test, debug, distribute better APIs while collaborating with your colleagues and making you a better programmer.
 
## <a name="installation">🔨 Installation</a>
 
To install this project, you will need to have the following installed on your machine :
 
![NODE](https://img.shields.io/badge/-Node.js-black?style=for-the-badge&logoColor=white&logo=nodedotjs&color=339933)
![Yarn](https://img.shields.io/badge/-Yarn-black?style=for-the-badge&logoColor=white&logo=yarn&color=2C8EBB)
![Rust](https://img.shields.io/badge/-Rust-black?style=for-the-badge&logoColor=white&logo=rust&color=000000)


Install the above dependencies by heading over to the links below,

1) [Node](https://nodejs.org/en)
2) [Tauri](https://tauri.app/v1/guides/getting-started/prerequisites)
3) [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

 
Then, run the following commands :
 
```bash
# Clone the repo
git clone https://github.com/sparrowapp-dev/sparrow-app

# Move into the project root
cd sparrow-app
	
# Install dependencies and Husky hooks
yarn

# Copy .env.example to .env
cp .env.example .env
 
# Run the app in dev mode
yarn tauri dev
```
 
The above command will start the app in development mode and watch for changes on local.
 
## <a name="recommended-ide-setup">👨‍💻 Recommended IDE Setup</a>
 
[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).
 
   
## <a name="contributors">❤️ How to Contribue ?</a>

You can checkout [Contributing Guidelines](./docs/CONTRIBUTING.md)
 
## <a name="subscribe-to-our-newsletter">📨 Newsletter</a>
 
Subscribe to our newsletter by applying [here!](https://sparrows-newsletter.beehiiv.com/subscribe) 
 
Copy the values from `.env.example` into `.env` to begin.
You have to create a `.env` file in this directory to override the default values when starting the API locally with `yarn tauri dev` command. 