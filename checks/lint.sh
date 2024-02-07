#!/usr/bin/env bash

PRECOMMIT=1
PREPUSH=1

check() {
  yarn lint
}
