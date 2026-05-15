import React, { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Lote, ItemLote, GastoOperativo, PagoDestino, RazonVenta, TipoAnimal } from '../../types';
import { TIPOS_ANIMAL, RAZONES_VENTA } from '../../constants';
import { generateId, formatCOP, todayISO } from '../../utils/formatters';
import { calcValorItem, calcLoteTotals, calcTotalDistribuido } from '../../utils/calculations';
import { useApp } from '../../context';

interface LoteFormProps {
  editingLote?: Lote | null;
  onClose: () => void;
}

const emptyItem = (): ItemLote => ({
  id: generateId(), codigo: '', descripcion: '', tipo_animal: 'Novillo',
  cantidad: 0, modalidad: 'por_kilo', peso_total_kg: 0, precio_por_kg: 0, valor_total: 0,
});
const emptyGasto = (): GastoOperativo => ({ id: generateId(), descripcion: '', monto: 0 });
const emptyPago = (): PagoDestino => ({ id: generateId(), beneficiario: '', concepto: '', monto: 0 });

const numInput = (
  value: number | undefined,
  onChange: (v: number) => void,
  placeholder?: string,
  style?: React.CSSProperties,
) => (
  <input
    type="number" min="0" step="any" placeholder={placeholder ?? '0'}
    value={value || ''}
    onChange={e => onChange(Number(e.target.value))}
    className="form-input"
    style={{ fontSize: '0.82rem', padding: '7px 10px', ...style }}
  />
);

export const LoteForm: React.FC<LoteFormProps> = ({ editingLote, onClose }) => {
  const { addLote, updateLote } = useApp();

  const [nombre, setNombre]     = useState(editingLote?.nombre_lote ?? '');
  const [fecha, setFecha]       = useState(editingLote?.fecha ?? todayISO());
  const [razon, setRazon]       = useState<RazonVenta>(editingLote?.razon_venta ?? 'Planificada');
  const [desc, setDesc]         = useState(editingLote?.descripcion ?? '');
  const [notas, setNotas]       = useState(editingLote?.notas ?? '');
  const [items, setItems]       = useState<ItemLote[]>(editingLote?.items ?? []);
  const [gastos, setGastos]     = useState<GastoOperativo[]>(editingLote?.gastos_operativos ?? []);
  const [pagos, setPagos]       = useState<PagoDestino[]>(editingLote?.pagos_destino ?? []);

  // ─── Items ───────────────────────────────────────────────────────────────────

  const updateItem = useCallback((id: string, patch: Partial<ItemLote>) => {
    setItems(prev => prev.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, ...patch };
      updated.valor_total = calcValorItem(updated);
      return updated;
    }));
  }, []);

  const addItem    = () => setItems(p => [...p, emptyItem()]);
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  // ─── Gastos ──────────────────────────────────────────────────────────────────

  const updateGasto = (id: string, patch: Partial<GastoOperativo>) =>
    setGastos(prev => prev.map(g => g.id === id ? { ...g, ...patch } : g));
  const addGasto    = () => setGastos(p => [...p, emptyGasto()]);
  const removeGasto = (id: string) => setGastos(p => p.filter(g => g.id !== id));

  // ─── Pagos ───────────────────────────────────────────────────────────────────

  const updatePago = (id: string, patch: Partial<PagoDestino>) =>
    setPagos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  const addPago    = () => setPagos(p => [...p, emptyPago()]);
  const removePago = (id: string) => setPagos(p => p.filter(p => p.id !== id));

  // ─── Calcs ───────────────────────────────────────────────────────────────────

  const { total_bruto, total_gastos, total_neto } = calcLoteTotals(items, gastos);
  const total_distribuido = calcTotalDistribuido(pagos);
  const saldo_libre = total_neto - total_distribuido;

  const isValid = nombre.trim() && fecha && items.length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    const base: Omit<Lote, 'id'> = {
      fecha, nombre_lote: nombre.trim(), descripcion: desc.trim() || undefined,
      razon_venta: razon, notas: notas.trim() || undefined,
      items, gastos_operativos: gastos, pagos_destino: pagos,
      total_bruto, total_gastos, total_neto,
    };
    if (editingLote) updateLote({ ...base, id: editingLote.id });
    else addLote(base);
    onClose();
  };

  // ─── Styles helpers ───────────────────────────────────────────────────────────

  const sectionBox = (children: React.ReactNode, title: string, action: React.ReactNode) => (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', marginBottom: 0 }}>
      <div className="section-header">
        <span className="section-title">{title}</span>
        {action}
      </div>
      {children}
    </div>
  );

  const th = (label: string, style?: React.CSSProperties) => (
    <th style={{ padding: '8px 10px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap', ...style }}>{label}</th>
  );
  const td = (children: React.ReactNode, style?: React.CSSProperties) => (
    <td style={{ padding: '6px 8px', verticalAlign: 'middle', ...style }}>{children}</td>
  );

  const textInput = (value: string, onChange: (v: string) => void, placeholder?: string, style?: React.CSSProperties) => (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="form-input" style={{ fontSize: '0.82rem', padding: '7px 10px', ...style }} />
  );

  const selectInput = (value: string, options: string[], onChange: (v: string) => void, style?: React.CSSProperties) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="form-input" style={{ fontSize: '0.82rem', padding: '7px 28px 7px 10px', ...style }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const trashBtn = (onClick: () => void) => (
    <button onClick={onClick} className="btn btn-danger" style={{ padding: '5px 7px' }} title="Eliminar">
      <Trash2 size={13} />
    </button>
  );

  return (
    <div className="modal-overlay animate-overlay-in" onClick={onClose}>
      <div className="modal-content modal-content-wide animate-modal-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{editingLote ? 'Editar lote' : 'Nuevo lote de venta'}</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>Complete todos los campos del lote</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* ── SECCIÓN 1: Info general ── */}
          {sectionBox(
            <div className="form-grid-2col" style={{ padding: '16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Nombre del lote <span className="required">*</span></label>
                {textInput(nombre, setNombre, 'Ej: Venta Ganado Grande — Abril 2026')}
              </div>
              <div>
                <label className="form-label">Fecha <span className="required">*</span></label>
                <input type="date" className="form-input" value={fecha} max={todayISO()} onChange={e => setFecha(e.target.value)} style={{ fontSize: '0.875rem' }} />
              </div>
              <div>
                <label className="form-label">Razón de venta <span className="required">*</span></label>
                {selectInput(razon, RAZONES_VENTA, v => setRazon(v as RazonVenta))}
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Descripción del ganado</label>
                <textarea className="form-input" value={desc} rows={2}
                  placeholder='Ej: "8 machos Tigrero Gordos, 11 Hembras Blancas arroyanas"'
                  onChange={e => setDesc(e.target.value)} style={{ resize: 'vertical', minHeight: 64 }} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Notas (opcional)</label>
                <textarea className="form-input" value={notas} rows={2} placeholder="Observaciones adicionales…"
                  onChange={e => setNotas(e.target.value)} style={{ resize: 'vertical', minHeight: 64 }} />
              </div>
            </div>,
            '1 · Información general',
            null,
          )}

          {/* ── SECCIÓN 2: Items ── */}
          {sectionBox(
            <>
              <div style={{ overflowX: 'auto' }}>
                {items.length === 0 ? (
                  <p style={{ padding: '20px 16px', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                    Agrega al menos un item al lote
                  </p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                        {th('Código', { width: 70 })}
                        {th('Descripción')}
                        {th('Tipo')}
                        {th('Cant.', { width: 60 })}
                        {th('Modalidad')}
                        {th('Peso total kg')}
                        {th('Precio/kg')}
                        {th('Precio/cab.')}
                        {th('Total', { textAlign: 'right' })}
                        {th('', { width: 32 })}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(it => (
                        <tr key={it.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {td(textInput(it.codigo, v => updateItem(it.id, { codigo: v }), 'NP', { width: 60 }))}
                          {td(textInput(it.descripcion, v => updateItem(it.id, { descripcion: v }), 'Novillo Pesado', { minWidth: 130 }))}
                          {td(selectInput(it.tipo_animal, TIPOS_ANIMAL, v => updateItem(it.id, { tipo_animal: v as TipoAnimal }), { minWidth: 100 }))}
                          {td(numInput(it.cantidad, v => updateItem(it.id, { cantidad: v }), '0', { width: 60 }))}
                          {td(
                            <select value={it.modalidad} onChange={e => updateItem(it.id, { modalidad: e.target.value as 'por_kilo' | 'por_cabeza' })}
                              className="form-input" style={{ fontSize: '0.8rem', padding: '7px 26px 7px 8px', minWidth: 110 }}>
                              <option value="por_kilo">Por kilo</option>
                              <option value="por_cabeza">Por cabeza</option>
                            </select>
                          )}
                          {td(it.modalidad === 'por_kilo'
                            ? numInput(it.peso_total_kg, v => updateItem(it.id, { peso_total_kg: v }), '0', { width: 90 })
                            : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', padding: '0 8px' }}>—</span>
                          )}
                          {td(it.modalidad === 'por_kilo'
                            ? numInput(it.precio_por_kg, v => updateItem(it.id, { precio_por_kg: v }), '0', { width: 90 })
                            : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', padding: '0 8px' }}>—</span>
                          )}
                          {td(it.modalidad === 'por_cabeza'
                            ? numInput(it.precio_por_cabeza, v => updateItem(it.id, { precio_por_cabeza: v }), '0', { width: 110 })
                            : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', padding: '0 8px' }}>—</span>
                          )}
                          {td(
                            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.82rem', fontWeight: 600, color: it.valor_total > 0 ? '#4CAF82' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                              {it.valor_total > 0 ? formatCOP(it.valor_total) : '—'}
                            </span>,
                            { textAlign: 'right', whiteSpace: 'nowrap' }
                          )}
                          {td(trashBtn(() => removeItem(it.id)), { textAlign: 'center' })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Subtotal bruto:&nbsp;
                  <strong style={{ color: '#4CAF82', fontFamily: 'IBM Plex Mono' }}>{formatCOP(total_bruto)}</strong>
                </span>
              </div>
            </>,
            '2 · Items del lote',
            <button className="btn btn-secondary" onClick={addItem} style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 5 }}>
              <Plus size={13} /> Agregar item
            </button>,
          )}

          {/* ── SECCIÓN 3: Gastos operativos ── */}
          {sectionBox(
            <>
              {gastos.length === 0 ? (
                <p style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Sin gastos registrados</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                      {th('Descripción del gasto')}
                      {th('Monto', { textAlign: 'right' })}
                      {th('', { width: 32 })}
                    </tr>
                  </thead>
                  <tbody>
                    {gastos.map(g => (
                      <tr key={g.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {td(textInput(g.descripcion, v => updateGasto(g.id, { descripcion: v }), 'Ej: ICA, Báscula, Comida vaqueros'))}
                        {td(numInput(g.monto, v => updateGasto(g.id, { monto: v }), '0', { width: 140 }), { textAlign: 'right' })}
                        {td(trashBtn(() => removeGasto(g.id)), { textAlign: 'center' })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Total gastos: <strong style={{ color: '#E05C5C', fontFamily: 'IBM Plex Mono' }}>{formatCOP(total_gastos)}</strong>
                  &nbsp;·&nbsp;Neto parcial: <strong style={{ color: '#4CAF82', fontFamily: 'IBM Plex Mono' }}>{formatCOP(total_neto)}</strong>
                </div>
              </div>
            </>,
            '3 · Gastos operativos',
            <button className="btn btn-secondary" onClick={addGasto} style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 5 }}>
              <Plus size={13} /> Agregar gasto
            </button>,
          )}

          {/* ── SECCIÓN 4: Destino del dinero ── */}
          {sectionBox(
            <>
              {pagos.length === 0 ? (
                <p style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Sin pagos asignados</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                      {th('Beneficiario')}
                      {th('Concepto')}
                      {th('Monto', { textAlign: 'right' })}
                      {th('', { width: 32 })}
                    </tr>
                  </thead>
                  <tbody>
                    {pagos.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {td(textInput(p.beneficiario, v => updatePago(p.id, { beneficiario: v }), 'Ej: Carmen, Germán'))}
                        {td(textInput(p.concepto, v => updatePago(p.id, { concepto: v }), 'Ej: Impuesto, Devolución'))}
                        {td(numInput(p.monto, v => updatePago(p.id, { monto: v }), '0', { width: 140 }), { textAlign: 'right' })}
                        {td(trashBtn(() => removePago(p.id)), { textAlign: 'center' })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ padding: '10px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Distribuido: <strong style={{ color: '#E8A838', fontFamily: 'IBM Plex Mono' }}>{formatCOP(total_distribuido)}</strong>
                  &nbsp;·&nbsp;Saldo libre:&nbsp;
                  <strong style={{ fontFamily: 'IBM Plex Mono', color: saldo_libre < 0 ? '#E05C5C' : '#4CAF82' }}>
                    {formatCOP(saldo_libre)}
                  </strong>
                  {saldo_libre < 0 && <span style={{ color: '#E05C5C', marginLeft: 6 }}>⚠ Distribuido excede el neto</span>}
                </div>
              </div>
            </>,
            '4 · Destino del dinero',
            <button className="btn btn-secondary" onClick={addPago} style={{ padding: '6px 12px', fontSize: '0.78rem', gap: 5 }}>
              <Plus size={13} /> Agregar pago
            </button>,
          )}

          {/* ── Resumen final ── */}
          <div style={{ padding: '18px 20px', borderRadius: 12, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', marginBottom: 12 }}>Resumen del lote</p>
            <div className="summary-row">
              {[
                { label: 'Bruto', value: total_bruto, color: 'var(--color-text-primary)' },
                { label: 'Gastos', value: total_gastos, color: '#E05C5C' },
                { label: 'Neto', value: total_neto, color: '#4CAF82' },
                { label: 'Distribuido', value: total_distribuido, color: '#E8A838' },
                { label: 'Saldo libre', value: saldo_libre, color: saldo_libre < 0 ? '#E05C5C' : '#4CAF82' },
              ].map(({ label, value, color }) => (
                <div key={label} className="summary-item">
                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  <span className="mono tabular" style={{ fontSize: '0.95rem', fontWeight: 700, color }}>{formatCOP(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)', borderRadius: '0 0 16px 16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!isValid}>
            {editingLote ? 'Guardar cambios' : 'Guardar lote'}
          </button>
        </div>
      </div>
    </div>
  );
};
