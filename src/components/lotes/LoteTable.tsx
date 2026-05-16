import React, { useState } from 'react';
import { Eye, Pencil, Trash2, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Lote } from '../../types';
import { useApp } from '../../context';
import { formatCOP, formatDate } from '../../utils/formatters';
import { calcTotalCabezas } from '../../utils/calculations';
import { RAZON_COLORS } from '../../constants';
import { Badge } from '../ui/Badge';
import { LoteDetail } from './LoteDetail';

const PAGE_SIZE = 10;

interface LoteTableProps {
  onEdit: (lote: Lote) => void;
}

export const LoteTable: React.FC<LoteTableProps> = ({ onEdit }) => {
  const { lotes, deleteLote } = useApp();
  const [page, setPage] = useState(1);
  const [detailLote, setDetailLote] = useState<Lote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lote | null>(null);

  const sorted = [...lotes].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalNeto = lotes.reduce((s, l) => s + l.total_neto, 0);
  const avgNeto   = lotes.length > 0 ? totalNeto / lotes.length : 0;
  const mejorLote = lotes.reduce<Lote | null>((best, l) => (!best || l.total_neto > best.total_neto ? l : best), null);

  return (
    <>
      {/* KPIs de lotes */}
      <div className="lote-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total lotes', value: String(lotes.length), color: 'var(--color-text-primary)' },
          { label: 'Promedio neto por lote', value: lotes.length > 0 ? formatCOP(Math.round(avgNeto)) : '—', color: '#C9A96E' },
          { label: 'Mejor lote (neto)', value: mejorLote ? formatCOP(mejorLote.total_neto) : '—', sub: mejorLote?.nombre_lote, color: '#C9A96E' },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card-glass" style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</p>
            <p className="tabular" style={{ fontSize: '1.4rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{value}</p>
            {sub && <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Lotes registrados
            <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>{lotes.length} lotes</span>
          </h2>
        </div>

        {lotes.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Package size={40} style={{ color: 'var(--color-border-light)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay lotes registrados aún.</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Crea el primer lote con el botón "Nuevo Lote".</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Nombre del lote</th>
                    <th>Razón</th>
                    <th style={{ textAlign: 'right' }}>Cabezas</th>
                    <th style={{ textAlign: 'right' }}>Bruto</th>
                    <th style={{ textAlign: 'right' }}>Gastos</th>
                    <th style={{ textAlign: 'right' }}>Neto</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(lote => (
                    <tr key={lote.id}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>
                        {formatDate(lote.fecha)}
                      </td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lote.nombre_lote}</span>
                          {lote.descripcion && (
                            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {lote.descripcion}
                            </p>
                          )}
                        </div>
                      </td>
                      <td><Badge label={lote.razon_venta} colorMap={RAZON_COLORS} /></td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem' }}>
                        {calcTotalCabezas(lote)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        {formatCOP(lote.total_bruto)}
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: '#D4614A' }}>
                        {lote.total_gastos > 0 ? formatCOP(lote.total_gastos) : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{ fontWeight: 700, color: '#C9A96E', fontFamily: 'JetBrains Mono', fontSize: '0.9rem' }}>
                          {formatCOP(lote.total_neto)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <button className="btn btn-ghost" onClick={() => setDetailLote(lote)} title="Ver detalle" style={{ padding: '6px 8px' }}><Eye size={15} /></button>
                          <button className="btn btn-ghost" onClick={() => onEdit(lote)} title="Editar" style={{ padding: '6px 8px' }}><Pencil size={15} /></button>
                          <button className="btn btn-danger" onClick={() => setDeleteTarget(lote)} title="Eliminar" style={{ padding: '6px 8px' }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                    <td colSpan={4} style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      Total ({lotes.length} lotes)
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--color-text-secondary)', padding: '10px 14px' }}>
                      {formatCOP(lotes.reduce((s, l) => s + l.total_bruto, 0))}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: '#D4614A', padding: '10px 14px' }}>
                      {formatCOP(lotes.reduce((s, l) => s + l.total_gastos, 0))}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#C9A96E', fontFamily: 'JetBrains Mono', fontSize: '0.9rem', padding: '10px 14px' }}>
                      {formatCOP(lotes.reduce((s, l) => s + l.total_neto, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Página {page} de {totalPages}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
                  <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm delete */}
      {deleteTarget && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setDeleteTarget(null)}>
          <div className="animate-modal-in" onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Eliminar lote</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              ¿Eliminar <strong style={{ color: 'var(--color-text-primary)' }}>{deleteTarget.nombre_lote}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn" onClick={() => { deleteLote(deleteTarget.id); setDeleteTarget(null); }}
                style={{ backgroundColor: '#D4614A', color: '#fff', borderColor: '#D4614A' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {detailLote && <LoteDetail lote={detailLote} onClose={() => setDetailLote(null)} onEdit={l => { setDetailLote(null); onEdit(l); }} />}
    </>
  );
};
