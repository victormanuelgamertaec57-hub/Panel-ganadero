import React, { useState } from 'react';
import { AppProvider } from './context';
import { Header } from './components/layout/Header';
import { KPIRow } from './components/dashboard/KPIRow';
import { ChartsRow } from './components/charts/ChartsRow';
import { FinancialSummary } from './components/charts/FinancialSummary';
import { LoteTable } from './components/lotes/LoteTable';
import { LoteForm } from './components/lotes/LoteForm';
import { VentaTable } from './components/ventas/VentaTable';
import { VentaForm } from './components/ventas/VentaForm';
import { Reportes } from './components/layout/Reportes';
import { Configuracion } from './components/layout/Configuracion';
import { ToastContainer } from './components/ui/Toast';
import type { TabId, VentaAnimal, Lote } from './types';
import { useApp } from './context';

const Dashboard: React.FC = () => {
  const { toasts, removeToast } = useApp();

  const [activeTab, setActiveTab]   = useState<TabId>('dashboard');
  const [showVentaForm, setShowVentaForm] = useState(false);
  const [editingVenta, setEditingVenta]   = useState<VentaAnimal | null>(null);
  const [showLoteForm, setShowLoteForm]   = useState(false);
  const [editingLote, setEditingLote]     = useState<Lote | null>(null);

  const handleNewVenta = () => { setEditingVenta(null); setShowVentaForm(true); };
  const handleNewLote  = () => { setEditingLote(null);  setShowLoteForm(true); };
  const handleEditVenta = (v: VentaAnimal) => { setEditingVenta(v); setShowVentaForm(true); };
  const handleEditLote  = (l: Lote) => { setEditingLote(l); setShowLoteForm(true); };

  const closeVentaForm = () => { setShowVentaForm(false); setEditingVenta(null); };
  const closeLoteForm  = () => { setShowLoteForm(false);  setEditingLote(null); };

  const mainPadding: React.CSSProperties = {
    maxWidth: 1400, margin: '0 auto', padding: '28px 24px',
    display: 'flex', flexDirection: 'column', gap: 28,
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewVenta={handleNewVenta}
        onNewLote={handleNewLote}
      />

      <main className="main-content" style={mainPadding}>
        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <>
            <section className="animate-fade-in">
              <KPIRow />
            </section>
            <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
              <ChartsRow />
            </section>
            <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <FinancialSummary />
            </section>
          </>
        )}

        {/* ── LOTES ── */}
        {activeTab === 'lotes' && (
          <section className="animate-fade-in">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Lotes de venta</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Registra y analiza lotes completos con múltiples categorías de animales, gastos y distribución de pagos.
              </p>
            </div>
            <LoteTable onEdit={handleEditLote} />
          </section>
        )}

        {/* ── REGISTROS ── */}
        {activeTab === 'registros' && (
          <section className="animate-fade-in">
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Ventas individuales</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                Historial de ventas de animales individuales con filtros y exportación CSV.
              </p>
            </div>
            <VentaTable onEdit={handleEditVenta} />
          </section>
        )}

        {/* ── REPORTES ── */}
        {activeTab === 'reportes' && (
          <section className="animate-fade-in">
            <Reportes />
          </section>
        )}

        {/* ── CONFIGURACIÓN ── */}
        {activeTab === 'configuracion' && (
          <section className="animate-fade-in">
            <Configuracion />
          </section>
        )}

        <footer style={{ paddingTop: 16, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
            GanApp · Control Ganadero Inteligente · Datos almacenados localmente en este dispositivo
          </p>
        </footer>
      </main>

      {/* Modales */}
      {showVentaForm && (
        <VentaForm editingVenta={editingVenta} onClose={closeVentaForm} />
      )}
      {showLoteForm && (
        <LoteForm editingLote={editingLote} onClose={closeLoteForm} />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <Dashboard />
  </AppProvider>
);

export default App;
