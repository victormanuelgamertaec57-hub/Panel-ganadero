export const formatCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCOPCompact = (value: number): string => {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return formatCOP(value);
};

export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateShort = (isoDate: string): string => {
  const date = new Date(isoDate + 'T12:00:00');
  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
};

export const formatWeight = (kg: number): string =>
  `${kg.toLocaleString('es-CO')} kg`;

export const formatNumber = (n: number): string =>
  n.toLocaleString('es-CO');

export const formatRelativeTime = (isoDate: string): string => {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'hace un momento';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD}d`;
};

export const todayISO = (): string => new Date().toISOString().split('T')[0];

export const subDays = (isoDate: string, days: number): string => {
  const d = new Date(isoDate + 'T12:00:00');
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

export const startOfWeek = (): string => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
};

export const startOfMonth = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

export const startOfYear = (): string => `${new Date().getFullYear()}-01-01`;

export const getMonthKey = (isoDate: string): string => isoDate.substring(0, 7);

export const monthLabel = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
};

export const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
