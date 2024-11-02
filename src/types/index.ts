export interface Credentials {
  outlookUsername: string;
  outlookPassword: string;
  moodleUsername: string;
  moodlePassword: string;
  bbbUsername: string;
  bbbPassword: string;
}

export interface AppLink {
  url: string;
  icon: string;
  enabled: boolean;
  teacher: boolean;
}

export interface CustomApp {
  name: string;
  url: string;
}

export interface WebviewState {
  isLoaded: boolean;
  url: string;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface DownloadProgress {
  progress: number;
  status: 'idle' | 'downloading' | 'completed' | 'failed' | 'interrupted' | 'paused';
}

export interface AppSettings {
  autostart: boolean;
  zoomFactor: number;
  enabledApps: string[];
}
