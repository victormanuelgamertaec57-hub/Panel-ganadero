import React, { useState } from 'react';
import { Link2, Link2Off, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '../../context';
import { formatRelativeTime } from '../../utils/formatters';

export const Configuracion: React.FC = () => {
  const { sheetsConfig, sync, connectSheets, disconnectSheets, triggerSync } = useApp();
  const [spreadsheetId, setSpreadsheetId] = useState(sheetsConfig.spreadsheetId ?? '');
  const [connecting, setConnecting] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const hasClientId = Boolean(clientId);

  const handleConnect = async () => {
    if (!spreadsheetId.trim()) return;
    setConnecting(true);
    try {
      await connectSheets(spreadsheetId.trim());
    } finally {
      setConnecting(false);
    }
  };

  const extractIdFromUrl = (input: string): string => {
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input;
  };

  const handleIdInput = (val: string) => {
    setSpreadsheetId(extractIdFromUrl(val));
  };

  const section = (title: string, children: React.ReactNode) => (
    <div className="card" style={{ padding: '22px 24px', marginBottom: 16 }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 18 }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ maxWidth: 680 }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>Configuración</h2>

      {/* Google Sheets */}
      {section('Integración Google Sheets', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {!hasClientId && (
            <div style={{ padding: '14px 16px', borderRadius: 10, backgroundColor: 'rgba(232,168,56,0.1)', border: '1px solid rgba(232,168,56,0.3)' }}>
              <p style={{ fontSize: '0.82rem', color: '#C9A96E', lineHeight: 1.6 }}>
                <strong>⚠ VITE_GOOGLE_CLIENT_ID no configurado.</strong> Crea un archivo <code style={{ background: 'rgba(232,168,56,0.15)', padding: '1px 6px', borderRadius: 4 }}>.env</code> con tus credenciales de Google Cloud. Ver README para instrucciones.
              </p>
            </div>
          )}

          {sheetsConfig.connected ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Status card */}
              <div style={{ padding: '16px 18px', borderRadius: 10, backgroundColor: 'rgba(76,175,130,0.08)', border: '1px solid rgba(76,175,130,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle size={20} color="#C9A96E" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                    {sheetsConfig.spreadsheetName ?? 'Google Sheet'}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                    ID: {sheetsConfig.spreadsheetId}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.72rem', color: sync.status === 'error' ? '#E05C5C' : 'var(--color-accent-light)', fontWeight: 600 }}>
                    {sync.status === 'syncing' ? 'Sincronizando…' :
                     sync.status === 'error'   ? 'Error de sync' :
                     sync.lastSync             ? `Sync ${formatRelativeTime(sync.lastSync)}` :
                     'Listo para sync'}
                  </p>
                </div>
              </div>

              {sync.status === 'error' && sync.error && (
                <div style={{ padding: '12px 14px', borderRadius: 8, backgroundColor: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.3)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <AlertCircle size={16} color="#E05C5C" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '0.8rem', color: '#E05C5C', lineHeight: 1.5 }}>{sync.error}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-primary"
                  onClick={triggerSync}
                  disabled={sync.status === 'syncing'}
                  style={{ gap: 7 }}
                >
                  <RefreshCw size={15} style={{ animation: sync.status === 'syncing' ? 'spin 0.8s linear infinite' : undefined }} />
                  Sincronizar ahora
                </button>
                <button className="btn btn-secondary" onClick={disconnectSheets} style={{ gap: 7 }}>
                  <Link2Off size={15} /> Desconectar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">ID del Google Sheet <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={spreadsheetId}
                  onChange={e => handleIdInput(e.target.value)}
                  placeholder="Pega el ID o la URL completa del Google Sheet"
                  disabled={!hasClientId}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                  El ID se encuentra en la URL: docs.google.com/spreadsheets/d/<strong style={{ color: 'var(--color-accent)' }}>ID_AQUÍ</strong>/edit
                </p>
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  onClick={handleConnect}
                  disabled={!spreadsheetId.trim() || !hasClientId || connecting}
                  style={{ gap: 7 }}
                >
                  {connecting ? (
                    <><span className="spinner" style={{ width: 14, height: 14 }} /> Conectando…</>
                  ) : (
                    <><Link2 size={15} /> Conectar con Google</>
                  )}
                </button>
              </div>
            </div>
          )}

          <div style={{ paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Comportamiento de sincronización
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                'Sync automático al guardar o editar cualquier registro',
                'localStorage es siempre la fuente de verdad',
                'Google Sheets funciona como espejo/respaldo',
                'Si falla el sync, se reintenta al reconectar',
                'Las hojas se crean automáticamente si no existen',
              ].map(item => (
                <li key={item} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#C9A96E', marginTop: 2, flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {/* Almacenamiento */}
      {section('Almacenamiento local', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            Todos los datos se almacenan en el navegador mediante <code style={{ background: 'var(--color-surface-2)', padding: '1px 6px', borderRadius: 4 }}>localStorage</code>. No se envían a ningún servidor externo, excepto a Google Sheets si está configurado.
          </p>
          <div style={{ padding: '12px 14px', borderRadius: 8, backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono' }}>
              Claves: panel_ganadero_ventas · lotes_ganado · ganapp_sheets_config
            </p>
          </div>
        </div>
      ))}

      {/* Acerca de */}
      {section('Acerca de GanApp', (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Producto', 'GanApp — Control Ganadero Inteligente'],
            ['Versión', '2.0.0'],
            ['Tecnología', 'React 19 · TypeScript · Recharts · Vite'],
            ['Almacenamiento', 'localStorage (local) + Google Sheets (opcional)'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 16, fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--color-text-muted)', minWidth: 110, flexShrink: 0 }}>{label}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{value}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
