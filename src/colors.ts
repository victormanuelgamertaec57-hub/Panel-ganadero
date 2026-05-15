// Badge color mappings for animal types, sale reasons, and destinations

export const TIPO_ANIMAL_COLORS: Record<string, { bg: string; text: string }> = {
  Novillo:  { bg: '#1e3a2f', text: '#4ade80' },
  Vaca:     { bg: '#3b1a2a', text: '#f472b6' },
  Ternero:  { bg: '#1e2f3a', text: '#60a5fa' },
  Toro:     { bg: '#2e1a0e', text: '#fb923c' },
  Vaquilla: { bg: '#2a2a1a', text: '#facc15' },
  Otro:     { bg: '#2a2a2a', text: '#a3a3a3' },
};

export const RAZON_COLORS: Record<string, { bg: string; text: string }> = {
  Planificada:  { bg: '#1e3a2f', text: '#4ade80' },
  Liquidez:     { bg: '#1e2f3a', text: '#60a5fa' },
  Sobrepeso:    { bg: '#2a2a1a', text: '#facc15' },
  Remate:       { bg: '#2e1a3a', text: '#c084fc' },
  Enfermedad:   { bg: '#3b1a2a', text: '#f472b6' },
  Emergencia:   { bg: '#3b1a0e', text: '#fb923c' },
  Otro:         { bg: '#2a2a2a', text: '#a3a3a3' },
};

export const DESTINO_COLORS: Record<string, { bg: string; text: string }> = {
  'Gastos finca':      { bg: '#1e2f3a', text: '#60a5fa' },
  'Reinversión ganado': { bg: '#1e3a2f', text: '#4ade80' },
  Deudas:              { bg: '#3b1a0e', text: '#fb923c' },
  'Gastos familia':    { bg: '#3b1a2a', text: '#f472b6' },
  Ahorro:              { bg: '#2a2a1a', text: '#facc15' },
  Otro:                { bg: '#2a2a2a', text: '#a3a3a3' },
};

// Light-mode friendly versions (same hue, lighter backgrounds)
export const TIPO_ANIMAL_COLORS_LIGHT: Record<string, { bg: string; text: string }> = {
  Novillo:  { bg: '#dcfce7', text: '#166534' },
  Vaca:     { bg: '#fce7f3', text: '#9d174d' },
  Ternero:  { bg: '#dbeafe', text: '#1e40af' },
  Toro:     { bg: '#ffedd5', text: '#9a3412' },
  Vaquilla: { bg: '#fef9c3', text: '#854d0e' },
  Otro:     { bg: '#f3f4f6', text: '#374151' },
};

export const RAZON_COLORS_LIGHT: Record<string, { bg: string; text: string }> = {
  Planificada:  { bg: '#dcfce7', text: '#166534' },
  Liquidez:     { bg: '#dbeafe', text: '#1e40af' },
  Sobrepeso:    { bg: '#fef9c3', text: '#854d0e' },
  Remate:       { bg: '#f3e8ff', text: '#6b21a8' },
  Enfermedad:   { bg: '#fce7f3', text: '#9d174d' },
  Emergencia:   { bg: '#ffedd5', text: '#9a3412' },
  Otro:         { bg: '#f3f4f6', text: '#374151' },
};

export const DESTINO_COLORS_LIGHT: Record<string, { bg: string; text: string }> = {
  'Gastos finca':      { bg: '#dbeafe', text: '#1e40af' },
  'Reinversión ganado': { bg: '#dcfce7', text: '#166534' },
  Deudas:              { bg: '#ffedd5', text: '#9a3412' },
  'Gastos familia':    { bg: '#fce7f3', text: '#9d174d' },
  Ahorro:              { bg: '#fef9c3', text: '#854d0e' },
  Otro:                { bg: '#f3f4f6', text: '#374151' },
};

export const CHART_COLORS = [
  '#5a7a4a', '#8b6914', '#3b82f6', '#ec4899', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ef4444', '#10b981', '#f97316',
];
