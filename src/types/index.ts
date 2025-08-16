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
  positionSide?: 'LONG' | 'SHORT';
  createdAt?: string;
  updatedAt?: string;
}

export interface ManualPosition {
  id?: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  quantity: number;
  entryPrice: number;
  positionSide?: 'LONG' | 'SHORT';
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

// Position Side helpers
export const getPositionSideIcon = (positionSide?: 'LONG' | 'SHORT'): string => {
  if (positionSide === 'SHORT') return '📉';
  return '📈';
};

export const getPositionSideColor = (positionSide?: 'LONG' | 'SHORT'): 'success' | 'error' | 'info' => {
  if (positionSide === 'SHORT') return 'error';
  if (positionSide === 'LONG') return 'success';
  return 'info';
};

export const getPositionSideLabel = (positionSide?: 'LONG' | 'SHORT'): string => {
  if (positionSide === 'SHORT') return 'SHORT';
  if (positionSide === 'LONG') return 'LONG';
  return 'N/A';
};

// P&L Color helpers that consider position side
export const getPnLColor = (pnl: number, positionSide?: 'LONG' | 'SHORT'): 'success.main' | 'error.main' => {
  if (positionSide === 'SHORT') {
    // For SHORT positions: negative P&L means profit (price went down)
    return pnl <= 0 ? 'success.main' : 'error.main';
  } else {
    // For LONG positions: positive P&L means profit (price went up)
    return pnl >= 0 ? 'success.main' : 'error.main';
  }
};

export const getPnLChipColor = (pnlPercent: number, positionSide?: 'LONG' | 'SHORT'): 'success' | 'error' => {
  if (positionSide === 'SHORT') {
    // For SHORT positions: negative P&L% means profit
    return pnlPercent <= 0 ? 'success' : 'error';
  } else {
    // For LONG positions: positive P&L% means profit
    return pnlPercent >= 0 ? 'success' : 'error';
  }
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

// Position Analysis types
export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: 'bullish' | 'bearish';
    histogram: number;
  };
  bollinger: {
    position: 'upper_band' | 'middle' | 'lower_band';
    percentage: number;
    squeeze: boolean;
  };
  volume: {
    status: 'above_average' | 'below_average' | 'normal';
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
    currentPrice: number;
  };
}

export interface FundamentalData {
  newsSentiment: number; // -1 to 1
  earningsDate?: string;
  earningsProximity?: number; // days until earnings
  sectorPerformance: number;
  analystRating?: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  priceTarget?: number;
  recentAlerts: Alert[];
}

export interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PositionAnalysis {
  symbol: string;
  recommendation: 'STRONG_HOLD' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  score: number;
  lastUpdated: string;
  technical: TechnicalIndicators;
  fundamental: FundamentalData;
  priceHistory: PriceData[]; // Last 30 days
  riskMetrics: {
    volatility: number;
    beta?: number;
    sharpeRatio?: number;
    maxDrawdown: number;
  };
  exitStrategies: {
    stopLoss: {
      price: number;
      distance: number;
      reason: string;
    };
    takeProfit: {
      price: number;
      upside: number;
      confidence: number;
    };
    partialProfit: {
      price: number;
      percentage: number;
      action: string;
    };
  };
}

// Alert System types
export type AlertType = 'price' | 'percentage' | 'technical' | 'news' | 'earnings';
export type AlertCondition = 'above' | 'below' | 'equals' | 'crosses_above' | 'crosses_below';
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'dismissed';

export interface AlertConfig {
  id?: string;
  positionId: string;
  symbol: string;
  type: AlertType;
  condition: AlertCondition;
  value: number;
  message?: string;
  soundEnabled?: boolean;
  emailEnabled?: boolean;
  expiresAt?: string;
  createdAt?: string;
}

export interface Alert {
  id: string;
  config: AlertConfig;
  status: AlertStatus;
  triggeredAt?: string;
  dismissedAt?: string;
  actualValue?: number;
  message: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  positionSymbol: string;
  dismissible: boolean;
}