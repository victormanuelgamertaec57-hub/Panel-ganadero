import React, { useState, useEffect } from 'react';
import type { VentaAnimal, TipoAnimal, RazonVenta, DestinoDinero } from '../../types';
import { TIPOS_ANIMAL, RAZONES_VENTA, DESTINOS_DINERO } from '../../constants';
import { useApp } from '../../context';
import { calcValorTotal } from '../../utils/calculations';
import { formatCOP, todayISO } from '../../utils/formatters';
import { X } from 'lucide-react';

interface VentaFormProps {
  editingVenta?: VentaAnimal | null;
  onClose: () => void;
}

const EMPTY_FORM = {
  fecha: todayISO(),
  nombre_o_identificador: '',
  tipo_animal: 'Novillo' as TipoAnimal,
  peso_kg: '' as unknown as number,
  modalidad_venta: 'por_kilo' as 'por_kilo' | 'por_cabeza',
  precio_por_kg: '' as unknown as number,
  precio_por_cabeza: '' as unknown as number,
  razon_venta: 'Planificada' as RazonVenta,
  razon_detalle: '',
  destino_dinero: 'Gastos finca' as DestinoDinero,
  destino_detalle: '',
  notas: '',
};
type FormState = typeof EMPTY_FORM;

export const VentaForm: React.FC<VentaFormProps> = ({ editingVenta, onClose }) => {
  const { addVenta, updateVenta } = useApp();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingVenta) {
      setForm({
        fecha: editingVenta.fecha,
        nombre_o_identificador: editingVenta.nombre_o_identificador,
        tipo_animal: editingVenta.tipo_animal,
        peso_kg: editingVenta.peso_kg,
        modalidad_venta: editingVenta.modalidad_venta,
        precio_por_kg: editingVenta.precio_por_kg ?? ('' as unknown as number),
        precio_por_cabeza: editingVenta.precio_por_cabeza ?? ('' as unknown as number),
        razon_venta: editingVenta.razon_venta,
        razon_detalle: editingVenta.razon_detalle ?? '',
        destino_dinero: editingVenta.destino_dinero,
        destino_detalle: editingVenta.destino_detalle ?? '',
        notas: editingVenta.notas ?? '',
      });
    } else {
      setForm({ ...EMPTY_FORM, fecha: todayISO() });
    }
    setErrors({});
  }, [editingVenta]);

  const set = (key: keyof FormState, value: string | number) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const valorTotal = calcValorTotal(
    form.modalidad_venta,
    Number(form.peso_kg) || 0,
    Number(form.precio_por_kg) || undefined,
    Number(form.precio_por_cabeza) || undefined,
  );

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.nombre_o_identificador.trim()) errs.nombre = 'Requerido.';
    if (!form.peso_kg || Number(form.peso_kg) <= 0) errs.peso_kg = 'Debe ser mayor a 0.';
    if (form.modalidad_venta === 'por_kilo' && (!form.precio_por_kg || Number(form.precio_por_kg) <= 0)) errs.precio_por_kg = 'Requerido.';
    if (form.modalidad_venta === 'por_cabeza' && (!form.precio_por_cabeza || Number(form.precio_por_cabeza) <= 0)) errs.precio_por_cabeza = 'Requerido.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const base = {
      fecha: form.fecha,
      nombre_o_identificador: form.nombre_o_identificador.trim(),
      tipo_animal: form.tipo_animal,
      peso_kg: Number(form.peso_kg),
      modalidad_venta: form.modalidad_venta,
      precio_por_kg: form.modalidad_venta === 'por_kilo' ? Number(form.precio_por_kg) : undefined,
      precio_por_cabeza: form.modalidad_venta === 'por_cabeza' ? Number(form.precio_por_cabeza) : undefined,
      valor_total: valorTotal,
      razon_venta: form.razon_venta,
      razon_detalle: form.razon_detalle.trim() || undefined,
      destino_dinero: form.destino_dinero,
      destino_detalle: form.destino_detalle.trim() || undefined,
      notas: form.notas.trim() || undefined,
    };
    if (editingVenta) updateVenta({ ...base, id: editingVenta.id });
    else addVenta(base);
    onClose();
  };

  const isValid = form.nombre_o_identificador.trim()
    && Number(form.peso_kg) > 0
    && (form.modalidad_venta === 'por_kilo' ? Number(form.precio_por_kg) > 0 : Number(form.precio_por_cabeza) > 0);

  const Field: React.FC<{ label: string; required?: boolean; error?: string; children: React.ReactNode }> = ({ label, required, error, children }) => (
    <div>
      <label className="form-label">{label}{required && <span className="required">*</span>}</label>
      {children}
      {error && <p style={{ fontSize: '0.72rem', color: 'var(--color-danger-light)', marginTop: 4 }}>{error}</p>}
    </div>
  );

  return (
    <div className="modal-overlay animate-overlay-in" onClick={onClose}>
      <div className="modal-content animate-modal-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{editingVenta ? 'Editar venta' : 'Registrar venta individual'}</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              {editingVenta ? `Editando: ${editingVenta.nombre_o_identificador}` : 'Complete los datos del animal vendido'}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: 8 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
            <Field label="Fecha" required error={errors.fecha}>
              <input type="date" className="form-input" value={form.fecha} max={todayISO()} onChange={e => set('fecha', e.target.value)} />
            </Field>
            <Field label="Nombre / Identificador" required error={errors.nombre}>
              <input type="text" className="form-input" value={form.nombre_o_identificador} placeholder="Ej: Novillo Pintado, La Negra…" onChange={e => set('nombre_o_identificador', e.target.value)} />
            </Field>
          </div>

          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Tipo de animal" required>
              <select className="form-input" value={form.tipo_animal} onChange={e => set('tipo_animal', e.target.value)}>
                {TIPOS_ANIMAL.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Peso (kg)" required error={errors.peso_kg}>
              <input type="number" className="form-input" value={form.peso_kg} placeholder="0" min="0" step="0.5" onChange={e => set('peso_kg', e.target.value)} />
            </Field>
          </div>

          <div>
            <label className="form-label">Modalidad de venta <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['por_kilo', 'por_cabeza'] as const).map(m => (
                <label key={m} className={`radio-option${form.modalidad_venta === m ? ' selected' : ''}`}>
                  <input type="radio" name="modalidad" value={m} checked={form.modalidad_venta === m} onChange={() => set('modalidad_venta', m)} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{m === 'por_kilo' ? 'Por kilo' : 'Por cabeza'}</span>
                </label>
              ))}
            </div>
          </div>

          {form.modalidad_venta === 'por_kilo' ? (
            <Field label="Precio por kg (COP)" required error={errors.precio_por_kg}>
              <input type="number" className="form-input" value={form.precio_por_kg} placeholder="Ej: 8500" min="0" step="50" onChange={e => set('precio_por_kg', e.target.value)} />
            </Field>
          ) : (
            <Field label="Precio por cabeza (COP)" required error={errors.precio_por_cabeza}>
              <input type="number" className="form-input" value={form.precio_por_cabeza} placeholder="Ej: 2500000" min="0" step="10000" onChange={e => set('precio_por_cabeza', e.target.value)} />
            </Field>
          )}

          <div style={{ padding: '14px 18px', borderRadius: 10, backgroundColor: valorTotal > 0 ? 'rgba(76,175,130,0.1)' : 'var(--color-surface-2)', border: '1px solid', borderColor: valorTotal > 0 ? 'rgba(76,175,130,0.3)' : 'var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Valor total calculado</span>
            <span className="mono tabular" style={{ fontSize: '1.2rem', fontWeight: 700, color: valorTotal > 0 ? '#C9A96E' : 'var(--color-text-muted)' }}>
              {valorTotal > 0 ? formatCOP(valorTotal) : '—'}
            </span>
          </div>

          <div className="form-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <Field label="Razón de venta" required>
                <select className="form-input" value={form.razon_venta} onChange={e => set('razon_venta', e.target.value)}>
                  {RAZONES_VENTA.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </Field>
              {form.razon_venta === 'Otro' && (
                <input type="text" className="form-input" value={form.razon_detalle} placeholder="Especifica la razón…" onChange={e => set('razon_detalle', e.target.value)} style={{ marginTop: 8 }} />
              )}
            </div>
            <div>
              <Field label="Destino del dinero" required>
                <select className="form-input" value={form.destino_dinero} onChange={e => set('destino_dinero', e.target.value)}>
                  {DESTINOS_DINERO.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              {form.destino_dinero === 'Otro' && (
                <input type="text" className="form-input" value={form.destino_detalle} placeholder="Especifica el destino…" onChange={e => set('destino_detalle', e.target.value)} style={{ marginTop: 8 }} />
              )}
            </div>
          </div>

          <Field label="Notas (opcional)">
            <textarea className="form-input" value={form.notas} placeholder="Observaciones adicionales…" rows={3} onChange={e => set('notas', e.target.value)} style={{ resize: 'vertical', minHeight: 80 }} />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--color-border)', position: 'sticky', bottom: 0, backgroundColor: 'var(--color-surface)', borderRadius: '0 0 16px 16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!isValid}>
            {editingVenta ? 'Guardar cambios' : 'Guardar registro'}
          </button>
        </div>
      </div>
    </div>
  );
};
