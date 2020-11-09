#!/bin/bash

uuidgen > VERSION

git add VERSION

git commit -m "$1"

git push origin $(git rev-parse --abbrev-ref HEAD)
