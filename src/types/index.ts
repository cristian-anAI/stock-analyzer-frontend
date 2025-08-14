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

// Portfolio types
export interface PortfolioData {
  initial_capital: number;
  current_capital: number;
  available_cash: number;
  invested_amount: number;
  total_pnl: number;
  roi_percent: number;
  total_trades: number;
}

export interface PortfolioOverview {
  portfolios: {
    stocks: PortfolioData;
    crypto: PortfolioData;
  };
  summary: {
    total_initial_capital: number;
    total_current_capital: number;
    total_pnl: number;
    total_roi_percent: number;
  };
}

export interface PortfolioPosition {
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  total_invested: number;
  current_price: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
}

export interface PortfolioPositionsResponse {
  portfolio_type: 'stocks' | 'crypto';
  positions: PortfolioPosition[];
  summary: {
    total_positions: number;
    total_invested: number;
    total_current_value: number;
    total_unrealized_pnl: number;
  };
}

export interface Transaction {
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  reason: string;
  score: number;
  timestamp: string;
  source: string;
}

export interface TransactionsResponse {
  portfolio_type: 'stocks' | 'crypto';
  transactions: Transaction[];
  summary: {
    total_transactions: number;
    buy_transactions: number;
    sell_transactions: number;
    total_volume: number;
  };
}

export interface PerformanceMetrics {
  initial_capital: number;
  current_capital: number;
  total_pnl: number;
  roi_percent: number;
  realized_pnl_period: number;
  total_trades: number;
  win_rate: number;
  buy_volume_period: number;
  sell_volume_period: number;
  symbols_traded_period: number;
  avg_trade_size: number;
}

export interface PerformanceResponse {
  portfolio_type: 'stocks' | 'crypto';
  period_days: number;
  metrics: PerformanceMetrics;
  symbols_traded: string[];
}

export interface ComparisonAnalysis {
  stocks: PortfolioData;
  crypto: PortfolioData;
  analysis: {
    better_performer: 'stocks' | 'crypto';
    roi_difference: number;
    total_portfolio_roi: number;
    risk_assessment: string;
  };
}