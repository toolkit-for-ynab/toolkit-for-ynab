#!/usr/bin/env bash

# Change either of these values to 1 to allow this check to run in
# that phase of CI.
#
# The check will always run in GitHub pull request CI, regardless.
#
# Checks that are short to run and show easy-to-fix errors (like formatting)
# are best for precommit hooks.
export PRECOMMIT=0
# Checks that are longer and may introduce more difficult-to-fix errors (like type checking)
# are best for prepush hooks.
export PREPUSH=0
# The longest or mostly irrelevant checks should be left to GitHub CI.

# This function will be run when the check is invoked in its configured phases of CI.
check() {
  # Don't forget to remove or replace this statement, it's just a placeholder!
  echo "Check, check, one, two." && return 1
}
