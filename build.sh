#!/bin/sh
source ~/.config/user-dirs.dirs
git pull
git checkout -- .
yarn
VERSION="$(jq .version package.json)"
BASEDIR="$XDG_DESKTOP_DIR/bbzcloud-build"
if [ -d "$BASEDIR" ]; then
  # Take action if $DIR exists. #
  echo "${DIR} existiert bereits. Exit!"
  exit 1
fi
mkdir $BASEDIR
rm -rf release/build
echo "Baue Lehrerversion..."
yarn dist -lw # Only Windows and Linux for now
mkdir $BASEDIR/teacher
mv release/build $BASEDIR/teacher
echo "Baue Schülerversion..."
echo "{ \"value\": false }" > assets/isTeacher.json
sed -i -e 's/bbz-cloud/bbz-cloud-sus/g' package.json
sed -i -e 's/koyuawsmbrtn/dclausen01/g' package.json
yarn dist -lw
mkdir $BASEDIR/sus
mv release/build $BASEDIR/sus
git checkout -- .
echo "Fertig! 🎉️"
