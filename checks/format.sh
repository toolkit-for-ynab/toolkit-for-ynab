#!/usr/bin/env bash

export PRECOMMIT=1
export PREPUSH=1

. ./checks/_lib.sh

check() {
  if is_ci; then
    yarn pretty-quick --check
  else
    yarn pretty-quick --staged
  fi
}
