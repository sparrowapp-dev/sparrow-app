# Contributing to Sparrow App

First off, thanks for taking the time to contribute! 🎉🎉

When contributing to this repository, please first discuss the change you wish to make via issue with the maintainers of this repository before making a change. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Pull Request Process

1. Always create a new branch from the **main** branch. Make sure to follow the branch naming conventions explained below.

2. Name your PR's using Conventional Commits e.g. "fix: ..." or "feat: ..." . More details stated below.

3. Ensure any install or build dependencies are removed. Add only relevant files to the commit and ignore the rest to keep the repo clean.

4. Update the readme file with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.

5. You should request review from the [maintainers](https://github.com/sparrowapp-dev/sparrow-app#installation) once you submit the Pull Request.

## Instructions

- Git Workflow (all the commands are to run in your console)

#### Step 1

Fork the repository to your GitHub account

```bash

# Clone the repo

	git  clone  https://github.com/<User-Name>/sparrow-app.git

# Move inside the folder

	cd  sparrow-app

# Add upstream remote

	git  remote  add  upstream  https://github.com/sparrowapp-dev/sparrow-app.git

```

#### Step 2

[Setup project locally](https://github.com/sparrowapp-dev/sparrow-app#installation)

#### Step 3

Create a new branch from **main** in the below format, 
```
git checkout -b <commit-type>/[<issue-number>]/{<change-title>}
example - "feat/496/add-indent"
```
  
#### Step 4

Commit your changes and push your branch to GitHub:
	
```
# Ensure branch

	git  branch

# Fetch and merge with upstream/main

	git  fetch  upstream
	git  merge  upstream/main

# Add untracked files

	git  add  .

# Commit all changes with appropriate commit message and description

	git commit -m "<commit-type>: <your-commit-message>[<issue-number>]" 
	example - "feat: add indent and indent-less[496]"

# Push changes to your forked repository
	
	git push origin feat/<issue-number>/{<change-title>}
	example - "feat/496/add-indent"
```

### Commit message types
Every commit should start with one of the commit message types. You can find the type alongside their usage details below.
```
 feat: A new feature introduced to the codebase.
 fix: A bug fix.
 docs: Documentation changes.
 style: Changes that do not affect the code's functionality (e.g., formatting, white-space corrections).
 refactor: Code changes that neither fix a bug nor add a feature, typically related to code restructuring or optimization.
 perf: Changes that improve performance.
 test: Adding or modifying tests.
 build: Changes related to the build system or external dependencies.
 ci: Changes to Continuous Integration (CI) configuration or pipelines.
 chore: Other changes that don't modify the code or documentation (e.g., updating dependencies, version bump).
```

#### Step 5
Create a PR on Github
```
FROM - <type>/<issue-issueNumber>/{<change-title>} branch in your forked repository
TO - main branch in the upstream repository
```
#### Step 6
Add a reviewer to the PR (Any [Maintainer](https://github.com/sparrowapp-dev/sparrow-app#installation)) and yourself as assignee.

#### Step 7
Link Pull Request to appropriate Issue, or Project+Milestone (if no issue created)

### IMPORTANT: Do Not Merge the PR unless specifically asked to by an Admin/Maintainer.


#### Step 8
Delete branch from forked repo
```bash
# Delete branch from forked repo

git  branch  -d <type>/<issue-issueNumber>/{<change-title>}

git  push  --delete  origin <type>/<issue-issueNumber>/{<change-title>}  
```
#### Step 9
Fetch and merge with upstream/main
```bash
git  checkout  main

git  pull  upstream

git  push  origin

```
  

## Important Links
- Always follow [commit message standards](https://www.conventionalcommits.org/en/v1.0.0/)

- About the [fork-and-branch workflow](https://blog.scottlowe.org/2015/01/27/using-fork-branch-git-workflow/)