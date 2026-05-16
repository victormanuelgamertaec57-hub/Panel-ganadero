import type { TipoAnimal, RazonVenta, DestinoDinero } from '../types';

export const TIPOS_ANIMAL: TipoAnimal[] = ['Novillo', 'Vaca', 'Ternero', 'Toro', 'Vaquilla', 'Otro'];
export const RAZONES_VENTA: RazonVenta[] = ['Liquidez', 'Enfermedad', 'Sobrepeso', 'Remate', 'Planificada', 'Emergencia', 'Otro'];
export const DESTINOS_DINERO: DestinoDinero[] = ['Gastos finca', 'Reinversión ganado', 'Deudas', 'Gastos familia', 'Ahorro', 'Otro'];

export const CODIGOS_ITEM = [
  { codigo: 'NP', descripcion: 'Novillo Pesado' },
  { codigo: 'NC', descripcion: 'Novillo Corriente' },
  { codigo: 'HB', descripcion: 'Hembra Buena' },
  { codigo: 'HR', descripcion: 'Hembra Regular' },
  { codigo: 'HM', descripcion: 'Hembra Mala' },
  { codigo: 'VP', descripcion: 'Vaca Pesada' },
  { codigo: 'TP', descripcion: 'Toro Puro' },
  { codigo: 'TN', descripcion: 'Ternero' },
  { codigo: 'VQ', descripcion: 'Vaquilla' },
];

export const STORAGE_KEYS = {
  VENTAS: 'panel_ganadero_ventas',
  LOTES: 'lotes_ganado',
  THEME: 'panel_theme',
  SHEETS_CONFIG: 'ganapp_sheets_config',
  SYNC_QUEUE: 'ganapp_sync_queue',
} as const;

export const TIPO_ANIMAL_COLORS: Record<string, { bg: string; text: string }> = {
  Novillo:  { bg: '#0d2b1a', text: '#4CAF82' },
  Vaca:     { bg: '#2d1525', text: '#e879a0' },
  Ternero:  { bg: '#0d1e35', text: '#60a5fa' },
  Toro:     { bg: '#2d1a08', text: '#E8A838' },
  Vaquilla: { bg: '#1e1a08', text: '#facc15' },
  Otro:     { bg: '#1a1d2e', text: '#8B92B8' },
};

export const RAZON_COLORS: Record<string, { bg: string; text: string }> = {
  Planificada:  { bg: '#0d2b1a', text: '#4CAF82' },
  Liquidez:     { bg: '#0d1e35', text: '#60a5fa' },
  Sobrepeso:    { bg: '#1e1a08', text: '#facc15' },
  Remate:       { bg: '#1e0d2d', text: '#c084fc' },
  Enfermedad:   { bg: '#2d1525', text: '#e879a0' },
  Emergencia:   { bg: '#2d1508', text: '#E8A838' },
  Otro:         { bg: '#1a1d2e', text: '#8B92B8' },
};

export const DESTINO_COLORS: Record<string, { bg: string; text: string }> = {
  'Gastos finca':       { bg: '#0d1e35', text: '#60a5fa' },
  'Reinversión ganado': { bg: '#0d2b1a', text: '#4CAF82' },
  Deudas:               { bg: '#2d1508', text: '#E8A838' },
  'Gastos familia':     { bg: '#2d1525', text: '#e879a0' },
  Ahorro:               { bg: '#1e1a08', text: '#facc15' },
  Otro:                 { bg: '#1a1d2e', text: '#8B92B8' },
};

export const CHART_COLORS = [
  '#C9A96E', '#5A9469', '#6B8FB8', '#e879a0', '#c084fc',
  '#D4A574', '#4A9B6F', '#DC7A65', '#a78bfa', '#38bdf8',
];

export const GOOGLE_SHEETS_SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

export const SHEET_NAMES = {
  VENTAS: 'Ventas Individuales',
  LOTES: 'Lotes',
  ITEMS_LOTE: 'Items por Lote',
  GASTOS: 'Gastos Operativos',
  PAGOS: 'Pagos y Destino',
} as const;
