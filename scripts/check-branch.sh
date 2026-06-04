#!/bin/sh

# Get the name of the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Block actions in main and develop
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "develop" ]; then
  echo "ERROR: Direct actions on the '$BRANCH' branch are prohibited locally!"
  echo "Please, use a derived branch and merge it via Pull Request on GitHub."
  exit 1
fi