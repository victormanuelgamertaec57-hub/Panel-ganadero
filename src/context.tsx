import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { VentaAnimal, Lote, DateRange, DateRangePreset, Toast, SyncState } from './types';
import { initializeData, initializeLotes, saveVentas, saveLotes } from './data';
import { todayISO, startOfWeek, startOfMonth, startOfYear, subDays, generateId } from './utils/formatters';
import { filterByDateRange, filterLotesByDateRange } from './utils/calculations';
import { useGoogleSheets } from './hooks/useGoogleSheets';

interface AppContextValue {
  // Ventas
  ventas: VentaAnimal[];
  addVenta: (v: Omit<VentaAnimal, 'id'>) => void;
  updateVenta: (v: VentaAnimal) => void;
  deleteVenta: (id: string) => void;
  filteredVentas: VentaAnimal[];

  // Lotes
  lotes: Lote[];
  addLote: (l: Omit<Lote, 'id'>) => void;
  updateLote: (l: Lote) => void;
  deleteLote: (id: string) => void;
  filteredLotes: Lote[];

  // Date range
  dateRange: DateRange;
  setDateRangePreset: (preset: DateRangePreset) => void;
  setCustomDateRange: (from: string, to: string) => void;

  // Google Sheets
  sheetsConfig: ReturnType<typeof useGoogleSheets>['config'];
  sync: SyncState;
  connectSheets: (spreadsheetId: string) => Promise<void>;
  disconnectSheets: () => void;
  triggerSync: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const buildDateRange = (preset: DateRangePreset, customFrom?: string, customTo?: string): DateRange => {
  const today = todayISO();
  switch (preset) {
    case 'today':  return { preset, from: today, to: today };
    case 'week':   return { preset, from: startOfWeek(), to: today };
    case 'month':  return { preset, from: startOfMonth(), to: today };
    case 'year':   return { preset, from: startOfYear(), to: today };
    case 'custom': return { preset, from: customFrom ?? subDays(today, 30), to: customTo ?? today };
    default:       return { preset: 'month', from: startOfMonth(), to: today };
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ventas, setVentas] = useState<VentaAnimal[]>([]);
  const [lotes, setLotes]   = useState<Lote[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>(buildDateRange('month'));
  const [toasts, setToasts] = useState<Toast[]>([]);

  const sheets = useGoogleSheets();

  useEffect(() => {
    setVentas(initializeData());
    setLotes(initializeLotes());
  }, []);

  // ─── Toast helpers ────────────────────────────────────────────────────────────

  const addToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Ventas CRUD ─────────────────────────────────────────────────────────────

  const addVenta = useCallback((v: Omit<VentaAnimal, 'id'>) => {
    const newVenta: VentaAnimal = { ...v, id: generateId() };
    setVentas(prev => {
      const updated = [newVenta, ...prev];
      saveVentas(updated);
      return updated;
    });
    addToast('success', 'Venta registrada correctamente');
    sheets.triggerSync([...ventas, newVenta], lotes);
  }, [ventas, lotes, sheets, addToast]);

  const updateVenta = useCallback((v: VentaAnimal) => {
    setVentas(prev => {
      const updated = prev.map(x => x.id === v.id ? v : x);
      saveVentas(updated);
      sheets.triggerSync(updated, lotes);
      return updated;
    });
    addToast('success', 'Venta actualizada');
  }, [lotes, sheets, addToast]);

  const deleteVenta = useCallback((id: string) => {
    setVentas(prev => {
      const updated = prev.filter(x => x.id !== id);
      saveVentas(updated);
      sheets.triggerSync(updated, lotes);
      return updated;
    });
    addToast('info', 'Venta eliminada');
  }, [lotes, sheets, addToast]);

  // ─── Lotes CRUD ──────────────────────────────────────────────────────────────

  const addLote = useCallback((l: Omit<Lote, 'id'>) => {
    const newLote: Lote = { ...l, id: generateId() };
    setLotes(prev => {
      const updated = [newLote, ...prev];
      saveLotes(updated);
      sheets.triggerSync(ventas, updated);
      return updated;
    });
    addToast('success', 'Lote guardado correctamente');
  }, [ventas, sheets, addToast]);

  const updateLote = useCallback((l: Lote) => {
    setLotes(prev => {
      const updated = prev.map(x => x.id === l.id ? l : x);
      saveLotes(updated);
      sheets.triggerSync(ventas, updated);
      return updated;
    });
    addToast('success', 'Lote actualizado');
  }, [ventas, sheets, addToast]);

  const deleteLote = useCallback((id: string) => {
    setLotes(prev => {
      const updated = prev.filter(x => x.id !== id);
      saveLotes(updated);
      sheets.triggerSync(ventas, updated);
      return updated;
    });
    addToast('info', 'Lote eliminado');
  }, [ventas, sheets, addToast]);

  // ─── Date range ───────────────────────────────────────────────────────────────

  const setDateRangePreset = useCallback((preset: DateRangePreset) => {
    setDateRange(buildDateRange(preset));
  }, []);

  const setCustomDateRange = useCallback((from: string, to: string) => {
    setDateRange({ preset: 'custom', from, to });
  }, []);

  // ─── Sheets wrapper ───────────────────────────────────────────────────────────

  const connectSheets = useCallback(async (spreadsheetId: string) => {
    await sheets.connect(spreadsheetId);
    addToast('success', 'Conectado a Google Sheets');
  }, [sheets, addToast]);

  const disconnectSheets = useCallback(() => {
    sheets.disconnect();
    addToast('info', 'Desconectado de Google Sheets');
  }, [sheets, addToast]);

  const triggerSync = useCallback(() => {
    sheets.triggerSync(ventas, lotes);
  }, [sheets, ventas, lotes]);

  const filteredVentas = filterByDateRange(ventas, dateRange.from, dateRange.to);
  const filteredLotes  = filterLotesByDateRange(lotes, dateRange.from, dateRange.to);

  return (
    <AppContext.Provider value={{
      ventas, addVenta, updateVenta, deleteVenta, filteredVentas,
      lotes, addLote, updateLote, deleteLote, filteredLotes,
      dateRange, setDateRangePreset, setCustomDateRange,
      sheetsConfig: sheets.config,
      sync: sheets.sync,
      connectSheets, disconnectSheets, triggerSync,
      toasts, addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
