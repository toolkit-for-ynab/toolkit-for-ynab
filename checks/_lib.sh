#!/usr/bin/env bash

# Finds the check scripts in the check/ directory
# Must be run from the repo root
find_check_files() {

  # Dummy variables/functions are set so that
  # the call to unset below doesn't fail if
  # those variables are not set from the script
  check() {
    return
  }
  PRECOMMIT=1
  PREPUSH=1
  # END dummy variables

  find ./checks -type f \
    -name '*.sh' \
    -not -name '_lib.sh' \
    -not -name '_template.sh' | sort | while read -r file 
  do
    unset check PRECOMMIT PREPUSH
    . "$file"
    case $1 in
    precommit)
      if [ "$PRECOMMIT" = 1 ]; then
        echo "$file"
      fi
      ;;
    prepush)
      if [ "$PREPUSH" = 1 ]; then
        echo "$file"
      fi
      ;;
    all)
      echo "$file"
      ;;
    *)
      echo "Unrecognized argument: $1" 1>&2
      return 1
      ;;
    esac
  done
}

# $1 - any of 'precommit', 'prepush', or 'all'
run_checks() {
  echo "Running $1 checks"
  for file in $(find_check_files "$1"); do
    printf '\nRunning check %s\n\n' "$file"

    . "$file"
    check
  done
}

is_ci() {
  # The CI variable is present when running in GitHub actions/workflows.
  [ -n "$CI" ]
}
