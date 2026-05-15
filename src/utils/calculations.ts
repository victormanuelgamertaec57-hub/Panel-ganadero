import type { VentaAnimal, ItemLote, GastoOperativo, PagoDestino, Lote } from '../types';

export const calcValorItem = (item: Omit<ItemLote, 'id' | 'valor_total'>): number => {
  if (item.modalidad === 'por_kilo') {
    return Math.round((item.peso_total_kg ?? 0) * (item.precio_por_kg ?? 0));
  }
  return Math.round((item.precio_por_cabeza ?? 0) * item.cantidad);
};

export const calcValorTotal = (
  modalidad: 'por_kilo' | 'por_cabeza',
  peso_kg: number,
  precio_por_kg?: number,
  precio_por_cabeza?: number,
): number => {
  if (modalidad === 'por_kilo' && precio_por_kg) return Math.round(peso_kg * precio_por_kg);
  if (modalidad === 'por_cabeza' && precio_por_cabeza) return precio_por_cabeza;
  return 0;
};

export const calcLoteTotals = (
  items: ItemLote[],
  gastos: GastoOperativo[],
): { total_bruto: number; total_gastos: number; total_neto: number } => {
  const total_bruto = items.reduce((s, i) => s + i.valor_total, 0);
  const total_gastos = gastos.reduce((s, g) => s + g.monto, 0);
  return { total_bruto, total_gastos, total_neto: total_bruto - total_gastos };
};

export const calcTotalDistribuido = (pagos: PagoDestino[]): number =>
  pagos.reduce((s, p) => s + p.monto, 0);

export const calcSaldoLibre = (lote: Lote): number =>
  lote.total_neto - calcTotalDistribuido(lote.pagos_destino);

export const calcTotalCabezas = (lote: Lote): number =>
  lote.items.reduce((s, i) => s + i.cantidad, 0);

export const filterByDateRange = (
  items: VentaAnimal[],
  from: string,
  to: string,
): VentaAnimal[] => items.filter(v => v.fecha >= from && v.fecha <= to);

export const filterLotesByDateRange = (
  lotes: Lote[],
  from: string,
  to: string,
): Lote[] => lotes.filter(l => l.fecha >= from && l.fecha <= to);

export const percentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

export const exportToCSV = (ventas: VentaAnimal[], filename = 'ventas_ganado.csv') => {
  const headers = [
    'ID', 'Fecha', 'Animal', 'Tipo', 'Peso (kg)', 'Modalidad',
    'Precio/kg', 'Precio/cabeza', 'Valor Total', 'Razón Venta',
    'Detalle Razón', 'Destino Dinero', 'Detalle Destino', 'Notas',
  ];
  const rows = ventas.map(v => [
    v.id, v.fecha, v.nombre_o_identificador, v.tipo_animal,
    v.peso_kg, v.modalidad_venta,
    v.precio_por_kg ?? '', v.precio_por_cabeza ?? '',
    v.valor_total, v.razon_venta,
    v.razon_detalle ?? '', v.destino_dinero,
    v.destino_detalle ?? '', v.notas ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
