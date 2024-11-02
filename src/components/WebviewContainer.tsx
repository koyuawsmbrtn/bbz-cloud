import React from 'react';
import { useWebview } from '../hooks/useWebview';

interface WebviewContainerProps {
  id: string;
  url: string;
  visible: boolean;
}

export const WebviewContainer: React.FC<WebviewContainerProps> = ({
  id,
  url,
  visible,
}) => {
  const { isLoaded, canGoBack, canGoForward, reload, goBack, goForward } = useWebview(
    `wv-${id}`,
    url
  );

  if (!visible) return null;

  return (
    <div className="webview-container">
      <div className="webview-controls">
        <button
          onClick={reload}
          title="Neu laden"
          className="control-button reload"
        >
          🔄
        </button>
        <button
          onClick={goBack}
          disabled={!canGoBack}
          title="Zurück"
          className="control-button back"
        >
          ⬅️
        </button>
        <button
          onClick={goForward}
          disabled={!canGoForward}
          title="Vorwärts"
          className="control-button forward"
        >
          ➡️
        </button>
      </div>
      <webview
        id={`wv-${id}`}
        className="wv"
        src={url}
        allowpopups="true"
        style={{ display: visible ? 'flex' : 'none' }}
      />
      {!isLoaded && <div className="webview-loader">Lädt...</div>}
    </div>
  );
};
