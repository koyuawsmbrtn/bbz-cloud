import React from 'react';
import { useCredentials } from '../hooks/useCredentials';
import { AppSettings } from '../types';
import version from '../../package.json';

interface SettingsProps {
  visible: boolean;
  settings: AppSettings;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  visible,
  settings,
  onSettingsChange,
  onClose,
}) => {
  const { credentials, saveCredentials } = useCredentials();

  if (!visible) return null;

  const handleSave = async () => {
    const emailInput = document.getElementById('emailAdress') as HTMLInputElement;
    const outlookPwInput = document.getElementById('outlookPW') as HTMLInputElement;
    const bbbPwInput = document.getElementById('bbbPW') as HTMLInputElement;
    const autostartInput = document.getElementById('autostart') as HTMLInputElement;

    const newCreds = {
      outlookUsername: emailInput.value,
      outlookPassword: outlookPwInput.value,
      moodleUsername: emailInput.value.toLowerCase(),
      moodlePassword: outlookPwInput.value,
      bbbUsername: emailInput.value,
      bbbPassword: bbbPwInput.value,
    };

    await saveCredentials(newCreds);

    onSettingsChange({
      autostart: autostartInput.checked,
    });

    window.api.send('autostart', autostartInput.checked);
    onClose();
  };

  return (
    <div id="settings">
      <div id="settingsv">
        <h1>Einstellungen</h1>

        <h2>Autostart</h2>
        <div className="clickable-modifier">
          <input
            type="checkbox"
            id="autostart"
            checked={settings.autostart}
            onChange={(e) => onSettingsChange({ autostart: e.target.checked })}
          />
          <label htmlFor="autostart">
            App beim Login am Computer automatisch starten
          </label>
        </div>

        <h2>Anmeldedaten</h2>
        <div>
          <h3>E-Mail-Adresse (für Outlook, Moodle und BigBlueButton)</h3>
          <input
            type="text"
            id="emailAdress"
            defaultValue={credentials.outlookUsername}
            placeholder="vorname.nachname@bbz-rd-eck.de"
          />

          <h3>Passwörter</h3>
          <div>
            <input
              type="password"
              id="outlookPW"
              defaultValue={credentials.outlookPassword}
              placeholder="Outlook & Moodle Passwort"
            />
            <input
              type="password"
              id="bbbPW"
              defaultValue={credentials.bbbPassword}
              placeholder="BigBlueButton Passwort"
            />
          </div>
        </div>

        <button onClick={handleSave}>Speichern</button>
      </div>

      <p style={{ color: 'white' }}>
        <b>BBZ Cloud App Version:</b> {version.version}
        <br />
        <b>Entwickelt von:</b>{' '}
        <a
          href="https://web.koyu.space"
          target="_blank"
          rel="noreferrer"
          style={{ color: 'white' }}
        >
          Leonie
        </a>
      </p>
    </div>
  );
};
