#!/bin/bash

# Disable all pagers and interactive prompts
export GH_PAGER=""
export GIT_PAGER="cat"
unset PAGER LESS LESSCHARSET LV LVEDITOR

# Configuration
REPO_OWNER="sparrowapp-dev"
REPO_NAME="sparrow-app"
WORKFLOW_NAME="Development Test Mac release"  # Exact name from workflow JSON

# Verify authentication with correct scopes
echo "🔍 Checking authentication..."
gh auth status || { echo "❌ Please run 'gh auth login' first"; exit 1; }

# Get workflow ID using exact name match
echo "🔎 Finding workflow ID..."
WORKFLOW_ID=$(gh api "repos/$REPO_OWNER/$REPO_NAME/actions/workflows" \
  --jq ".workflows[] | select(.name == \"$WORKFLOW_NAME\") | .id")

if [ -z "$WORKFLOW_ID" ]; then
  echo "❌ Workflow not found. Available workflows:"
  gh workflow list
  exit 1
fi

echo "✅ Found workflow ID: $WORKFLOW_ID"

# Delete workflow runs (skip if not found)
echo "🗑️ Deleting workflow runs..."
RUNS_RESPONSE=$(gh api -X DELETE "repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_ID/runs" \
  --silent 2>&1)
[[ "$RUNS_RESPONSE" == "" ]] && echo "✓ Runs deleted" || echo "⚠️ No runs to delete"

# Delete workflow file
echo "🗑️ Deleting workflow file..."
DELETE_RESPONSE=$(gh api -X DELETE "repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_ID" \
  --silent 2>&1)

if [[ "$DELETE_RESPONSE" == "" ]]; then
  echo "✅ Successfully deleted workflow"
else
  echo "❌ Failed to delete workflow. Possible reasons:"
  echo "1. Your token needs 'workflow' scope (current scopes: $(gh api user -q '.login'))"
  echo "2. Organization admin permissions required"
  echo "3. Workflow is currently running"
  exit 1
fi

# Final verification
gh api "repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_ID" \
  --silent 2>/dev/null && \
  echo "❌ Workflow still exists!" || \
  echo "✅ Verified workflow deletion"