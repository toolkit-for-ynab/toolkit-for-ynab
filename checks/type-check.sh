#!/usr/bin/env bash

PRECOMMIT=0
PREPUSH=1

check() {
  yarn tsc
}
