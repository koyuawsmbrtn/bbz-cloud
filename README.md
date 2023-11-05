## Starting Development

Start the app in the `dev` environment:

```bash
yarn dev
```

## Packaging for Production

To package apps for the local platform:

```bash
yarn dist
```

Or run `./build.sh` to build for all platforms and release channels. Make sure you have Wine installed if you want to build for Windows on Linux.

### Building for Arch Linux on Ubuntu

Install `libarchive-tools` using apt, see this issue: https://github.com/electron-userland/electron-builder/issues/4181#issuecomment-674413927

## Binaries

### For teachers

Snap: `sudo snap install bbzcloud --channel=stable/teacher`

AppImage & Windows: https://github.com/koyuawsmbrtn/bbz-cloud/releases

AUR: https://aur.archlinux.org/packages/bbz-cloud

### For students

Snap: `sudo snap install bbzcloud`

AppImage & Windows: https://github.com/dclausen01/bbz-cloud-sus/releases

AUR: https://aur.archlinux.org/packages/bbz-cloud-sus

DEB:

```
echo "deb [trusted=yes] https://repo.koyu.space/apt/ /" | sudo tee /etc/apt/sources.list.d/koyu.list
sudo apt update
sudo apt install -y bbzcloud
```
RPM:

```
sudo tee -a /etc/yum.repos.d/ > /dev/null <<EOT
[fury]
name=koyu.space
baseurl=https://repo.koyu.space/yum/
enabled=1
gpgcheck=0
EOT
sudo dnf check-updates
sudo dnf install -y bbzcloud
```
