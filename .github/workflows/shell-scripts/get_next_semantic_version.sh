#!/usr/bin/env bash

# Script return next semantic version
# Required args:
# 1: latest semantic version
# 2: first commit sha from range to analyse
# 3: last commit sha from range to analyse

_FILENAME=$(awk '{gsub(/ /, "\\ "); print}' <<< "$(readlink -f "$0")")
_WORKDIR=$(eval dirname $_FILENAME)

_MAJOR="0"
_MAJOR_UPDATED="0"
_MINOR="0"
_MINOR_UPDATED="0"
_PATH="0"
_PATH_UPDATED="0"

_VERSION="${1}"
if [[ "${_VERSION}" != "" ]]; then
    IFS='.' read -ra EXPLODED_VERSION <<< "$_VERSION"

    _ALIAS="MAJOR"

    for _NUMBER in "${EXPLODED_VERSION[@]}"; do
        if [[ "${_ALIAS}" == "MAJOR" ]]; then
            _ALIAS="MINOR"
            _MAJOR="${_NUMBER}"
        elif [[ "${_ALIAS}" == "MINOR" ]]; then
            _ALIAS="PATH"
            _MINOR="${_NUMBER}"
        elif [[ "${_ALIAS}" == "PATH" ]]; then
            _ALIAS=""
            _PATH="${_NUMBER}"
        fi
    done
fi


_CMD_GET_COMMITS_TO_ANALYZE="git log --oneline --reverse --format=\"%H\" ${2}..${3}"
_COMMITS_TO_ANALYZE="$( eval "${_CMD_GET_COMMITS_TO_ANALYZE}" )"

while IFS= read -r _COMMIT; do
    _COMMIT_MSG="$( git log --oneline --format="%s" -n 1 "${_COMMIT}" | tr '[:upper:]' '[:lower:]' )"

    if [[ "$($_WORKDIR/is_commit_header.sh "breaking change" "${_COMMIT_MSG}")" == "1" && "${_MAJOR_UPDATED}" == "0" ]]; then
        _MAJOR="$(( $_MAJOR + 1 ))"
        _MAJOR_UPDATED="1"
        _MINOR_UPDATED="1"
        _PATH_UPDATED="1"
        _MINOR="0"
        _PATH="0"
    elif [[ ( "$($_WORKDIR/is_commit_header.sh "feat" "${_COMMIT_MSG}")" == "1" || "$($_WORKDIR/is_commit_header.sh "feature" "${_COMMIT_MSG}")" == "1" ) && "${_MINOR_UPDATED}" == "0" ]]; then
        _MINOR="$(( $_MINOR + 1 ))"
        _MINOR_UPDATED="1"
        _PATH_UPDATED="1"
        _PATH="0"
    elif [[ "${_PATH_UPDATED}" == "0" ]]; then
        _PATH="$(( $_PATH + 1 ))"
        _PATH_UPDATED="1"
    fi

done <<< "$_COMMITS_TO_ANALYZE"

echo "${_MAJOR}.${_MINOR}.${_PATH}"