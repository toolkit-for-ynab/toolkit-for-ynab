#!/usr/bin/env bash

. ./checks/_lib.sh

export PRECOMMIT=0
export PREPUSH=0

# Each file must export a PRECOMMIT and PREPUSH var
# with a value of 1 or 0
check_var() {
  file=$1
  value=$2
  var_name=$3

  if [ -z "$value" ]; then
    echo "$file must have a '$var_name' variable."
    return 1
  fi

  if [ $((value)) -ne 1 ] && [ $((value)) -ne 0 ]; then
    echo "$file must have a '$var_name' variable with a value of 1 or 0, got: $value"
    return 1
  fi
}

check() {
  for file in $(find_check_files all); do
    # Clean up previous loop's state
    unset check PRECOMMIT PREPUSH >/dev/null 2>&1 || true

    if ! . "$file"; then
      echo "Failed to source file: $file"
      return 1
    fi

    # Each file must have a check function
    if ! [ "$(type -t check)" = function ]; then
      echo "$file must have a 'check' function."
      return 1
    fi

    check_var "$file" "$PRECOMMIT" PRECOMMIT
    check_var "$file" "$PREPUSH" PREPUSH

    echo "$file OK"
  done
}
