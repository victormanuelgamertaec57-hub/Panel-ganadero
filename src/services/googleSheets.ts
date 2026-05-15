import type { VentaAnimal, Lote, GoogleSheetsConfig } from '../types';
import { SHEET_NAMES } from '../constants';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// ─── Auth helpers ─────────────────────────────────────────────────────────────

export interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

let tokenClient: TokenClient | null = null;

export const initGoogleAuth = (
  clientId: string,
  onSuccess: (token: string, expiry: number) => void,
  onError: (err: string) => void,
): void => {
  if (typeof window.google === 'undefined') {
    onError('Google Identity Services no disponible. Verifica tu conexión.');
    return;
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (response: { access_token?: string; expires_in?: number; error?: string }) => {
      if (response.error || !response.access_token) {
        onError(response.error ?? 'Error desconocido al autenticar');
        return;
      }
      const expiry = Date.now() + ((response.expires_in ?? 3600) * 1000);
      onSuccess(response.access_token, expiry);
    },
  });
};

export const requestToken = (prompt = ''): void => {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt });
};

export const revokeToken = (token: string): void => {
  if (typeof window.google !== 'undefined') {
    window.google.accounts.oauth2.revoke(token, () => {});
  }
};

// ─── API helpers ──────────────────────────────────────────────────────────────

const apiFetch = async (url: string, token: string, options: RequestInit = {}): Promise<Response> => {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
  return res;
};

// ─── Sheet management ─────────────────────────────────────────────────────────

export const getSpreadsheetInfo = async (spreadsheetId: string, token: string): Promise<string> => {
  const res = await apiFetch(`${SHEETS_API}/${spreadsheetId}?fields=properties.title`, token);
  const data = await res.json();
  return data.properties?.title ?? 'Sin nombre';
};

export const ensureSheetsExist = async (spreadsheetId: string, token: string): Promise<void> => {
  const res = await apiFetch(`${SHEETS_API}/${spreadsheetId}?fields=sheets.properties.title`, token);
  const data = await res.json();
  const existing: string[] = (data.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title);

  const needed = Object.values(SHEET_NAMES).filter(name => !existing.includes(name));
  if (needed.length === 0) return;

  const requests = needed.map(title => ({
    addSheet: { properties: { title } },
  }));

  await apiFetch(`${SHEETS_API}/${spreadsheetId}:batchUpdate`, token, {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });

  // Add headers to new sheets
  await initSheetHeaders(spreadsheetId, token, needed);
};

const HEADERS: Record<string, string[]> = {
  [SHEET_NAMES.VENTAS]: ['ID', 'Fecha', 'Animal', 'Tipo', 'Peso (kg)', 'Modalidad', 'Precio Unit.', 'Valor Total', 'Razón', 'Destino', 'Notas'],
  [SHEET_NAMES.LOTES]: ['ID Lote', 'Fecha', 'Nombre Lote', 'Descripción', 'Razón', 'Total Bruto', 'Total Gastos', 'Total Neto', 'Notas'],
  [SHEET_NAMES.ITEMS_LOTE]: ['ID Item', 'ID Lote', 'Fecha Lote', 'Código', 'Descripción', 'Tipo', 'Cantidad', 'Modalidad', 'Peso Total', 'Precio/kg', 'Precio/Cabeza', 'Valor Total'],
  [SHEET_NAMES.GASTOS]: ['ID', 'ID Lote', 'Descripción', 'Monto'],
  [SHEET_NAMES.PAGOS]: ['ID', 'ID Lote', 'Beneficiario', 'Concepto', 'Monto'],
};

const initSheetHeaders = async (spreadsheetId: string, token: string, sheetNames: string[]): Promise<void> => {
  const data = sheetNames
    .filter(name => HEADERS[name])
    .map(name => ({
      range: `${name}!A1`,
      values: [HEADERS[name]],
    }));
  if (data.length === 0) return;
  await apiFetch(`${SHEETS_API}/${spreadsheetId}/values:batchUpdate`, token, {
    method: 'POST',
    body: JSON.stringify({ valueInputOption: 'RAW', data }),
  });
};

// ─── Full sync ────────────────────────────────────────────────────────────────

export const syncAllData = async (
  config: GoogleSheetsConfig,
  ventas: VentaAnimal[],
  lotes: Lote[],
): Promise<void> => {
  if (!config.connected || !config.accessToken || !config.spreadsheetId) {
    throw new Error('No conectado a Google Sheets');
  }
  const { spreadsheetId, accessToken } = config;

  await ensureSheetsExist(spreadsheetId, accessToken);

  const ventasRows: string[][] = ventas.map(v => [
    v.id, v.fecha, v.nombre_o_identificador, v.tipo_animal,
    String(v.peso_kg), v.modalidad_venta,
    String(v.precio_por_kg ?? ''), String(v.valor_total),
    v.razon_venta, v.destino_dinero, v.notas ?? '',
  ]);

  const lotesRows: string[][] = lotes.map(l => [
    l.id, l.fecha, l.nombre_lote, l.descripcion ?? '',
    l.razon_venta, String(l.total_bruto), String(l.total_gastos),
    String(l.total_neto), l.notas ?? '',
  ]);

  const itemsRows: string[][] = lotes.flatMap(l =>
    l.items.map(i => [
      i.id, l.id, l.fecha, i.codigo, i.descripcion, i.tipo_animal,
      String(i.cantidad), i.modalidad,
      String(i.peso_total_kg ?? ''), String(i.precio_por_kg ?? ''),
      String(i.precio_por_cabeza ?? ''), String(i.valor_total),
    ])
  );

  const gastosRows: string[][] = lotes.flatMap(l =>
    l.gastos_operativos.map(g => [g.id, l.id, g.descripcion, String(g.monto)])
  );

  const pagosRows: string[][] = lotes.flatMap(l =>
    l.pagos_destino.map(p => [p.id, l.id, p.beneficiario, p.concepto, String(p.monto)])
  );

  const buildRange = (sheet: string, rows: string[][]): object[] => {
    if (rows.length === 0) return [];
    return [{
      range: `${sheet}!A2`,
      values: rows,
    }];
  };

  // Clear all data rows first, then write
  const clearRanges = Object.values(SHEET_NAMES).map(name => `${name}!A2:Z10000`);
  await apiFetch(`${SHEETS_API}/${spreadsheetId}/values:batchClear`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ ranges: clearRanges }),
  });

  const allData = [
    ...buildRange(SHEET_NAMES.VENTAS, ventasRows),
    ...buildRange(SHEET_NAMES.LOTES, lotesRows),
    ...buildRange(SHEET_NAMES.ITEMS_LOTE, itemsRows),
    ...buildRange(SHEET_NAMES.GASTOS, gastosRows),
    ...buildRange(SHEET_NAMES.PAGOS, pagosRows),
  ];

  if (allData.length === 0) return;

  await apiFetch(`${SHEETS_API}/${spreadsheetId}/values:batchUpdate`, accessToken, {
    method: 'POST',
    body: JSON.stringify({ valueInputOption: 'RAW', data: allData }),
  });
};

// ─── Type augmentation for Google GSI ────────────────────────────────────────

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: object) => TokenClient;
          revoke: (token: string, cb: () => void) => void;
        };
      };
    };
  }
}
