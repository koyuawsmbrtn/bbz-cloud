import React, { useState, useEffect } from 'react';
import { AppHeader } from '../components/AppHeader';
import { WebviewContainer } from '../components/WebviewContainer';
import { Settings } from '../components/Settings';
import { AppSettings, AppLink } from '../types';
import primaryApps from '../../assets/primary_apps.json';
import './App.css';

const defaultSettings: AppSettings = {
  autostart: false,
  zoomFactor: 0.8,
  enabledApps: Object.keys(primaryApps),
};

export const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Set initial zoom
    window.api.send('zoom', settings.zoomFactor);
  }, []);

  const handleSettingsChange = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  };

  const handleAppClick = (appId: string, url: string) => {
    setCurrentApp(appId);
    setShowSettings(false);
    setShowDropdown(false);
  };

  return (
    <div className="app-container">
      <AppHeader
        onSettingsClick={() => setShowSettings(true)}
        onDropdownClick={() => setShowDropdown(!showDropdown)}
      />

      <div className="main-content">
        <div className="app-grid">
          {Object.entries(primaryApps).map(([id, app]: [string, AppLink]) => (
            <button
              key={id}
              className={`app-button ${currentApp === id ? 'active' : ''}`}
              onClick={() => handleAppClick(id, app.url)}
            >
              <img src={app.icon} alt={id} />
              <span>{id}</span>
            </button>
          ))}
        </div>

        {Object.entries(primaryApps).map(([id, app]: [string, AppLink]) => (
          <WebviewContainer
            key={id}
            id={id}
            url={app.url}
            visible={currentApp === id}
          />
        ))}
      </div>

      <Settings
        visible={showSettings}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default App;
