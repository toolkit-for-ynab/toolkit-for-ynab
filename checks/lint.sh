#!/usr/bin/env bash

export PRECOMMIT=1
export PREPUSH=1

check() {
  yarn lint
}
