import React from 'react';
import { PlusCircle, RefreshCw, Wifi, WifiOff, Clock, LayoutDashboard, Package, ClipboardList, BarChart2, Settings } from 'lucide-react';
import type { TabId } from '../../types';
import { useApp } from '../../context';
import { formatRelativeTime, todayISO } from '../../utils/formatters';
import type { DateRangePreset } from '../../types';

const BullIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="18" fill="#4CAF82"/>
    <path d="M25 40 C20 30 18 22 28 20 C32 19 35 24 35 28 C35 24 38 19 42 20 L50 20 C54 19 57 24 57 28 C57 24 60 19 64 20 C74 22 72 30 67 40 L65 45 C68 48 70 52 70 57 C70 70 61 78 50 78 C39 78 30 70 30 57 C30 52 32 48 35 45 Z" fill="white" opacity="0.95"/>
    <circle cx="41" cy="52" r="4" fill="#4CAF82"/>
    <circle cx="59" cy="52" r="4" fill="#4CAF82"/>
    <ellipse cx="50" cy="63" rx="5" ry="4" fill="#4CAF82" opacity="0.6"/>
  </svg>
);

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard',     label: 'Dashboard',     icon: <LayoutDashboard size={18} /> },
  { id: 'lotes',         label: 'Lotes',          icon: <Package size={18} /> },
  { id: 'registros',     label: 'Registros',      icon: <ClipboardList size={18} /> },
  { id: 'reportes',      label: 'Reportes',       icon: <BarChart2 size={18} /> },
  { id: 'configuracion', label: 'Config',         icon: <Settings size={18} /> },
];

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Año', value: 'year' },
  { label: 'Personalizado', value: 'custom' },
];

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onNewVenta: () => void;
  onNewLote: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onNewVenta, onNewLote }) => {
  const { dateRange, setDateRangePreset, setCustomDateRange, sync, triggerSync } = useApp();

  const handlePreset = (preset: DateRangePreset) => {
    if (preset !== 'custom') setDateRangePreset(preset);
    else setCustomDateRange(dateRange.from, dateRange.to);
  };

  const syncOk = sync.status === 'idle' && !!sync.lastSync;
  const syncErr = sync.status === 'error';
  const syncing = sync.status === 'syncing';
  const pending = sync.status === 'pending';

  return (
    <>
      <header style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div className="header-inner" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <BullIcon />
              <div>
                <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, color: 'var(--color-text-primary)' }}>
                  GanApp
                </h1>
                <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', lineHeight: 1, letterSpacing: '0.02em' }}>
                  Control ganadero inteligente
                </p>
              </div>
            </div>

            {/* Nav tabs — hidden on mobile via CSS class */}
            <nav className="header-nav-desktop" style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center', padding: '0 24px', overflowX: 'auto' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {/* Sync status badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8,
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                fontSize: '0.72rem', color: 'var(--color-text-muted)',
                cursor: syncOk ? 'pointer' : 'default',
              }}
                onClick={() => syncOk && triggerSync()}
                title={sync.error ?? (syncOk ? 'Sincronizado' : 'Sin conexión a Sheets')}
              >
                <span className={`sync-dot ${syncErr ? 'sync-dot-red' : (syncing || pending) ? 'sync-dot-amber' : syncOk ? 'sync-dot-green' : ''}`}
                  style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: syncErr ? '#E05C5C' : (syncing || pending) ? '#E8A838' : syncOk ? '#4CAF82' : '#555A7A' }} />
                {syncing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw size={10} style={{ animation: 'spin 0.8s linear infinite' }} /> Sync…
                  </span>
                ) : syncOk ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Wifi size={10} /> {formatRelativeTime(sync.lastSync!)}
                  </span>
                ) : syncErr ? (
                  <span style={{ color: 'var(--color-danger-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <WifiOff size={10} /> Error
                  </span>
                ) : pending ? (
                  <span style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} /> Pendiente
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <WifiOff size={10} /> Sin Sheets
                  </span>
                )}
              </div>

              <button className="btn btn-secondary" onClick={onNewVenta} style={{ gap: 6, padding: '8px 14px', fontSize: '0.82rem' }}>
                <PlusCircle size={14} />
                <span className="header-action-btn-text">Nueva Venta</span>
              </button>

              <button className="btn btn-amber" onClick={onNewLote} style={{ gap: 6, padding: '8px 14px', fontSize: '0.82rem' }}>
                <PlusCircle size={14} />
                <span className="header-action-btn-text">Nuevo Lote</span>
              </button>
            </div>
          </div>

          {/* Date range row — only show on dashboard/registros/reportes */}
          {(activeTab === 'dashboard' || activeTab === 'registros' || activeTab === 'reportes') && (
            <div className="date-range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {PRESETS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => handlePreset(p.value)}
                    style={{
                      padding: '4px 11px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500,
                      border: '1px solid', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s ease',
                      borderColor: dateRange.preset === p.value ? 'var(--color-accent)' : 'var(--color-border)',
                      backgroundColor: dateRange.preset === p.value
                        ? 'rgba(76,175,130,0.15)' : 'transparent',
                      color: dateRange.preset === p.value
                        ? 'var(--color-accent-light)' : 'var(--color-text-muted)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {dateRange.preset === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
                  <input type="date" className="form-input" value={dateRange.from} max={dateRange.to}
                    onChange={e => setCustomDateRange(e.target.value, dateRange.to)}
                    style={{ width: 145, padding: '4px 9px', fontSize: '0.78rem' }} />
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>→</span>
                  <input type="date" className="form-input" value={dateRange.to} min={dateRange.from} max={todayISO()}
                    onChange={e => setCustomDateRange(dateRange.from, e.target.value)}
                    style={{ width: 145, padding: '4px 9px', fontSize: '0.78rem' }} />
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Bottom tab bar — mobile only, shown via CSS */}
      <nav className="bottom-tab-bar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
};
