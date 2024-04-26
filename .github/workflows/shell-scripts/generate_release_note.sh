#!/usr/bin/env bash

# Script generate release note and save it to file
# Required args:
# 1: file to save note
# 2: first commit sha from range to analyse
# 3: last commit sha from range to analyse

_FILENAME=$(awk '{gsub(/ /, "\\ "); print}' <<< "$(readlink -f "$0")")
_WORKDIR=$(eval dirname $_FILENAME)

_COMMITS_TO_ANALYZE="$( git log --oneline --reverse --format="%H" "${2}".."${3}" )"
_MSG_BREAKING_CHANGES=()
_MSG_FEATURES=()
_MSG_FIXES=()
_MSG_BUILD=()
_MSG_CHORE=()
_MSG_CI=()
_MSG_DOCS=()
_MSG_PERF=()
_MSG_REFACTOR=()
_MSG_STYLE=()
_MSG_TEST=()

while IFS= read -r _COMMIT; do
    _COMMIT_MSG="$( git log --oneline --format="%s" -n 1 "${_COMMIT}" | tr '[:upper:]' '[:lower:]' )"

    if [[ "$( $_WORKDIR/is_commit_header.sh "breaking change" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_BREAKING_CHANGES[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_BREAKING_CHANGES+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "feat" "${_COMMIT_MSG}")" == "1" || "$($_WORKDIR/is_commit_header.sh "feature" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_FEATURES[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_FEATURES+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "fix" "${_COMMIT_MSG}")" == "1" || "$($_WORKDIR/is_commit_header.sh "bugfix" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_FIXES[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_FIXES+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "build" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_BUILD[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_BUILD+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "chore" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_CHORE[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_CHORE+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "ci" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_CI[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_CI+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "docs" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_DOCS[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_DOCS+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "perf" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_PERF[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_PERF+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "refactor" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_REFACTOR[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_REFACTOR+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "style" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_STYLE[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_STYLE+=("${_MSG}")
        fi
    elif [[ "$($_WORKDIR/is_commit_header.sh "test" "${_COMMIT_MSG}")" == "1" ]]; then
        _MSG="${_COMMIT_MSG}"
        _MSG_EXIST="0"

        for item in "${_MSG_TEST[@]}"; do
            if [ "${item}" == "${_MSG}" ]; then
                _MSG_EXIST="1"
                break
            fi
        done

        if [[ "${_MSG_EXIST}" == "0" ]]; then
            _MSG_TEST+=("${_MSG}")
        fi
    fi
done <<< "$_COMMITS_TO_ANALYZE"

_BR="
"

echo "# Release note${_BR}" >> "${1}"

# BREAKING CHANGE
if [[ "${#_MSG_BREAKING_CHANGES[@]}" != "0" ]]; then
    echo "## :boom: Breaking changes:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_BREAKING_CHANGES[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# FEATURE
if [[ "${#_MSG_FEATURES[@]}" != "0" ]]; then
    echo "## :sparkles: Features:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_FEATURES[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# FIXES
if [[ "${#_MSG_FIXES[@]}" != "0" ]]; then
    echo "## :bug: Fixes:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_FIXES[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# BUILD
if [[ "${#_MSG_BUILD[@]}" != "0" ]]; then
    echo "## :building_construction: Builds:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_BUILD[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# CHORE
if [[ "${#_MSG_CHORE[@]}" != "0" ]]; then
    echo "## :bookmark: Chores:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_CHORE[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# CI
if [[ "${#_MSG_CI[@]}" != "0" ]]; then
    echo "## :bookmark: CI:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_CI[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# DOCS
if [[ "${#_MSG_DOCS[@]}" != "0" ]]; then
    echo "## :pencil: Documentation:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_DOCS[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# PERF
if [[ "${#_MSG_PERF[@]}" != "0" ]]; then
    echo "## :zap: Performance:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_PERF[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# REFACTOR
if [[ "${#_MSG_REFACTOR[@]}" != "0" ]]; then
    echo "## :recycle: Refactor:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_REFACTOR[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# STYLE
if [[ "${#_MSG_STYLE[@]}" != "0" ]]; then
    echo "## :art: Style:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_STYLE[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done

# TEST
if [[ "${#_MSG_TEST[@]}" != "0" ]]; then
    echo "## :test_tube: Tests:${_BR}" >> "${1}"
fi

for _NOTES_ELEMENT in "${_MSG_TEST[@]}"; do
    echo "  - ${_NOTES_ELEMENT}${_BR}" >> "${1}"
done