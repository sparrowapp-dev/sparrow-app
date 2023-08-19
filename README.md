# Sparrow App

The Sparrow App is your next go to API development buddy which can help you test, debug, distribute better APIs while collaborating with your colleagues and while making you a better programmer.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer).

## How to Run?

### Step 1 - Prerequisites

We need to install both node and rust dependencies to run the project. Make sure you have `yarn` and `cargo` set up to get started.

### Step 2 - Install dependencies

Run `yarn` to install all npm dependencies.

### Step 3 - Run the tauri app

Run `yarn tauri dev` to run the tauri application.

## Contributing

Please check documentation of Tauri, Svelte and Rust for basic understanding.

### Commit conventions

Please use following conventions for your commit messages. More details can be found at:
[Commit Conventions at Techdome](https://techdome.atlassian.net/wiki/spaces/DEV/pages/155189253/Commit+Convention).

- API relevant changes

  - **feat** Commits, that adds a new feature
  - **fix** Commits, that fixes a bug

- **refactor** Commits, that rewrite/restructure your code, however does not change any behaviour
  - **perf** Commits are special refactor commits, that improve performance
- **style** Commits, that do not affect the meaning (white-space, formatting, missing semi-colons, etc)

- **test** Commits, that add missing tests or correcting existing tests

- **docs** Commits, that affect documentation only

- **build** Commits, that affect build components like build tool, ci pipeline, dependencies, project version etc.

- **ops** Commits, that affect operational components like infrastructure, deployment, backup, recovery etc.

- **chore** Miscellaneous commits e.g. modifying .gitignore

### Branching convention

Please follow instructions here to name your branches properly so that your work is tracked:
[Branch Naming at Techdome](https://techdome.atlassian.net/wiki/spaces/DEV/pages/155451396/Branch+Naming).

## Additional Info

Please use Techdome's Confluence and JIRA pages for more information.
