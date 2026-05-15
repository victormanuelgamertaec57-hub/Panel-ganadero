import type { VentaAnimal, Lote, ItemLote, GastoOperativo, PagoDestino } from './types';
import { generateId } from './utils/formatters';

const makeDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

// ─── Sample ventas ────────────────────────────────────────────────────────────

export const SAMPLE_DATA: VentaAnimal[] = [
  {
    id: generateId(),
    fecha: makeDate(3),
    nombre_o_identificador: 'Novillo Pintado',
    tipo_animal: 'Novillo',
    peso_kg: 420,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 8200,
    valor_total: 3444000,
    razon_venta: 'Planificada',
    destino_dinero: 'Reinversión ganado',
    notas: 'Buen estado de gordura, listo para mercado.',
  },
  {
    id: generateId(),
    fecha: makeDate(10),
    nombre_o_identificador: 'La Negra',
    tipo_animal: 'Vaca',
    peso_kg: 380,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 6800,
    valor_total: 2584000,
    razon_venta: 'Enfermedad',
    razon_detalle: 'Problemas reproductivos crónicos',
    destino_dinero: 'Gastos finca',
  },
  {
    id: generateId(),
    fecha: makeDate(18),
    nombre_o_identificador: 'Toro Bravo #1',
    tipo_animal: 'Toro',
    peso_kg: 550,
    modalidad_venta: 'por_cabeza',
    precio_por_cabeza: 5800000,
    valor_total: 5800000,
    razon_venta: 'Remate',
    destino_dinero: 'Ahorro',
    notas: 'Vendido en remate ganadero de Montería.',
  },
  {
    id: generateId(),
    fecha: makeDate(25),
    nombre_o_identificador: 'Ternero Lucero',
    tipo_animal: 'Ternero',
    peso_kg: 180,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 7500,
    valor_total: 1350000,
    razon_venta: 'Liquidez',
    destino_dinero: 'Gastos familia',
  },
  {
    id: generateId(),
    fecha: makeDate(32),
    nombre_o_identificador: 'Vaquilla Canela',
    tipo_animal: 'Vaquilla',
    peso_kg: 310,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 7800,
    valor_total: 2418000,
    razon_venta: 'Planificada',
    destino_dinero: 'Deudas',
    razon_detalle: 'Reducción de inventario para temporada seca',
  },
  {
    id: generateId(),
    fecha: makeDate(40),
    nombre_o_identificador: 'Novillo #42',
    tipo_animal: 'Novillo',
    peso_kg: 460,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 8500,
    valor_total: 3910000,
    razon_venta: 'Sobrepeso',
    razon_detalle: 'Alcanzó peso máximo de pastoreo',
    destino_dinero: 'Gastos finca',
  },
  {
    id: generateId(),
    fecha: makeDate(55),
    nombre_o_identificador: 'La Mora',
    tipo_animal: 'Vaca',
    peso_kg: 400,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 6500,
    valor_total: 2600000,
    razon_venta: 'Planificada',
    destino_dinero: 'Reinversión ganado',
    notas: 'Parte del descarte anual de vacas improductivas.',
  },
  {
    id: generateId(),
    fecha: makeDate(68),
    nombre_o_identificador: 'Novillo Café',
    tipo_animal: 'Novillo',
    peso_kg: 435,
    modalidad_venta: 'por_kilo',
    precio_por_kg: 7900,
    valor_total: 3436500,
    razon_venta: 'Remate',
    destino_dinero: 'Gastos finca',
  },
];

// ─── Sample lotes ─────────────────────────────────────────────────────────────

const makeItems = (...rows: Omit<ItemLote, 'id'>[]): ItemLote[] =>
  rows.map(r => ({ ...r, id: generateId() }));

const makeGastos = (...rows: Omit<GastoOperativo, 'id'>[]): GastoOperativo[] =>
  rows.map(r => ({ ...r, id: generateId() }));

const makePagos = (...rows: Omit<PagoDestino, 'id'>[]): PagoDestino[] =>
  rows.map(r => ({ ...r, id: generateId() }));

export const SAMPLE_LOTES: Lote[] = [
  // Lote 1 — Remate Montería (hace 15 días)
  (() => {
    const items = makeItems(
      {
        codigo: 'NP',
        descripcion: 'Novillo Pesado',
        tipo_animal: 'Novillo',
        cantidad: 12,
        modalidad: 'por_kilo',
        peso_total_kg: 5280,
        precio_por_kg: 8600,
        valor_total: 45408000,
      },
      {
        codigo: 'NC',
        descripcion: 'Novillo Corriente',
        tipo_animal: 'Novillo',
        cantidad: 8,
        modalidad: 'por_kilo',
        peso_total_kg: 3040,
        precio_por_kg: 7800,
        valor_total: 23712000,
      },
      {
        codigo: 'HB',
        descripcion: 'Hembra Buena',
        tipo_animal: 'Vaca',
        cantidad: 5,
        modalidad: 'por_kilo',
        peso_total_kg: 1850,
        precio_por_kg: 7200,
        valor_total: 13320000,
      },
    );
    const gastos = makeGastos(
      { descripcion: 'Flete camión Montería', monto: 1800000 },
      { descripcion: 'Comisión subastador 2%', monto: 1648800 },
      { descripcion: 'Guía sanitaria ICA', monto: 320000 },
      { descripcion: 'Pesaje y corral', monto: 450000 },
    );
    const pagos = makePagos(
      { beneficiario: 'Hacienda El Paraíso', concepto: 'Pago socio 60%', monto: 47437920 },
      { beneficiario: 'Reinversión terneros', concepto: 'Compra pie de cría', monto: 20000000 },
      { beneficiario: 'Gastos finca', concepto: 'Mantenimiento cercas', monto: 5000000 },
    );
    const total_bruto = items.reduce((s, i) => s + i.valor_total, 0); // 82440000
    const total_gastos = gastos.reduce((s, g) => s + g.monto, 0);     // 4218800
    const total_neto = total_bruto - total_gastos;
    return {
      id: generateId(),
      fecha: makeDate(15),
      nombre_lote: 'Remate Montería — Enero',
      descripcion: 'Lote de novillos gordos y hembras de descarte. Remate oficial en la Subasta Ganadera de Montería.',
      items,
      gastos_operativos: gastos,
      pagos_destino: pagos,
      total_bruto,
      total_gastos,
      total_neto,
      razon_venta: 'Remate',
      notas: 'El mejor lote del trimestre. Precio promedio por encima del mercado.',
    } satisfies Lote;
  })(),

  // Lote 2 — Venta directa a frigorífico (hace 45 días)
  (() => {
    const items = makeItems(
      {
        codigo: 'NP',
        descripcion: 'Novillo Gordo Premium',
        tipo_animal: 'Novillo',
        cantidad: 20,
        modalidad: 'por_kilo',
        peso_total_kg: 9800,
        precio_por_kg: 9000,
        valor_total: 88200000,
      },
      {
        codigo: 'TP',
        descripcion: 'Toro Cebú',
        tipo_animal: 'Toro',
        cantidad: 2,
        modalidad: 'por_cabeza',
        precio_por_cabeza: 6500000,
        valor_total: 13000000,
      },
    );
    const gastos = makeGastos(
      { descripcion: 'Transporte a Bogotá', monto: 3200000 },
      { descripcion: 'Guía ICA y vacunas', monto: 580000 },
      { descripcion: 'Comisión comercializador', monto: 2030000 },
    );
    const pagos = makePagos(
      { beneficiario: 'Banco Agrario — préstamo', concepto: 'Abono crédito agropecuario', monto: 40000000 },
      { beneficiario: 'Hacienda El Paraíso', concepto: 'Capital operativo', monto: 35000000 },
      { beneficiario: 'Compra insumos', concepto: 'Sal mineralizada y medicamentos', monto: 10000000 },
    );
    const total_bruto = items.reduce((s, i) => s + i.valor_total, 0); // 101200000
    const total_gastos = gastos.reduce((s, g) => s + g.monto, 0);     // 5810000
    const total_neto = total_bruto - total_gastos;
    return {
      id: generateId(),
      fecha: makeDate(45),
      nombre_lote: 'Frigorífico Nacional — Febrero',
      descripcion: 'Venta directa a frigorífico. Novillos de alta calidad seleccionados durante 8 meses de ceba intensiva.',
      items,
      gastos_operativos: gastos,
      pagos_destino: pagos,
      total_bruto,
      total_gastos,
      total_neto,
      razon_venta: 'Planificada',
      notas: 'Contrato previo con el frigorífico. Precio fijo negociado a $9,000/kg.',
    } satisfies Lote;
  })(),

  // Lote 3 — Liquidez urgente (hace 80 días)
  (() => {
    const items = makeItems(
      {
        codigo: 'HR',
        descripcion: 'Hembra Regular',
        tipo_animal: 'Vaca',
        cantidad: 10,
        modalidad: 'por_kilo',
        peso_total_kg: 3500,
        precio_por_kg: 6500,
        valor_total: 22750000,
      },
      {
        codigo: 'VQ',
        descripcion: 'Vaquilla Joven',
        tipo_animal: 'Vaquilla',
        cantidad: 6,
        modalidad: 'por_kilo',
        peso_total_kg: 1680,
        precio_por_kg: 7200,
        valor_total: 12096000,
      },
      {
        codigo: 'TN',
        descripcion: 'Ternero Macho',
        tipo_animal: 'Ternero',
        cantidad: 4,
        modalidad: 'por_cabeza',
        precio_por_cabeza: 1200000,
        valor_total: 4800000,
      },
    );
    const gastos = makeGastos(
      { descripcion: 'Flete local', monto: 650000 },
      { descripcion: 'Guía sanitaria', monto: 180000 },
      { descripcion: 'Descuento comprador (efectivo)', monto: 900000 },
    );
    const pagos = makePagos(
      { beneficiario: 'Gastos urgentes finca', concepto: 'Reparación bomba de agua', monto: 8000000 },
      { beneficiario: 'Familia Hoyos', concepto: 'Gastos médicos', monto: 15000000 },
      { beneficiario: 'Nómina trabajadores', concepto: 'Pago quincena atrasada', monto: 9000000 },
    );
    const total_bruto = items.reduce((s, i) => s + i.valor_total, 0); // 39646000
    const total_gastos = gastos.reduce((s, g) => s + g.monto, 0);     // 1730000
    const total_neto = total_bruto - total_gastos;
    return {
      id: generateId(),
      fecha: makeDate(80),
      nombre_lote: 'Venta Urgente — Noviembre',
      descripcion: 'Lote de hembras y terneros vendidos por necesidad de liquidez inmediata.',
      items,
      gastos_operativos: gastos,
      pagos_destino: pagos,
      total_bruto,
      total_gastos,
      total_neto,
      razon_venta: 'Liquidez',
      notas: 'Precio por debajo del óptimo por urgencia. Comprador local de confianza.',
    } satisfies Lote;
  })(),
];

// ─── Persistence ──────────────────────────────────────────────────────────────

const VENTAS_KEY = 'panel_ganadero_ventas';
const LOTES_KEY  = 'lotes_ganado';

export const loadVentas = (): VentaAnimal[] => {
  try {
    const raw = localStorage.getItem(VENTAS_KEY);
    return raw ? (JSON.parse(raw) as VentaAnimal[]) : [];
  } catch { return []; }
};

export const saveVentas = (ventas: VentaAnimal[]): void => {
  localStorage.setItem(VENTAS_KEY, JSON.stringify(ventas));
};

export const initializeData = (): VentaAnimal[] => {
  const existing = loadVentas();
  if (existing.length === 0) { saveVentas(SAMPLE_DATA); return SAMPLE_DATA; }
  return existing;
};

export const loadLotes = (): Lote[] => {
  try {
    const raw = localStorage.getItem(LOTES_KEY);
    return raw ? (JSON.parse(raw) as Lote[]) : [];
  } catch { return []; }
};

export const saveLotes = (lotes: Lote[]): void => {
  localStorage.setItem(LOTES_KEY, JSON.stringify(lotes));
};

export const initializeLotes = (): Lote[] => {
  const existing = loadLotes();
  if (existing.length === 0) { saveLotes(SAMPLE_LOTES); return SAMPLE_LOTES; }
  return existing;
};
