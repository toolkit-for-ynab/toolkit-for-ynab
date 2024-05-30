#!/usr/bin/env bash

export PRECOMMIT=0
export PREPUSH=0

check() {
  pnpm run test
}
