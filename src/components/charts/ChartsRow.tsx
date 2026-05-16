import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useApp } from '../../context';
import { formatCOP, getMonthKey, monthLabel } from '../../utils/formatters';
import { CHART_COLORS } from '../../constants';

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; color?: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
      {label && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '0.875rem', fontWeight: 600, color: p.color ?? '#C9A96E' }}>{formatCOP(p.value)}</p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string; percent: number } }[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{item.name}</p>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: item.payload.fill }}>{formatCOP(item.value)}</p>
      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{(item.payload.percent * 100).toFixed(1)}%</p>
    </div>
  );
};

const Legend: React.FC<{ data: { name: string; percent: number }[] }> = ({ data }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
    {data.map((item, i) => (
      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{(item.percent * 100).toFixed(0)}%</span>
      </div>
    ))}
  </div>
);

const Empty: React.FC<{ msg: string }> = ({ msg }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{msg}</div>
);

const axisStyle = { fontSize: 11, fill: '#555A7A', fontFamily: 'DM Sans' };
const cardTitle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase' as const, letterSpacing: '0.07em' };

export const ChartsRow: React.FC = () => {
  const { filteredVentas, ventas } = useApp();

  const monthlyData = React.useMemo(() => {
    const map: Record<string, number> = {};
    ventas.forEach(v => { const k = getMonthKey(v.fecha); map[k] = (map[k] ?? 0) + v.valor_total; });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
      .map(([key, value]) => ({ name: monthLabel(key), value }));
  }, [ventas]);

  const razonData = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredVentas.forEach(v => { map[v.razon_venta] = (map[v.razon_venta] ?? 0) + v.valor_total; });
    const total = Object.values(map).reduce((s, x) => s + x, 0);
    return Object.entries(map).sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, percent: total > 0 ? value / total : 0 }));
  }, [filteredVentas]);

  const destinoData = React.useMemo(() => {
    const map: Record<string, number> = {};
    filteredVentas.forEach(v => { map[v.destino_dinero] = (map[v.destino_dinero] ?? 0) + v.valor_total; });
    const total = Object.values(map).reduce((s, x) => s + x, 0);
    return Object.entries(map).sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value, percent: total > 0 ? value / total : 0 }));
  }, [filteredVentas]);

  return (
    <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <div className="card" style={{ padding: 20 }}>
        <h3 style={cardTitle}>Ingresos por mes</h3>
        {monthlyData.length === 0 ? <Empty msg="Sin datos" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E3250" vertical={false} />
              <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(201,169,110,0.08)' }} />
              <Bar dataKey="value" fill="#C9A96E" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={cardTitle}>Razón de venta</h3>
        {razonData.length === 0 ? <Empty msg="Sin datos en el período" /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={155} height={155}>
              <PieChart>
                <Pie data={razonData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                  {razonData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Legend data={razonData} />
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={cardTitle}>Destino del dinero</h3>
        {destinoData.length === 0 ? <Empty msg="Sin datos en el período" /> : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width={155} height={155}>
              <PieChart>
                <Pie data={destinoData} cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={2} dataKey="value">
                  {destinoData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <Legend data={destinoData} />
          </div>
        )}
      </div>
    </div>
  );
};
