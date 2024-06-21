#!/usr/bin/env bash

# Script return latest release tag of empty string
# Required args:
# 1: tag name pattern

_CMD_TAG_LITS="git tag --list --sort=\"-v:refname\" \"${1}\""
_TAG_LIST="$( eval "${_CMD_TAG_LITS}" )"
_LATEST_TAG="$( echo "${_TAG_LIST}" | head -n 1 )"

echo "${_LATEST_TAG}"