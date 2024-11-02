class IPCService {
  static send(channel: string, ...args: any[]) {
    window.api.send(channel, ...args);
  }

  static receive(channel: string, func: (...args: any[]) => void) {
    window.api.receive(channel, func);
  }

  static removeListener(channel: string, func: (...args: any[]) => void) {
    window.api.removeListener(channel, func);
  }

  // Credentials
  static async saveCredentials(credentials: any) {
    return this.send('savePassword', credentials);
  }

  static async getCredentials() {
    return new Promise((resolve) => {
      this.send('getPassword');
      this.receive('getPassword', resolve);
    });
  }

  // Settings
  static setZoom(factor: number) {
    this.send('zoom', factor);
  }

  static setAutostart(enabled: boolean) {
    this.send('autostart', enabled);
  }

  // Updates
  static checkForUpdates() {
    this.send('checkForUpdates');
  }

  static installUpdate() {
    this.send('runUpdate');
  }

  // Window management
  static openDevTools() {
    this.send('openDevTools');
  }

  static openInNewWindow(url: string) {
    this.send('openInNewWindow', url);
  }
}

export default IPCService;
