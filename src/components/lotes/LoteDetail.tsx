import React from 'react';
import { X, Pencil, Printer } from 'lucide-react';
import type { Lote } from '../../types';
import { formatCOP, formatDate } from '../../utils/formatters';
import { calcTotalCabezas, calcTotalDistribuido, calcSaldoLibre } from '../../utils/calculations';
import { RAZON_COLORS } from '../../constants';
import { Badge } from '../ui/Badge';

interface LoteDetailProps {
  lote: Lote;
  onClose: () => void;
  onEdit: (lote: Lote) => void;
}

export const LoteDetail: React.FC<LoteDetailProps> = ({ lote, onClose, onEdit }) => {
  const saldo = calcSaldoLibre(lote);
  const distribuido = calcTotalDistribuido(lote.pagos_destino);

  const handlePrint = () => {
    window.print();
  };

  const sectionTitle = (text: string) => (
    <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 12 }}>{text}</h3>
  );

  return (
    <div className="modal-overlay animate-overlay-in" onClick={onClose}>
      <div className="modal-content modal-content-wide animate-modal-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{lote.nombre_lote}</h2>
              <Badge label={lote.razon_venta} colorMap={RAZON_COLORS} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(lote.fecha)} · {calcTotalCabezas(lote)} cabezas · {lote.items.length} categorías</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary no-print" onClick={handlePrint} style={{ padding: '7px 12px', gap: 6, fontSize: '0.82rem' }}>
              <Printer size={14} /> Exportar PDF
            </button>
            <button className="btn btn-secondary no-print" onClick={() => onEdit(lote)} style={{ padding: '7px 12px', gap: 6, fontSize: '0.82rem' }}>
              <Pencil size={14} /> Editar
            </button>
            <button className="btn btn-ghost no-print" onClick={onClose} style={{ padding: 8 }}><X size={18} /></button>
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Resumen */}
          <div>
            {sectionTitle('Resumen del lote')}
            <div className="summary-row">
              {[
                { label: 'Bruto', value: lote.total_bruto, color: 'var(--color-text-primary)' },
                { label: 'Gastos', value: lote.total_gastos, color: '#E05C5C' },
                { label: 'Neto', value: lote.total_neto, color: '#4CAF82' },
                { label: 'Distribuido', value: distribuido, color: '#E8A838' },
                { label: 'Saldo libre', value: saldo, color: saldo < 0 ? '#E05C5C' : '#4CAF82' },
              ].map(({ label, value, color }) => (
                <div key={label} className="summary-item">
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span className="mono tabular" style={{ fontSize: '1rem', fontWeight: 700, color }}>{formatCOP(value)}</span>
                </div>
              ))}
            </div>
            {lote.descripcion && (
              <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>"{lote.descripcion}"</p>
            )}
            {lote.notas && (
              <p style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Notas: {lote.notas}</p>
            )}
          </div>

          {/* Items */}
          {lote.items.length > 0 && (
            <div>
              {sectionTitle('Items del lote')}
              <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descripción</th>
                      <th>Tipo</th>
                      <th style={{ textAlign: 'right' }}>Cant.</th>
                      <th>Modalidad</th>
                      <th style={{ textAlign: 'right' }}>Peso total</th>
                      <th style={{ textAlign: 'right' }}>Precio unit.</th>
                      <th style={{ textAlign: 'right' }}>Valor total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lote.items.map(it => (
                      <tr key={it.id}>
                        <td><span className="badge" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', fontFamily: 'IBM Plex Mono' }}>{it.codigo}</span></td>
                        <td style={{ fontWeight: 500 }}>{it.descripcion}</td>
                        <td>{it.tipo_animal}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono' }}>{it.cantidad}</td>
                        <td>{it.modalidad === 'por_kilo' ? 'Por kilo' : 'Por cabeza'}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', color: 'var(--color-text-secondary)' }}>
                          {it.modalidad === 'por_kilo' ? `${(it.peso_total_kg ?? 0).toLocaleString('es-CO')} kg` : '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', color: 'var(--color-text-secondary)' }}>
                          {it.modalidad === 'por_kilo'
                            ? formatCOP(it.precio_por_kg ?? 0) + '/kg'
                            : formatCOP(it.precio_por_cabeza ?? 0) + '/cab.'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#4CAF82', fontFamily: 'IBM Plex Mono' }}>
                          {formatCOP(it.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Gastos */}
          {lote.gastos_operativos.length > 0 && (
            <div>
              {sectionTitle('Gastos operativos')}
              <div style={{ borderRadius: 10, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lote.gastos_operativos.map(g => (
                      <tr key={g.id}>
                        <td>{g.descripcion}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', color: '#E05C5C', fontWeight: 600 }}>{formatCOP(g.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagos */}
          {lote.pagos_destino.length > 0 && (
            <div>
              {sectionTitle('Pagos y destino del dinero')}
              <div style={{ borderRadius: 10, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Beneficiario</th>
                      <th>Concepto</th>
                      <th style={{ textAlign: 'right' }}>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lote.pagos_destino.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.beneficiario}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{p.concepto}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', color: '#E8A838', fontWeight: 600 }}>{formatCOP(p.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
