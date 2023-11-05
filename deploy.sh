#!/bin/bash
echo "This will only deploy .deb and .rpm packages. Please manually deploy for pacman and snap."
BASEDIR="$XDG_DESKTOP_DIR/bbzcloud-build"
fury migrate $BASEDIR/sus/build/*.deb $BASEDIR/sus/build/*.rpm
