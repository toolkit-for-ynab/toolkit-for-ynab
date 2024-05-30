#!/usr/bin/env bash

export PRECOMMIT=1
export PREPUSH=1

. ./checks/_lib.sh

check() {
  if is_ci; then
    pnpm pretty-quick --check
  else
    pnpm pretty-quick --staged
  fi
}
