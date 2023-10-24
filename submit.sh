#!/bin/bash
####################################
# Script to submit tech assessment #
####################################

# Pretty colors
RED=$'\e[1;91m'
GREEN=$'\e[1;32m'
YELLOW=$'\e[1;33m'
MAGENTA=$'\e[1;35m'
CYAN=$'\e[1;96m'
COLORLESS=$'\e[0m'
BOLD=$'\e[1m'

# Optional configuration
REPO_BASE_BRANCH="main"
REPO_REMOTE_ALIAS="solution"

GITHUB_HANDLE=$(git config --global user.name)
SUBMISSION_URL=https://tools.operationspark.org/api/assessment

DRY_RUN=false
if [[ $1 = "--dry" ]]; then
  DRY_RUN=true
fi

# Check that there is no outstanding work to commit
if [[ $DRY_RUN = false && $(git status --porcelain) ]]; then
  echo ""
  echo "${RED}ERROR: Your working directory has some changes not yet committed.${COLORLESS} "
  echo "${CYAN}To help ensure you haven't forgot something, the submission process has been suspended.${COLORLESS}"
  echo ""
  echo "${YELLOW}Please clean your working directory and try again.${COLORLESS}"
  exit 1
fi

# Warn if not on main
if [[ $DRY_RUN = false && $(git rev-parse --abbrev-ref HEAD) != "main" ]]; then
  echo "${YELLOW}WARNING:${COLORLESS} This script will submit work from the current HEAD."
  echo "You do not have the 'main' branch checked out."
  exit 1
fi

# Friendly message to tell student when submission is complete
echo ""
echo "${YELLOW}NOTE: Your submission is complete if and only if this script finishes with a${COLORLESS} ✅"
echo ""

# Input the submission server url
read -p "${MAGENTA}Enter the submission url your proctor gave you ($SUBMISSION_URL):${COLORLESS} " SUBMISSION_URL_ENTRY
# Check that a url to the submission server was provided and removed trailing whitespace
if [[ $SUBMISSION_URL_ENTRY != "" ]]; then
  SUBMISSION_URL=$(echo $SUBMISSION_URL_ENTRY | sed 's:/*$::')
  SUBMISSION_URL=$(echo $SUBMISSION_URL | xargs)
fi

# Try pinging the server to see if it is up
if [[ $(curl -s ${SUBMISSION_URL}) != "ready" ]]; then
  echo "${RED}ERROR:${COLORLESS} The submission server is not ready, please see a proctor."
  exit 1
fi

# Print the submission URL as verification
echo "${BOLD}Sumbission Server:${COLORLESS} ${GREEN}${SUBMISSION_URL}${COLORLESS}"
echo ""

# Input GitHub handle or use git config user.name
read -p "${MAGENTA}Enter your GitHub username ($GITHUB_HANDLE):${COLORLESS} " GITHUB_USERNAME

# Check that a GitHub handle was provided and reassign
if [[ $GITHUB_USERNAME != "" ]]; then
  GITHUB_HANDLE=$GITHUB_USERNAME
fi

# forces gh handle to lowercase
GITHUB_HANDLE=$(echo $GITHUB_HANDLE | tr '[:upper:]' '[:lower:]')

# Print the GitHub handle as verification
echo "${BOLD}Github Handle:${COLORLESS} ${GREEN}${GITHUB_HANDLE}${COLORLESS}"
echo ""

# Create the submission URL with the GitHub handle query param
USER_SUBMISSION_URL="$SUBMISSION_URL/submit?username=$GITHUB_HANDLE"

# Fetch the repo name from the submission server
ASSESSMENT_REPO_NAME=$(curl -s "${USER_SUBMISSION_URL}&repo=true")

# If no repo name was returned, the submission server is not ready
if [[ $ASSESSMENT_REPO_NAME == "" ]]; then
  echo "${RED}ERROR:${COLORLESS} The submission server is not ready, please see a proctor."
  exit 1
fi

# Check that the server is accepting the correct repo
read -p "${MAGENTA}Are you submitting the${COLORLESS} ${GREEN}${ASSESSMENT_REPO_NAME}${COLORLESS} ${MAGENTA}assessment?${COLORLESS} (${YELLOW}Y/N${COLORLESS}): " IS_ASSESSMENT_VERIFIED

if [[ $IS_ASSESSMENT_VERIFIED =~ ^[Nn]$ ]]; then
  echo "${RED}ERROR:${COLORLESS} The assessment was not be verified"
  exit 1
fi

# Print the repo name as verification
echo "${BOLD}Submitting assessment:${COLORLESS} ${GREEN}${ASSESSMENT_REPO_NAME}${COLORLESS}"
echo ""

# Input repo name
SOLUTION_REPO=$(curl --silent ${SUBMISSION_URL}/submit)

# Input Github Personal Access Token
read -p "${MAGENTA}Enter your GitHub Personal Access Token (Leave blank to try system credentials):${COLORLESS} " GITHUB_ACCESS_TOKEN

if [[ $GITHUB_ACCESS_TOKEN != "" ]]; then
  GITHUB_PAT=":$GITHUB_ACCESS_TOKEN"
else
  echo "${RED}Attempting to use system git credentials${COLORLESS}"
  echo "${YELLOW}Look at the top of VS Code to see if you are being prompted for a github access token${COLORLESS}"
fi

# Grant permission to solutions repo.
# Adds user to submission team
if [[ $(curl -X POST -s ${USER_SUBMISSION_URL}) != "ok" ]]; then
  echo "${RED}ERROR:${COLORLESS} Automated submission failed."
  echo "${YELLOW}Please ask a proctor to a proctor to submit your code manually.${COLORLESS}"
  # Remove user from submission team
  curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
  exit 1
fi

# Fetch the solutions repo
if [[ $(git remote | grep -w $REPO_REMOTE_ALIAS) ]]; then
  git remote remove $REPO_REMOTE_ALIAS
fi

# Add sumbission remote to repo
git remote add $REPO_REMOTE_ALIAS https://$GITHUB_HANDLE$GITHUB_PAT@github.com/$SOLUTION_REPO

# Fetch the solutions repo
git fetch $REPO_REMOTE_ALIAS $REPO_BASE_BRANCH

# Check that the fetch was successful
if [[ $? -ne 0 ]]; then
  # Remove sumbission remote to repo
  echo "${RED}ERROR: Fetch failed${COLORLESS} "
  git remote rm $REPO_REMOTE_ALIAS
  read -p "${MAGENTA}Enter your GitHub Personal Access Token:${COLORLESS} " GITHUB_PAT
  git remote add $REPO_REMOTE_ALIAS https://$GITHUB_HANDLE$GITHUB_PAT@github.com/$SOLUTION_REPO

  # Fetch the solutions repo
  git fetch $REPO_REMOTE_ALIAS $REPO_BASE_BRANCH

  if [[ $DRY_RUN = false && $? -ne 0 ]]; then
    echo ""
    echo "${RED}ERROR: Fetch failed. Double check your GitHub handle and that you can access this repo on GitHub:${COLORLESS} "
    echo "${YELLOW}  > https://github.com/$SOLUTION_REPO${COLORLESS}"
    echo ""
    echo "If you see a 404, you do not have access yet."
    echo "If you can see the repo, something else went wrong."
    echo ""
    echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"

    # Remove user from submission team
    curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
    exit 1
  fi
fi

# Fetch the solutions repo
git fetch $REPO_REMOTE_ALIAS $REPO_BASE_BRANCH

# Ensure closing comments have been added by comparing diff with submission repo
if ! [[ $(git diff $REPO_REMOTE_ALIAS/$REPO_BASE_BRANCH -- closing_comments.txt) ]]; then
  echo "${RED}ERROR:${COLORLESS} Closing comments not found."
  echo "${YELLOW}Please fill out and commit your changes to the closing_comments.txt file and try again.${COLORLESS}"

  # Remove user from submission team
  curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
  if [[ $DRY_RUN = false ]]; then
    exit 1
  fi
fi

# Check for prior submission
if [[ $(git ls-remote $REPO_REMOTE_ALIAS | grep -w $GITHUB_HANDLE) ]]; then
  echo "${RED}ERROR:${COLORLESS} Assessmrnt has already been submitted."
  echo "${YELLOW}Please ask a proctor to verify submission to branch '$GITHUB_HANDLE'.${COLORLESS}"
  # Remove user from submission team
  curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
  exit 1
fi

# Push work to submission branch
echo "Submitting work..."
if [[ $DRY_RUN = false && $(git push -f $REPO_REMOTE_ALIAS HEAD:$GITHUB_HANDLE) ]]; then
  echo "${RED}ERROR:${COLORLESS} Push failed."
  echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"
  # Remove user from submission team
  curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
  exit 1
fi

# Confirm successful push to submission branch
if [[ $DRY_RUN = false && $(git diff $REPO_REMOTE_ALIAS/$GITHUB_HANDLE) ]]; then
  echo "${RED}ERROR:${COLORLESS} Push failed. Expected no diff between HEAD and ${REPO_REMOTE_ALIAS}/${GITHUB_HANDLE}"
  echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"
  # Remove user from submission team
  curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
  exit 1
fi

# Done!
echo "${GREEN}"
echo "╔══════════════════════════╗"
echo "║  Submission received ✅  ║"
echo "╚══════════════════════════╝"
echo "${COLORLESS}"

# Clean up
# Remove user from submission team
curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL

# Remove submission repo remote
git remote remove $REPO_REMOTE_ALIAS
