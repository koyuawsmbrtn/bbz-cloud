cd ~/bbz-cloud
git pull
git checkout -- .
rm -rf ~/Desktop/bbzcloud-build
mkdir -p ~/Desktop/bbzcloud-build/sus
mkdir -p ~/Desktop/bbzcloud-build/teacher
yarn
rm -rf release/build
echo "Baue Lehrerversion..."
yarn dist -m
mv release/build ~/Desktop/bbzcloud-build/teacher
echo "Baue Schülerversion..."
echo "{ \"value\": false }" > assets/isTeacher.json
sed -i -e 's/bbz-cloud/bbz-cloud-sus/g' package.json
sed -i -e 's/koyuawsmbrtn/dclausen01/g' package.json
yarn dist -m
mv release/build ~/Desktop/bbzcloud-build/sus
git checkout -- .
echo "Fertig! 🎉️"
