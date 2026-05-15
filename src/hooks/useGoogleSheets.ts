import { useState, useCallback, useEffect } from 'react';
import type { GoogleSheetsConfig, SyncState } from '../types';
import { STORAGE_KEYS } from '../constants';
import { initGoogleAuth, requestToken, revokeToken, getSpreadsheetInfo, syncAllData } from '../services/googleSheets';

const EMPTY_CONFIG: GoogleSheetsConfig = {
  spreadsheetId: '',
  connected: false,
};

const EMPTY_SYNC: SyncState = {
  status: 'idle',
  pendingItems: 0,
};

export const useGoogleSheets = () => {
  const [config, setConfig] = useState<GoogleSheetsConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SHEETS_CONFIG);
      return raw ? (JSON.parse(raw) as GoogleSheetsConfig) : EMPTY_CONFIG;
    } catch {
      return EMPTY_CONFIG;
    }
  });

  const [sync, setSync] = useState<SyncState>(EMPTY_SYNC);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const persistConfig = (cfg: GoogleSheetsConfig) => {
    const safe = { ...cfg, accessToken: undefined };
    localStorage.setItem(STORAGE_KEYS.SHEETS_CONFIG, JSON.stringify(safe));
    // Store token separately to avoid logging it
    if (cfg.accessToken) {
      sessionStorage.setItem('ganapp_token', cfg.accessToken);
      sessionStorage.setItem('ganapp_token_expiry', String(cfg.tokenExpiry ?? 0));
    }
    setConfig(cfg);
  };

  // Restore token from sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem('ganapp_token');
    const expiry = Number(sessionStorage.getItem('ganapp_token_expiry') ?? 0);
    if (token && expiry > Date.now()) {
      setConfig(prev => ({ ...prev, accessToken: token, tokenExpiry: expiry }));
    }
  }, []);

  // Init GSI when clientId is available
  useEffect(() => {
    if (!clientId || isAuthReady) return;
    const tryInit = () => {
      if (typeof window.google !== 'undefined') {
        initGoogleAuth(
          clientId,
          (token, expiry) => {
            setConfig(prev => {
              const updated = { ...prev, accessToken: token, tokenExpiry: expiry };
              sessionStorage.setItem('ganapp_token', token);
              sessionStorage.setItem('ganapp_token_expiry', String(expiry));
              return updated;
            });
          },
          (err) => {
            setSync(s => ({ ...s, status: 'error', error: err }));
          },
        );
        setIsAuthReady(true);
      } else {
        setTimeout(tryInit, 500);
      }
    };
    tryInit();
  }, [clientId, isAuthReady]);

  const connect = useCallback(async (spreadsheetId: string) => {
    if (!clientId) {
      setSync(s => ({ ...s, status: 'error', error: 'VITE_GOOGLE_CLIENT_ID no configurado. Ver README.' }));
      return;
    }
    setSync(s => ({ ...s, status: 'syncing', error: undefined }));
    // requestToken triggers OAuth popup; on success the callback updates config.accessToken
    requestToken('consent');
    // After token arrives, finalize connection
    const waitForToken = () =>
      new Promise<string>((resolve, reject) => {
        let attempts = 0;
        const check = setInterval(() => {
          const token = sessionStorage.getItem('ganapp_token');
          const expiry = Number(sessionStorage.getItem('ganapp_token_expiry') ?? 0);
          if (token && expiry > Date.now()) {
            clearInterval(check);
            resolve(token);
          }
          if (++attempts > 60) { clearInterval(check); reject(new Error('Timeout de autenticación')); }
        }, 500);
      });

    try {
      const token = await waitForToken();
      const name = await getSpreadsheetInfo(spreadsheetId, token);
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId,
        spreadsheetName: name,
        connected: true,
        accessToken: token,
        tokenExpiry: Number(sessionStorage.getItem('ganapp_token_expiry') ?? 0),
      };
      persistConfig(newConfig);
      setSync({ status: 'idle', pendingItems: 0, lastSync: undefined });
    } catch (err) {
      setSync(s => ({ ...s, status: 'error', error: String(err) }));
    }
  }, [clientId]);

  const disconnect = useCallback(() => {
    if (config.accessToken) revokeToken(config.accessToken);
    sessionStorage.removeItem('ganapp_token');
    sessionStorage.removeItem('ganapp_token_expiry');
    persistConfig(EMPTY_CONFIG);
    setSync(EMPTY_SYNC);
  }, [config.accessToken]);

  const triggerSync = useCallback(async (
    ventas: import('../types').VentaAnimal[],
    lotes: import('../types').Lote[],
  ) => {
    if (!config.connected) return;

    // Refresh token if expired
    let token = config.accessToken ?? sessionStorage.getItem('ganapp_token') ?? '';
    const expiry = config.tokenExpiry ?? Number(sessionStorage.getItem('ganapp_token_expiry') ?? 0);
    if (!token || expiry < Date.now()) {
      requestToken('');
      setSync(s => ({ ...s, status: 'pending', pendingItems: ventas.length + lotes.length }));
      return;
    }

    setSync(s => ({ ...s, status: 'syncing', error: undefined }));
    try {
      await syncAllData({ ...config, accessToken: token }, ventas, lotes);
      const now = new Date().toISOString();
      setSync({ status: 'idle', lastSync: now, pendingItems: 0 });
      setConfig(prev => ({ ...prev, lastSync: now }));
    } catch (err) {
      setSync(s => ({ ...s, status: 'error', error: String(err), pendingItems: ventas.length + lotes.length }));
    }
  }, [config]);

  return { config, sync, connect, disconnect, triggerSync };
};
