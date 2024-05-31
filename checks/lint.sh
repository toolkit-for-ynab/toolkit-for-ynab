#!/usr/bin/env bash

export PRECOMMIT=1
export PREPUSH=1

check() {
  pnpm run lint
}
