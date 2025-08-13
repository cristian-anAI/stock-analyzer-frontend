export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  score: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

export interface Crypto {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  score: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface Position {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  source: 'autotrader' | 'manual';
}

export interface ManualPosition {
  id?: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  entryPrice: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ScoreColor = 'error' | 'warning' | 'info' | 'success';

export const getScoreColor = (score: number): ScoreColor => {
  if (score >= 8) return 'success';   // 🟢 Strong Buy (8.0-10.0)
  if (score >= 6) return 'info';      // 🔵 Buy (6.0-7.9)
  if (score >= 4) return 'warning';   // 🟡 Hold (4.0-5.9)
  return 'error';                     // 🔴 Sell (<4.0)
};

export const getScoreLabel = (score: number): string => {
  if (score >= 8) return 'Strong Buy';
  if (score >= 6) return 'Buy';
  if (score >= 4) return 'Hold';
  return 'Sell';
};

export const getScoreDescription = (score: number): string => {
  if (score >= 8) return 'Excelente oportunidad de inversión. Fundamentales muy sólidos.';
  if (score >= 6) return 'Buena oportunidad de compra. Tendencia positiva.';
  if (score >= 4) return 'Mantener posición actual. Observar evolución.';
  return 'Considerar venta. Fundamentales débiles o tendencia negativa.';
};