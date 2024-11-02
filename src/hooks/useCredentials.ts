import { useState, useEffect } from 'react';
import { Credentials } from '../types';

const defaultCreds: Credentials = {
  outlookUsername: '',
  outlookPassword: '',
  moodleUsername: '',
  moodlePassword: '',
  bbbUsername: '',
  bbbPassword: '',
};

export const useCredentials = () => {
  const [credentials, setCredentials] = useState<Credentials>(defaultCreds);

  useEffect(() => {
    // Load credentials on mount
    window.api.send('getPassword');

    const handleCredentials = (result: Credentials) => {
      setCredentials(result);
    };

    window.api.receive('getPassword', handleCredentials);

    return () => {
      // Cleanup listener
      window.api.removeListener('getPassword', handleCredentials);
    };
  }, []);

  const saveCredentials = async (newCreds: Credentials) => {
    await window.api.send('savePassword', newCreds);
    setCredentials(newCreds);
  };

  return { credentials, saveCredentials };
};
