cd ~/bbz-cloud
git pull
git checkout -- .
export BASEDIR="~/Desktop/bbzcloud-build"
if [ -d "$BASEDIR" ]; then
  # Take action if $DIR exists. #
  echo "$BASEDIR existiert bereits. Exit!"
  exit 1
fi
yarn
mkdir $BASEDIR
rm -rf release/build
echo "Baue Lehrerversion..."
yarn dist -m
mkdir $BASEDIR/teacher
mv release/build $BASEDIR/teacher
echo "Baue Schülerversion..."
echo "{ \"value\": false }" > assets/isTeacher.json
sed -i -e 's/bbz-cloud/bbz-cloud-sus/g' package.json
sed -i -e 's/koyuawsmbrtn/dclausen01/g' package.json
yarn dist -m
mkdir $BASEDIR/sus
mv release/build $BASEDIR/sus
git checkout -- .
echo "Fertig! 🎉️"
