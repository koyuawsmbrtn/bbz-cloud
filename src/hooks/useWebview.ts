import { useState, useEffect } from 'react';
import { WebviewState } from '../types';

export const useWebview = (id: string, initialUrl: string) => {
  const [state, setState] = useState<WebviewState>({
    isLoaded: false,
    url: initialUrl,
    canGoBack: false,
    canGoForward: false,
  });

  useEffect(() => {
    const webview = document.getElementById(id) as Electron.WebviewTag;
    if (!webview) return;

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoaded: false }));
    };

    const handleLoadFinish = () => {
      setState(prev => ({
        ...prev,
        isLoaded: true,
        url: webview.getURL(),
        canGoBack: webview.canGoBack(),
        canGoForward: webview.canGoForward(),
      }));
    };

    webview.addEventListener('did-start-loading', handleLoadStart);
    webview.addEventListener('did-finish-load', handleLoadFinish);

    return () => {
      webview.removeEventListener('did-start-loading', handleLoadStart);
      webview.removeEventListener('did-finish-load', handleLoadFinish);
    };
  }, [id]);

  const reload = () => {
    const webview = document.getElementById(id) as Electron.WebviewTag;
    if (webview) webview.reload();
  };

  const goBack = () => {
    const webview = document.getElementById(id) as Electron.WebviewTag;
    if (webview && state.canGoBack) webview.goBack();
  };

  const goForward = () => {
    const webview = document.getElementById(id) as Electron.WebviewTag;
    if (webview && state.canGoForward) webview.goForward();
  };

  return { ...state, reload, goBack, goForward };
};
