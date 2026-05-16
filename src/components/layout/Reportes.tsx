import React, { useRef, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { useApp } from '../../context';
import { formatCOP, formatDate } from '../../utils/formatters';
import { calcTotalCabezas } from '../../utils/calculations';

export const Reportes: React.FC = () => {
  const { filteredVentas, filteredLotes, dateRange } = useApp();
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const totalVentas = filteredVentas.reduce((s, v) => s + v.valor_total, 0);
  const totalLotes  = filteredLotes.reduce((s, l) => s + l.total_neto, 0);
  const totalGeneral = totalVentas + totalLotes;

  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const el = reportRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0D0F0E', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`GanApp-Reporte-${dateRange.from}-${dateRange.to}.pdf`);
    } finally {
      setGenerating(false);
    }
  };

  const kpiCard = (label: string, value: string, color: string) => (
    <div style={{ flex: 1, minWidth: 140, padding: '16px 18px', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
      <p className="mono tabular" style={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value}</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Reportes</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
            Período: {formatDate(dateRange.from)} → {formatDate(dateRange.to)}
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleGeneratePDF} disabled={generating} style={{ gap: 8 }}>
          {generating ? (
            <><span className="spinner" style={{ width: 15, height: 15 }} /> Generando…</>
          ) : (
            <><Download size={15} /> Generar PDF</>
          )}
        </button>
      </div>

      {/* Report content (also used for PDF capture) */}
      <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header del reporte */}
        <div className="card" style={{ padding: '22px 24px', background: 'linear-gradient(135deg, rgba(201,169,110,0.08) 0%, rgba(255,255,255,0.03) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <svg width="44" height="44" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#C9A96E"/><path d="M25 40 C20 30 18 22 28 20 C32 19 35 24 35 28 C35 24 38 19 42 20 L50 20 C54 19 57 24 57 28 C57 24 60 19 64 20 C74 22 72 30 67 40 L65 45 C68 48 70 52 70 57 C70 70 61 78 50 78 C39 78 30 70 30 57 C30 52 32 48 35 45 Z" fill="white"/></svg>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>GanApp</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Reporte de actividad ganadera</p>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
            Período analizado: <strong style={{ color: 'var(--color-text-primary)' }}>{formatDate(dateRange.from)}</strong> al <strong style={{ color: 'var(--color-text-primary)' }}>{formatDate(dateRange.to)}</strong>
          </p>
        </div>

        {/* KPIs generales */}
        <div className="card" style={{ padding: '20px 24px' }}>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Resumen ejecutivo</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {kpiCard('Ventas individuales', formatCOP(totalVentas), '#C9A96E')}
            {kpiCard('Ingresos por lotes', formatCOP(totalLotes), '#E8A838')}
            {kpiCard('Total general', formatCOP(totalGeneral), '#F0F2FF')}
            {kpiCard('Animales vendidos', String(filteredVentas.length), '#60a5fa')}
            {kpiCard('Lotes en período', String(filteredLotes.length), '#c084fc')}
          </div>
        </div>

        {/* Tabla de ventas individuales */}
        {filteredVentas.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                Ventas individuales ({filteredVentas.length})
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Animal</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Peso kg</th>
                    <th style={{ textAlign: 'right' }}>Valor total</th>
                    <th>Razón</th>
                    <th>Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVentas.map(v => (
                    <tr key={v.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(v.fecha)}</td>
                      <td style={{ fontWeight: 500 }}>{v.nombre_o_identificador}</td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{v.tipo_animal}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>{v.peso_kg.toLocaleString('es-CO')}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#C9A96E', fontFamily: 'JetBrains Mono' }}>{formatCOP(v.valor_total)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{v.razon_venta}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{v.destino_dinero}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                    <td colSpan={4} style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Subtotal</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#C9A96E', fontFamily: 'JetBrains Mono', padding: '10px 14px' }}>{formatCOP(totalVentas)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tabla de lotes */}
        {filteredLotes.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                Lotes de venta ({filteredLotes.length})
              </h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre del lote</th>
                    <th style={{ textAlign: 'right' }}>Cabezas</th>
                    <th style={{ textAlign: 'right' }}>Bruto</th>
                    <th style={{ textAlign: 'right' }}>Gastos</th>
                    <th style={{ textAlign: 'right' }}>Neto</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLotes.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(l.fecha)}</td>
                      <td style={{ fontWeight: 500 }}>{l.nombre_lote}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>{calcTotalCabezas(l)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--color-text-secondary)' }}>{formatCOP(l.total_bruto)}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: '#D4614A' }}>{formatCOP(l.total_gastos)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#C9A96E', fontFamily: 'JetBrains Mono' }}>{formatCOP(l.total_neto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredVentas.length === 0 && filteredLotes.length === 0 && (
          <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={40} style={{ color: 'var(--color-border-light)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay datos en el período seleccionado.</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>Cambia el rango de fechas para ver datos.</p>
          </div>
        )}

        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: 8 }}>
          GanApp · Reporte generado el {formatDate(new Date().toISOString().split('T')[0])} · Datos almacenados localmente
        </p>
      </div>
    </div>
  );
};
