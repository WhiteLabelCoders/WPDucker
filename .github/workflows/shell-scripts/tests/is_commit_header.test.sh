# Script to test is_commit_header.sh script
# Test base on commit messages variants tests
# Curent test has 607280 iterations of variants
# If you change scope of the test please update information about the number of iterations

_HEADINGS=("BREAKING CHANGE" "bugfix" "build" "chore" "ci" "docs" "feat" "feature" "fix" "perf" "refactor" "style" "test" "fail test")
_GITMOJIS=(":art:" ":zap:" ":fire:" ":bug:" ":ambulance:" ":sparkles:" ":memo:" ":rocket:" ":lipstick:" ":tada:" ":white_check_mark:" ":lock:" ":closed_lock_with_key:" ":bookmark:" ":rotating_light:" ":construction:" ":green_heart:" ":arrow_down:" ":arrow_up:" ":pushpin:" ":construction_worker:" ":chart_with_upwards_trend:" ":recycle:" ":heavy_plus_sign:" ":heavy_minus_sign:" ":wrench:" ":hammer:" ":globe_with_meridians:" ":pencil2:" ":poop:" ":rewind:" ":twisted_rightwards_arrows:" ":package:" ":alien:" ":truck:" ":page_facing_up:" ":boom:" ":bento:" ":wheelchair:" ":bulb:" ":beers:" ":speech_balloon:" ":card_file_box:" ":loud_sound:" ":mute:" ":busts_in_silhouette:" ":children_crossing:" ":building_construction:" ":iphone:" ":clown_face:" ":egg:" ":see_no_evil:" ":camera_flash:" ":alembic:" ":mag:" ":label:" ":seedling:" ":triangular_flag_on_post:" ":goal_net:" ":dizzy:" ":wastebasket:" ":passport_control:" ":adhesive_bandage:" ":monocle_face:" ":coffin:" ":test_tube:" ":necktie:" ":stethoscope:" ":bricks:" ":technologist:" ":money_with_wings:" ":thread:" ":safety_vest:" "🎨" "⚡️" "🔥" "🐛" "🚑️" "✨" "📝" "🚀" "💄" "🎉" "✅" "🔒️" "🔐" "🔖" "🚨" "🚧" "💚" "⬇️" "⬆️" "📌" "👷" "📈" "♻️" "➕" "➖" "🔧" "🔨" "🌐" "✏️" "💩" "⏪️" "🔀" "📦️" "👽️" "🚚" "📄" "💥" "🍱" "♿️" "💡" "🍻" "💬" "🗃️" "🔊" "🔇" "👥" "🚸" "🏗️" "📱" "🤡" "🥚" "🙈" "📸" "⚗️" "🔍️" "🏷️" "🌱" "🚩" "🥅" "💫" "🗑️" "🛂" "🩹" "🧐" "⚰️" "🧪" "👔" "🩺" "🧱" "🧑‍💻" "💸" "🧵" "🦺")
_BR="
"
_MESSAGES=("my message" "my message${_BR}with new line")
_TOTAL_TESTS="0"

# Add uppercase headings
for key in "${!_HEADINGS[@]}"; do
    _HEADING="$( echo "${_HEADINGS[$key]}" | tr '[:lower:]' '[:upper:]' )"

    _HEADINGS+=( "${_HEADING}" )
done

# Add lowercase headings
for key in "${!_HEADINGS[@]}"; do
    _HEADING="$( echo "${_HEADINGS[$key]}" | tr '[:upper:]' '[:lower:]' )"

    _HEADINGS+=( "${_HEADING}" )
done

create_message() {
    # Script prepare message variants
    # Required args:
    # 1: variant (0-23 success, 24-39 fails)
    # 2: gitmoji
    # 3: heading
    # 4: scope
    # 5: message

    local _VARIANTS=(
        "[heading] [scope] [colon] [message]"
        "[heading][scope] [colon] [message]"
        "[heading][scope][colon] [message]"
        "[heading][scope][colon][message]"
        "[heading] [colon] [message]"
        "[heading][colon] [message]"
        "[heading][colon][message]"
        "[gitmoji] [heading] [scope] [colon] [message]"
        "[gitmoji][heading] [scope] [colon] [message]"
        "[gitmoji][heading][scope] [colon] [message]"
        "[gitmoji][heading][scope][colon] [message]"
        "[gitmoji][heading][scope][colon][message]"
        "[gitmoji] [heading] [colon] [message]"
        "[gitmoji][heading] [colon] [message]"
        "[gitmoji][heading] [colon] [message]"
        "[gitmoji][heading][colon] [message]"
        "[gitmoji][heading][colon][message]"
        "[heading] [scope] [colon]"
        "[heading][scope] [colon]"
        "[heading][scope][colon]"
        "[gitmoji] [heading] [scope] [colon]"
        "[gitmoji][heading] [scope] [colon]"
        "[gitmoji][heading][scope] [colon]"
        "[gitmoji][heading][scope][colon]"
        "[heading] [scope] [message]"
        "[heading][scope] [message]"
        "[heading][scope] [message]"
        "[heading][scope][message]"
        "[gitmoji] [heading] [scope] [message]"
        "[gitmoji][heading] [scope] [message]"
        "[gitmoji][heading][scope] [message]"
        "[gitmoji][heading][scope] [message]"
        "[gitmoji][heading][scope][message]"
        "[scope] [colon] [message]"
        "[scope][colon] [message]"
        "[scope][colon][message]"
        "[gitmoji] [scope] [colon] [message]"
        "[gitmoji][scope] [colon] [message]"
        "[gitmoji][scope][colon] [message]"
        "[gitmoji][scope][colon][message]"
    )

    local _ARG_VARIANT="${1}"
    local _ARG_GITMOJI="${2}"
    local _ARG_HEADING="${3}"
    local _ARG_SCOPE="${4}"
    local _ARG_MESSAGE="${5}"

    local _VARIANT="${_VARIANTS[$_ARG_VARIANT]}"

    _VARIANT="${_VARIANT/\[gitmoji\]/$_ARG_GITMOJI}"
    _VARIANT="${_VARIANT/\[heading\]/$_ARG_HEADING}"
    _VARIANT="${_VARIANT/\[scope\]/$_ARG_SCOPE}"
    _VARIANT="${_VARIANT/\[colon\]/:}"
    _VARIANT="${_VARIANT/\[message\]/$_ARG_MESSAGE}"

    echo "${_VARIANT}"
}

# Loop over headings
for h_key in "${!_HEADINGS[@]}"; do
    _HEADING="${_HEADINGS[$h_key]}"

    # Loop over gitmojis
    for g_key in "${!_GITMOJIS[@]}"; do
        _GITMOJI="${_GITMOJIS[$g_key]}"

        echo "total: ${_TOTAL_TESTS} -> ${_HEADING} -> ${_GITMOJI}"

        # Loop over messages
        for m_key in "${!_MESSAGES[@]}"; do
            _MESSAGE="${_MESSAGES[$m_key]}"

            # Test should pass
            for p_i in $(seq 0 23);
            do
                _VARIANT="${p_i}"

                _MSG="$( create_message $_VARIANT "${_GITMOJI}" "${_HEADING}" "(#DEV-3722)" "${_MESSAGE}" )"

                _TEST_RESULT="$( ./../is_commit_header.sh "${_HEADING}" "${_MSG}" )"

                _TOTAL_TESTS="$(($_TOTAL_TESTS + 1))"

                if [[ "1" != "${_TEST_RESULT}" ]]; then
                    echo "TEST FAILED: ${_VARIANT}: ${_TEST_RESULT} -> ${_MSG}"
                fi
            done

            # Test should fail
            for f_i in $(seq 24 39);
            do
                _VARIANT="${f_i}"

                _MSG="$( create_message $_VARIANT "${_GITMOJI}" "${_HEADING}" "(#DEV-3722)" "${_MESSAGE}" )"

                _TEST_RESULT="$( ./../is_commit_header.sh "${_HEADING}" "${_MSG}" )"
                
                _TOTAL_TESTS="$(($_TOTAL_TESTS + 1))"

                if [[ "0" != "${_TEST_RESULT}" ]]; then
                    echo "TEST FAILED: ${_VARIANT}: ${_TEST_RESULT} -> ${_MSG}"
                fi
            done
        done
    done
done
