// ─── Ventas individuales ────────────────────────────────────────────────────

export interface VentaAnimal {
  id: string;
  fecha: string;
  nombre_o_identificador: string;
  tipo_animal: TipoAnimal;
  peso_kg: number;
  modalidad_venta: 'por_kilo' | 'por_cabeza';
  precio_por_kg?: number;
  precio_por_cabeza?: number;
  valor_total: number;
  razon_venta: RazonVenta;
  razon_detalle?: string;
  destino_dinero: DestinoDinero;
  destino_detalle?: string;
  notas?: string;
}

// ─── Lotes ──────────────────────────────────────────────────────────────────

export interface Lote {
  id: string;
  fecha: string;
  nombre_lote: string;
  descripcion?: string;
  items: ItemLote[];
  gastos_operativos: GastoOperativo[];
  pagos_destino: PagoDestino[];
  total_bruto: number;
  total_gastos: number;
  total_neto: number;
  razon_venta: RazonVenta;
  notas?: string;
}

export interface ItemLote {
  id: string;
  codigo: string;
  descripcion: string;
  tipo_animal: TipoAnimal;
  cantidad: number;
  modalidad: 'por_kilo' | 'por_cabeza';
  peso_total_kg?: number;
  precio_por_kg?: number;
  precio_por_cabeza?: number;
  valor_total: number;
}

export interface GastoOperativo {
  id: string;
  descripcion: string;
  monto: number;
}

export interface PagoDestino {
  id: string;
  beneficiario: string;
  concepto: string;
  monto: number;
}

// ─── Enums / Union types ─────────────────────────────────────────────────────

export type TipoAnimal = 'Novillo' | 'Vaca' | 'Ternero' | 'Toro' | 'Vaquilla' | 'Otro';
export type RazonVenta = 'Liquidez' | 'Enfermedad' | 'Sobrepeso' | 'Remate' | 'Planificada' | 'Emergencia' | 'Otro';
export type DestinoDinero = 'Gastos finca' | 'Reinversión ganado' | 'Deudas' | 'Gastos familia' | 'Ahorro' | 'Otro';

// ─── Filtros / ordenamiento ──────────────────────────────────────────────────

export type DateRangePreset = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  from: string;
  to: string;
}

export type SortField = keyof VentaAnimal;
export type SortDirection = 'asc' | 'desc';

export interface TableFilters {
  search: string;
  tipo_animal: string;
  razon_venta: string;
  destino_dinero: string;
}

// ─── Google Sheets ───────────────────────────────────────────────────────────

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  spreadsheetName?: string;
  connected: boolean;
  lastSync?: string;
  accessToken?: string;
  tokenExpiry?: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'pending';

export interface SyncState {
  status: SyncStatus;
  lastSync?: string;
  error?: string;
  pendingItems: number;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// ─── Navegación ──────────────────────────────────────────────────────────────

export type TabId = 'dashboard' | 'lotes' | 'registros' | 'reportes' | 'configuracion';
