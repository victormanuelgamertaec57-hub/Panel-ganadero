import React, { useState, useMemo } from 'react';
import type { VentaAnimal, SortField, SortDirection, TableFilters } from '../../types';
import { TIPOS_ANIMAL, RAZONES_VENTA, DESTINOS_DINERO, TIPO_ANIMAL_COLORS, RAZON_COLORS, DESTINO_COLORS } from '../../constants';
import { useApp } from '../../context';
import { formatCOP, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/calculations';
import { Badge } from '../ui/Badge';
import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, Search, Download, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';

const PAGE_SIZE = 10;

const SortIcon: React.FC<{ field: SortField; current: SortField | null; dir: SortDirection }> = ({ field, current, dir }) => {
  if (current !== field) return <ChevronsUpDown size={12} style={{ opacity: 0.35, marginLeft: 4 }} />;
  return dir === 'asc'
    ? <ChevronUp size={12} style={{ marginLeft: 4, color: '#4CAF82' }} />
    : <ChevronDown size={12} style={{ marginLeft: 4, color: '#4CAF82' }} />;
};

const selectStyle: React.CSSProperties = {
  padding: '7px 30px 7px 11px', fontSize: '0.8rem', borderRadius: 8,
  border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)',
  color: 'var(--color-text-primary)', fontFamily: 'inherit', cursor: 'pointer',
  appearance: 'none', WebkitAppearance: 'none',
  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B92B8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '14px',
};

interface VentaTableProps {
  onEdit: (v: VentaAnimal) => void;
}

export const VentaTable: React.FC<VentaTableProps> = ({ onEdit }) => {
  const { filteredVentas, deleteVenta } = useApp();
  const [sortField, setSortField] = useState<SortField | null>('fecha');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<VentaAnimal | null>(null);
  const [filters, setFilters] = useState<TableFilters>({ search: '', tipo_animal: '', razon_venta: '', destino_dinero: '' });

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };
  const setFilter = (key: keyof TableFilters, value: string) => {
    setFilters(f => ({ ...f, [key]: value })); setPage(1);
  };

  const filtered = useMemo(() => filteredVentas.filter(v => {
    if (filters.search && !v.nombre_o_identificador.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.tipo_animal && v.tipo_animal !== filters.tipo_animal) return false;
    if (filters.razon_venta && v.razon_venta !== filters.razon_venta) return false;
    if (filters.destino_dinero && v.destino_dinero !== filters.destino_dinero) return false;
    return true;
  }), [filteredVentas, filters]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortField], vb = b[sortField];
      if (va === undefined || vb === undefined) return 0;
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const subtotalValor = filtered.reduce((s, v) => s + v.valor_total, 0);
  const subtotalPeso  = filtered.reduce((s, v) => s + v.peso_kg, 0);

  const th = (label: string, field?: SortField, style?: React.CSSProperties) => (
    <th onClick={field ? () => handleSort(field) : undefined} style={{ cursor: field ? 'pointer' : 'default', ...style }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {label}
        {field && <SortIcon field={field} current={sortField} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600 }}>
            Registros individuales
            <span style={{ marginLeft: 8, fontSize: '0.78rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>
              {filtered.length} {filtered.length !== 1 ? 'ventas' : 'venta'}
            </span>
          </h2>
          <button className="btn btn-secondary" onClick={() => exportToCSV(filtered, 'ventas_filtradas.csv')} style={{ gap: 6, padding: '7px 12px', fontSize: '0.8rem' }}>
            <Download size={14} /> Exportar CSV
          </button>
        </div>

        <div className="venta-filter-bar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input type="text" className="form-input" placeholder="Buscar animal..." value={filters.search} onChange={e => setFilter('search', e.target.value)} style={{ paddingLeft: 32, fontSize: '0.8rem', padding: '7px 11px 7px 32px' }} />
          </div>
          <select style={selectStyle} value={filters.tipo_animal} onChange={e => setFilter('tipo_animal', e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_ANIMAL.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select style={selectStyle} value={filters.razon_venta} onChange={e => setFilter('razon_venta', e.target.value)}>
            <option value="">Todas las razones</option>
            {RAZONES_VENTA.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select style={selectStyle} value={filters.destino_dinero} onChange={e => setFilter('destino_dinero', e.target.value)}>
            <option value="">Todos los destinos</option>
            {DESTINOS_DINERO.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {(filters.search || filters.tipo_animal || filters.razon_venta || filters.destino_dinero) && (
            <button className="btn btn-ghost" onClick={() => { setFilters({ search: '', tipo_animal: '', razon_venta: '', destino_dinero: '' }); setPage(1); }}
              style={{ fontSize: '0.78rem', padding: '7px 10px', color: 'var(--color-danger-light)' }}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        {pageData.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <PackageOpen size={40} style={{ color: 'var(--color-border-light)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No hay ventas que coincidan con los filtros.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {th('Fecha', 'fecha')}
                {th('Animal', 'nombre_o_identificador')}
                {th('Peso', 'peso_kg', { textAlign: 'right' })}
                {th('Modalidad', 'modalidad_venta')}
                <th>Precio unit.</th>
                {th('Valor total', 'valor_total', { textAlign: 'right' })}
                {th('Razón', 'razon_venta')}
                {th('Destino', 'destino_dinero')}
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(v => (
                <tr key={v.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{formatDate(v.fecha)}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{v.nombre_o_identificador}</span>
                      <Badge label={v.tipo_animal} colorMap={TIPO_ANIMAL_COLORS} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontSize: '0.82rem' }}>{v.peso_kg.toLocaleString('es-CO')} kg</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: v.modalidad_venta === 'por_kilo' ? '#0d1e35' : '#1e0d2d', color: v.modalidad_venta === 'por_kilo' ? '#60a5fa' : '#c084fc' }}>
                      {v.modalidad_venta === 'por_kilo' ? 'Por kilo' : 'Por cabeza'}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    {v.modalidad_venta === 'por_kilo' ? formatCOP(v.precio_por_kg ?? 0) + '/kg' : formatCOP(v.precio_por_cabeza ?? 0)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="mono tabular" style={{ fontWeight: 700, color: '#4CAF82', fontSize: '0.9rem' }}>{formatCOP(v.valor_total)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Badge label={v.razon_venta} colorMap={RAZON_COLORS} />
                      {v.razon_detalle && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }} title={v.razon_detalle}>{v.razon_detalle.length > 22 ? v.razon_detalle.slice(0, 22) + '…' : v.razon_detalle}</span>}
                    </div>
                  </td>
                  <td><Badge label={v.destino_dinero} colorMap={DESTINO_COLORS} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                      <button className="btn btn-ghost" onClick={() => onEdit(v)} title="Editar" style={{ padding: '6px 8px' }}><Pencil size={15} /></button>
                      <button className="btn btn-danger" onClick={() => setDeleteTarget(v)} title="Eliminar" style={{ padding: '6px 8px' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                <td colSpan={2} style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600, padding: '10px 14px' }}>Subtotal ({filtered.length})</td>
                <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono', fontSize: '0.78rem', color: 'var(--color-text-secondary)', padding: '10px 14px' }}>{subtotalPeso.toLocaleString('es-CO')} kg</td>
                <td colSpan={2} />
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#4CAF82', fontFamily: 'IBM Plex Mono', fontSize: '0.9rem', padding: '10px 14px' }}>{formatCOP(subtotalValor)}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Página {page} de {totalPages} · {filtered.length} registros</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 10px' }}><ChevronLeft size={16} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis');
                acc.push(p); return acc;
              }, [])
              .map((p, i) =>
                p === 'ellipsis' ? <span key={`e${i}`} style={{ padding: '6px 4px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>…</span> : (
                  <button key={p} className="btn" onClick={() => setPage(p as number)}
                    style={{ padding: '6px 10px', minWidth: 34, fontSize: '0.8rem', backgroundColor: page === p ? '#4CAF82' : 'transparent', color: page === p ? '#fff' : 'var(--color-text-secondary)', borderColor: page === p ? '#4CAF82' : 'transparent' }}>
                    {p}
                  </button>
                )
              )}
            <button className="btn btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 10px' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setDeleteTarget(null)}>
          <div className="animate-modal-in" onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>Confirmar eliminación</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              ¿Eliminar la venta de <strong style={{ color: 'var(--color-text-primary)' }}>{deleteTarget.nombre_o_identificador}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancelar</button>
              <button className="btn" onClick={() => { deleteVenta(deleteTarget.id); setDeleteTarget(null); }} style={{ backgroundColor: '#E05C5C', color: '#fff', borderColor: '#E05C5C' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
