#!/usr/bin/env bash

export PRECOMMIT=0
export PREPUSH=1

check() {
  yarn type-check
}
