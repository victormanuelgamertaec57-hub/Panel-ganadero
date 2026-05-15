import React from 'react';

interface BadgeProps {
  label: string;
  colorMap: Record<string, { bg: string; text: string }>;
  fallback?: { bg: string; text: string };
}

export const Badge: React.FC<BadgeProps> = ({ label, colorMap, fallback }) => {
  const colors = colorMap[label] ?? fallback ?? { bg: '#1a1d2e', text: '#8B92B8' };
  return (
    <span className="badge" style={{ backgroundColor: colors.bg, color: colors.text }}>
      {label}
    </span>
  );
};
