export const config = {
  api: {
    weather: {
      url: 'https://api.openweathermap.org/data/2.5/weather',
      city: 'Rendsburg',
      apiKey: '735f03336131c3e5700d4e07662d570c',
    },
  },
  defaults: {
    zoomFactor: 0.8,
    windowSize: {
      width: 1600 * 0.9,
      height: 900 * 0.9,
    },
  },
  urls: {
    homepage: 'https://github.com/koyuawsmbrtn/bbz-cloud',
    support: 'https://github.com/koyuawsmbrtn/bbz-cloud/issues',
    developer: 'https://web.koyu.space',
  },
  updateInterval: 10000, // 10 seconds
  weatherUpdateInterval: 300000, // 5 minutes
};

export const SUPPORTED_DOWNLOAD_TYPES = [
  '.mp4', '.mp3', '.ogg', '.flac', '.wav', '.mkv',
  '.mov', '.wmv', '.oga', '.ogv', '.opus', '.xls',
  '.xlsx', '.ppt', '.zip', '.exe', '.AppImage',
  '.snap', '.bin', '.sh', '.doc', '.docx', '.fls',
];

export const MICROSOFT_KEYWORDS = [
  'onedrive',
  'onenote',
  'download.aspx',
];
