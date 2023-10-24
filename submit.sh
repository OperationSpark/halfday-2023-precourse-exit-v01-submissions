#!/bin/bash
#
# A small script to help submit technical assessment solutions
# Author: Dan Thareja <dan.thareja@hackreactor.com>
#

# Pretty colors
RED=$'\e[31m'
GREEN=$'\e[32m'
YELLOW=$'\u001b[33;1m'
MAGENTA=$'\e[35m'
CYAN=$'\e[36m'
COLORLESS=$'\e[0m'

# Optional configuration
REPO_BASE_BRANCH="main"
REPO_REMOTE_ALIAS="solution"

GITHUB_HANDLE=`git config --global user.name`
SUBMISSION_URL=https://tools.operationspark.org/api/assessment


# Check that there is no outstanding work to commit
if [[ `git status --porcelain` ]]; then
  echo "${RED}ERROR:${COLORLESS} Your working directory has some changes not yet committed."
  echo "To help ensure you haven't forgot something, the submission process has been suspended."
  echo "${YELLOW}Please clean your working directory and try again.${COLORLESS}"
  exit 1
fi


# Warn if not on main
if [[ `git rev-parse --abbrev-ref HEAD` != "main" ]]; then
  echo "${YELLOW}WARNING:${COLORLESS} This script will submit work from the current HEAD."
  echo "You do not have the 'main' branch checked out."
  exit 1
fi

# Friendly message to tell student when submission is complete
echo ""
echo "${YELLOW}NOTE: Your submission is complete if and only if this script finishes with a${COLORLESS} ✔️ "
echo ""


# Input the submission server url
read -p "${MAGENTA}Enter the submission url your proctor gave you ($SUBMISSION_URL):${COLORLESS} " SUBMISSION_URL_ENTRY
# Check that a url to the submission server was provided and removed trailing whitespace
if [[ $SUBMISSION_URL_ENTRY != "" ]]; then
  SUBMISSION_URL=$(echo $SUBMISSION_URL_ENTRY | sed 's:/*$::')
  SUBMISSION_URL=$(echo $SUBMISSION_URL | xargs)
fi

# Try pinging the server to see if it is up
if [[ `curl -s ${SUBMISSION_URL}` != "ready" ]]; then
  echo "${RED}ERROR:${COLORLESS} The submission server is not ready, please see a proctor."
  exit 1
fi

USER_SUBMISSION_URL="$SUBMISSION_URL/submit?username=$GITHUB_HANDLE"

# Check that the server is accepting the correct repo
ASSESSMENT_REPO_NAME=`curl -s "${USER_SUBMISSION_URL}&repo=true"`

if [[ $ASSESSMENT_REPO_NAME == "" ]]; then
  echo "${RED}ERROR:${COLORLESS} The submission server is not ready, please see a proctor."
  exit 1
fi

printf "${MAGENTA}Are you submitting the ${COLORLESS}${GREEN}${ASSESSMENT_REPO_NAME}${COLORLESS} ${MAGENTA}assessment?${COLORLESS} (${YELLOW}Y/N${COLORLESS}): ${GREEN}"

read -p "" IS_ASSESSMENT_VERIFIED
echo "${COLORLESS}"

if [[ $IS_ASSESSMENT_VERIFIED =~ ^[Nn]$ ]]; then
  echo "${RED}ERROR:${COLORLESS} The assessment was not verified"
  exit 1
fi


# Input repo name
SOLUTION_REPO=`curl --silent ${SUBMISSION_URL}/submit`

# Input GitHub handle
read -p "${MAGENTA}Enter your GitHub username ($GITHUB_HANDLE):${COLORLESS} " GITHUB_USERNAME

if [[ $GITHUB_USERNAME != "" ]]; then
  GITHUB_HANDLE=$GITHUB_USERNAME
fi

# forces gh handle to lowercase
GITHUB_HANDLE=`echo $GITHUB_HANDLE | tr '[:upper:]' '[:lower:]'`

# Input Github Personal Access Token
read -p "${MAGENTA}Enter your GitHub Personal Access Token (Leave blank to try system credentials):${COLORLESS} " GITHUB_ACCESS_TOKEN

if [[ $GITHUB_ACCESS_TOKEN != "" ]];
then
  GITHUB_PAT=":$GITHUB_ACCESS_TOKEN"
else
  echo "${RED}Attempting to use system git credentials${COLORLESS}"
fi


# Grant permission to solutions repo.
if [[ `curl -X POST -s ${USER_SUBMISSION_URL}` != "ok" ]]; then
  echo "${RED}ERROR:${COLORLESS} Automated submission failed."
  echo "${YELLOW}Please ask a proctor to a proctor to submit your code manually.${COLORLESS}"
  exit 1
fi


# Fetch the solutions repo
if [[ `git remote | grep -w $REPO_REMOTE_ALIAS` ]]; then
  git remote remove $REPO_REMOTE_ALIAS
fi

git remote add $REPO_REMOTE_ALIAS https://$GITHUB_HANDLE$GITHUB_PAT@github.com/$SOLUTION_REPO


git fetch $REPO_REMOTE_ALIAS $REPO_BASE_BRANCH

if [[ $? -ne 0 ]]; then
  echo "${RED}ERROR:${COLORLESS} Fetch failed. Double check your GitHub handle and that you can access this repo on GitHub:"
  echo "    https://github.com/$SOLUTION_REPO"
  echo "If you see a 404, you do not have access yet."
  echo "If you can see the repo, something else went wrong."
  echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"
  exit 1
fi


# Ensure closing comments have been added
if ! [[ `git diff $REPO_REMOTE_ALIAS/$REPO_BASE_BRANCH -- closing_comments.txt` ]]; then
  echo "${RED}ERROR:${COLORLESS} Closing comments not found."
  echo "${YELLOW}Please fill out and commit your changes to the closing_comments.txt file and try again.${COLORLESS}"
  exit 1
fi


# Check for prior submission
if [[ `git ls-remote $REPO_REMOTE_ALIAS | grep -w $GITHUB_HANDLE` ]]; then
  echo "${RED}ERROR:${COLORLESS} Work has already been pushed to the branch '$GITHUB_HANDLE'."
  echo "${YELLOW}Please find a proctor if this is unexpected.${COLORLESS}"
  exit 1
fi

# #!### START Removed ###!#
# # # Review submission
# # echo "${MAGENTA}Review your submission!${COLORLESS}"
# # echo "You are about to see a ${CYAN}git diff${COLORLESS} of your work."
# # echo "By default, this will open with the ${CYAN}less${COLORLESS} file viewer"
# # echo "Scroll with ${CYAN}[d]${COLORLESS} and ${CYAN}[u]${COLORLESS} and press ${CYAN}[q]${COLORLESS} to exit"
# # read -p "Press ${CYAN}[ENTER]${COLORLESS} to view a diff of your work..."
# # git diff $REPO_REMOTE_ALIAS/$REPO_BASE_BRANCH


# # # Confirm review
# # read -p "${MAGENTA}Does this diff contain all of the code you want to submit? <y/N> ${COLORLESS}" response
# # if ! [[ $response =~ [yY](es)* ]]; then
# #   echo "${YELLOW}Please review your code and run this script when you are ready to submit again${COLORLESS}"
# #   exit 1
# # fi
# #!### END Removed ###!#


# Push work
echo "Submitting work..."
if [[ `git push -f $REPO_REMOTE_ALIAS HEAD:$GITHUB_HANDLE` ]]; then
  echo "${RED}ERROR:${COLORLESS} Push failed."
  echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"
  exit 1
fi


# Confirm push
if [[ `git diff $REPO_REMOTE_ALIAS/$GITHUB_HANDLE` ]]; then
  echo "${RED}ERROR:${COLORLESS} Push failed. Expected no diff between HEAD and ${REPO_REMOTE_ALIAS}/${GITHUB_HANDLE}"
  echo "${YELLOW}Please read the error message above and find a proctor if you need help.${COLORLESS}"
  exit 1
fi

# Done!
echo "${GREEN}"
echo "╔═════════════════════════╗"
echo "║  Submission received ✔️  ║"
echo "╚═════════════════════════╝"
echo "${COLORLESS}"

# Clean up
curl -X DELETE -s -o /dev/null $USER_SUBMISSION_URL
git remote remove $REPO_REMOTE_ALIAS
