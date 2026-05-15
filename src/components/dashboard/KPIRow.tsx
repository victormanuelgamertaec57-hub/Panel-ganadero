import React from 'react';
import { DollarSign, Beef, Scale, Trophy } from 'lucide-react';
import { KPICard } from './KPICard';
import { useApp } from '../../context';
import { formatCOP } from '../../utils/formatters';
import { filterByDateRange, percentChange } from '../../utils/calculations';
import { getMonthKey } from '../../utils/formatters';

const getPreviousPeriod = (from: string, to: string) => {
  const fromDate = new Date(from + 'T12:00:00');
  const toDate   = new Date(to + 'T12:00:00');
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  const prevTo   = new Date(fromDate); prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);   prevFrom.setDate(prevFrom.getDate() - diffDays + 1);
  return { from: prevFrom.toISOString().split('T')[0], to: prevTo.toISOString().split('T')[0] };
};

export const KPIRow: React.FC = () => {
  const { ventas, filteredVentas, dateRange } = useApp();

  const prev      = getPreviousPeriod(dateRange.from, dateRange.to);
  const prevVentas = filterByDateRange(ventas, prev.from, prev.to);

  const totalActual   = filteredVentas.reduce((s, v) => s + v.valor_total, 0);
  const totalAnterior = prevVentas.reduce((s, v) => s + v.valor_total, 0);
  const pctTotal      = percentChange(totalActual, totalAnterior);

  const countActual  = filteredVentas.length;
  const countPorTipo = filteredVentas.reduce<Record<string, number>>((acc, v) => {
    acc[v.tipo_animal] = (acc[v.tipo_animal] ?? 0) + 1; return acc;
  }, {});
  const tipoTop = Object.entries(countPorTipo).sort((a, b) => b[1] - a[1]).slice(0, 2);

  const porKilo = filteredVentas.filter(v => v.modalidad_venta === 'por_kilo' && v.precio_por_kg);
  const avgKg   = porKilo.length > 0 ? porKilo.reduce((s, v) => s + (v.precio_por_kg ?? 0), 0) / porKilo.length : 0;

  const masCaroVenta = filteredVentas.reduce<typeof filteredVentas[0] | null>(
    (top, v) => (!top || v.valor_total > top.valor_total ? v : top), null
  );

  // Sparkline: monthly totals last 6 months
  const monthlyTotals = React.useMemo(() => {
    const map: Record<string, number> = {};
    ventas.forEach(v => { const k = getMonthKey(v.fecha); map[k] = (map[k] ?? 0) + v.valor_total; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, v]) => v);
  }, [ventas]);

  return (
    <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
      <KPICard
        icon={<DollarSign size={20} />}
        bgIcon={<DollarSign size={20} />}
        label="Total recaudado"
        value={formatCOP(totalActual)}
        subtext={pctTotal !== null
          ? `${pctTotal >= 0 ? '+' : ''}${pctTotal.toFixed(1)}% vs período anterior`
          : 'Sin datos del período anterior'}
        trend={pctTotal === null ? 'neutral' : pctTotal >= 0 ? 'up' : 'down'}
        accent
        sparkline={monthlyTotals}
      />
      <KPICard
        icon={<Beef size={20} />}
        bgIcon={<Beef size={20} />}
        label="Animales vendidos"
        value={String(countActual)}
        subtext={tipoTop.length > 0
          ? tipoTop.map(([t, n]) => `${n} ${t}`).join(' · ')
          : 'Sin ventas en el período'}
      />
      <KPICard
        icon={<Scale size={20} />}
        bgIcon={<Scale size={20} />}
        label="Precio prom. / kg"
        value={porKilo.length > 0 ? formatCOP(Math.round(avgKg)) : '—'}
        subtext={`Basado en ${porKilo.length} venta${porKilo.length !== 1 ? 's' : ''} por kilo`}
      />
      <KPICard
        icon={<Trophy size={20} />}
        bgIcon={<Trophy size={20} />}
        label="Animal más caro"
        value={masCaroVenta ? formatCOP(masCaroVenta.valor_total) : '—'}
        subtext={masCaroVenta
          ? `${masCaroVenta.nombre_o_identificador} · ${masCaroVenta.tipo_animal}`
          : 'Sin ventas en el período'}
      />
    </div>
  );
};
