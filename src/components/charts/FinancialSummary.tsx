import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context';
import { formatCOP, getMonthKey, monthLabel } from '../../utils/formatters';

export const FinancialSummary: React.FC = () => {
  const { filteredVentas, ventas } = useApp();

  const porKiloTotal   = filteredVentas.filter(v => v.modalidad_venta === 'por_kilo').reduce((s, v) => s + v.valor_total, 0);
  const porCabezaTotal = filteredVentas.filter(v => v.modalidad_venta === 'por_cabeza').reduce((s, v) => s + v.valor_total, 0);
  const grandTotal     = porKiloTotal + porCabezaTotal;

  const byTipo = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    filteredVentas.forEach(v => {
      if (!map[v.tipo_animal]) map[v.tipo_animal] = { count: 0, total: 0 };
      map[v.tipo_animal].count += 1;
      map[v.tipo_animal].total += v.valor_total;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [filteredVentas]);

  const kgEvolution = useMemo(() => {
    const map: Record<string, { sum: number; count: number }> = {};
    ventas.filter(v => v.modalidad_venta === 'por_kilo' && v.precio_por_kg).forEach(v => {
      const key = getMonthKey(v.fecha);
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += v.precio_por_kg!;
      map[key].count += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
      .map(([key, { sum, count }]) => ({ name: monthLabel(key), value: Math.round(sum / count) }));
  }, [ventas]);

  const sectionTitle = (text: string) => (
    <h3 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.07em', marginBottom: 16 }}>{text}</h3>
  );

  const axisStyle = { fontSize: 11, fill: '#555A7A', fontFamily: 'Plus Jakarta Sans' };

  const LineTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{label}</p>
        <p style={{ fontWeight: 600, color: '#4CAF82', fontSize: '0.875rem' }}>{formatCOP(payload[0].value)}/kg</p>
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--color-text-primary)' }}>Resumen financiero</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: '20px 22px' }}>
          {sectionTitle('Por modalidad de venta')}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Por kilo', value: porKiloTotal, count: filteredVentas.filter(v => v.modalidad_venta === 'por_kilo').length },
              { label: 'Por cabeza', value: porCabezaTotal, count: filteredVentas.filter(v => v.modalidad_venta === 'por_cabeza').length },
            ].map(({ label, value, count }) => {
              const pct = grandTotal > 0 ? (value / grandTotal) * 100 : 0;
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                      {label} <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>({count})</span>
                    </span>
                    <span style={{ fontWeight: 600, fontFamily: 'IBM Plex Mono', fontSize: '0.875rem', color: 'var(--color-accent-light)' }}>
                      {formatCOP(value)}
                    </span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, backgroundColor: 'var(--color-accent)', width: `${pct}%`, transition: 'width 0.5s ease' }} />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 3 }}>{pct.toFixed(1)}% del total</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          {sectionTitle('Por tipo de animal')}
          {byTipo.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Sin datos en el período.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tipo', 'Cant.', 'Total', 'Promedio'].map(h => (
                    <th key={h} style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, textAlign: h === 'Tipo' ? 'left' : 'right', paddingBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {byTipo.map(([tipo, { count, total }]) => (
                  <tr key={tipo}>
                    <td style={{ fontSize: '0.82rem', paddingBottom: 8 }}>{tipo}</td>
                    <td style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--color-text-secondary)', paddingBottom: 8 }}>{count}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontSize: '0.8rem', fontWeight: 600, color: '#4CAF82', paddingBottom: 8 }}>{formatCOP(total)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontSize: '0.78rem', color: 'var(--color-text-muted)', paddingBottom: 8 }}>{formatCOP(Math.round(total / count))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card" style={{ padding: '20px 22px' }}>
          {sectionTitle('Evolución precio/kg (últimos 6 meses)')}
          {kgEvolution.length < 2 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Necesita al menos 2 meses de datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={kgEvolution} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E3250" vertical={false} />
                <XAxis dataKey="name" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<LineTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#4CAF82" strokeWidth={2}
                  dot={{ fill: '#4CAF82', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#5dcc97' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
