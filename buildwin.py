import os
import sys

desktop = os.path.join(os.path.join(os.environ['USERPROFILE']), 'Desktop')

if os.path.exists(os.path.join(desktop, "bbzcloud-build")):
  print(os.path.join(desktop, "bbzcloud-build")+" existiert bereits. Exit!")
else:
  os.system("git pull")
  os.system("git checkout -- .")
  os.system("yarn")
  os.mkdir(os.path.join(desktop, "bbzcloud-build"))
  os.system("rm.exe -rf release/build")
  print("Baue Lehrerversion...")
  os.system("yarn distw") # Only Windows on Windows supported right now, will fix that later
  os.rename("release/build", os.path.join(desktop, "bbzcloud-build", "teacher"))
  print("Baue Schülerversion...")
  f = open("assets/isTeacher.json", "w")
  f.write("{ \"value\": false }")
  f.close()
  os.system("sed -i -e 's/bbz-cloud/bbz-cloud-sus/g' package.json")
  os.system("sed -i -e 's/koyuawsmbrtn/dclausen01/g' package.json")
  os.system("yarn distw")
  os.rename("release/build", os.path.join(desktop, "bbzcloud-build", "sus"))
  os.system("git checkout -- .")
  print("Fertig! 🎉️")
