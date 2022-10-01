#!/bin/sh
git pull
yarn dist
VERSION="$(jq .version package.json)"
BASEDIR="~/Schreibtisch/bbzcloud-build"
if [ -d "$BASEDIR" ]; then
  # Take action if $DIR exists. #
  echo "${DIR} existiert bereits. Exit!"
  exit
fi
mkdir $BASEDIR
