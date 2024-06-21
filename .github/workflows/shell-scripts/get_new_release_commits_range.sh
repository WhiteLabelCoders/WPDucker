#!/usr/bin/env bash

# Script return first and last commit from the range to next release
# Required args:
# 1: latest release tag

_TAG_COMMIT_SHA="$( git rev-parse --quiet --verify "${1}"^{commit} )"
_LATEST_COMMIT_SHA="$( git log --oneline --format="%H" | head -n 1 )"
_OLDEST_COMMIT_SHA="$( git log --oneline --format="%H" | tail -n 1 )"
_FROM_SHA=""
_TOO_SHA=""

if [[ "${_TAG_COMMIT_SHA}" != "" ]]; then
    _FROM_SHA="${_TAG_COMMIT_SHA}"
else
    _FROM_SHA="${_OLDEST_COMMIT_SHA}"
fi

_TOO_SHA="${_LATEST_COMMIT_SHA}"

echo "${_FROM_SHA},${_TOO_SHA}"