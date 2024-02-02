# Contributing to Sparrow App

First off, thanks for taking the time to contribute! 🎉🎉

When contributing to this repository, please first discuss the change you wish to make via issue with the maintainers of this repository before making a change. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Pull Request Process

1. Please name your PR's using Conventional Commits e.g. "fix: ..." or "feat: ..."
2. Ensure any install or build dependencies are removed before the end of the layer when doing a build. Add only relevant files to commit and ignore the rest to keep the repo clean.
3. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
4. You should request review from the maintainers once you submit the Pull Request.

## Instructions

- Git Workflow (all the commands are to run in your console)

#### Step 1

- Fork the repository to your GitHub account

```bash
# Clone the repo
git clone https://github.com/<User-Name>/sparrow-app.git

# move to the folder
cd sparrow-app

# Add upstream remote
git remote add upstream https://github.com/sparrowapp-dev/sparrow-app.git
```

#### Step 2
- [Setup project locally](https://github.com/sparrowapp-dev/sparrow-app#installation)  

#### Step 3

- Commit your changes and push your branch to GitHub:

```bash
## Committing and pushing your work

# Ensure branch
git branch

# Fetch and merge with upstream/main
git fetch upstream
git merge upstream/main

# Add untracked files
git add .

# Commit all changes with appropriate commit message and description
# Before comminting, make sure you have followed the commit message standards
# use the following prefix for commit messages
# wip - Work in Progress; long term work; mainstream changes;
# feat - New Feature; future planned; non-mainstream changes;
# bug - Bug Fixes
# exp - Experimental; random experimental features;
# Include issue number in encloseing square brackets at the end of commit message

git commit -m "fix: your-commit-message[<issue-issueNumber>]"

# example - "feat: add indent and indent-less[496]" 

# Push changes to your forked repository
git push origin <type>/<issue-issueNumber>/{<additional-fixes>}

# example - git push origin feat/496/codemirror-shortcuts

## Creating the PR using GitHub Website
# Create Pull Request from <type>/<issue-issueNumber>/{<additional-fixes>} branch in your forked repository to the master branch in the upstream repository
# After creating PR, add a Reviewer (Any Admin) and yourself as the assignee
# Link Pull Request to appropriate Issue, or Project+Milestone (if no issue created)
# IMPORTANT: Do Not Merge the PR unless specifically asked to by an admin.
```

- After PR Merge

```bash
# Delete branch from forked repo
git branch -d <type>/<issue-issueNumber>/{<additional-fixes>}
git push --delete origin <type>/<issue-issueNumber>/{<additional-fixes>}

# Fetch and merge with upstream/main
git checkout main
git pull upstream
git push origin
```

- Always follow [commit message standards](https://www.conventionalcommits.org/en/v1.0.0/)
- About the [fork-and-branch workflow](https://blog.scottlowe.org/2015/01/27/using-fork-branch-git-workflow/)