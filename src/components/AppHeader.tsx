import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';
import db from '../../assets/dropdown.png';
import sb from '../../assets/settings.png';

interface AppHeaderProps {
  onSettingsClick: () => void;
  onDropdownClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onSettingsClick,
  onDropdownClick,
}) => {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadVisible, setDownloadVisible] = useState(false);

  useEffect(() => {
    // Weather API call
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?q=Rendsburg&units=metric&appid=735f03336131c3e5700d4e07662d570c'
        );
        const data = await response.json();
        setTemperature(Math.round(data.main.temp));
      } catch (error) {
        console.error('Weather fetch failed:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes

    // Download progress handler
    const handleDownload = (result: number | string) => {
      if (typeof result === 'number') {
        setDownloadProgress(result);
        setDownloadVisible(true);
      } else if (result === 'completed' || result === 'failed') {
        setDownloadVisible(false);
      }
    };

    window.api.receive('download', handleDownload);

    return () => {
      clearInterval(interval);
      window.api.removeListener('download', handleDownload);
    };
  }, []);

  return (
    <header>
      <div id="container">
        <div id="headnote">
          <p>
            <img src={logo} alt="BBZ Logo" height="28" id="logo" />
            <h1 id="logo_text">BBZ Cloud</h1>
          </p>
          {downloadVisible && (
            <>
              <label htmlFor="download" id="download_label">
                Download:{' '}
              </label>
              <progress id="download" value={downloadProgress} max="100" />
            </>
          )}
          {temperature !== null && (
            <p>
              Aktuell sind es <span id="temperature">{temperature}</span>°C
            </p>
          )}
        </div>

        <img
          id="dropdownb"
          src={db}
          alt="Weitere Apps"
          height="20"
          onClick={onDropdownClick}
          style={{ cursor: 'pointer' }}
        />
        <img
          id="settingsb"
          src={sb}
          alt="Einstellungen"
          height="20"
          onClick={onSettingsClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </header>
  );
};
