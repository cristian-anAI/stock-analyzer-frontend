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
  if (score >= 8) return 'success';   // Strong Buy (8.0-10.0)
  if (score >= 6) return 'info';      // Buy (6.0-7.9)
  if (score >= 4) return 'warning';   // Hold (4.0-5.9)
  return 'error';                     // Sell (<4.0)
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
  if (positionSide === 'SHORT') return '↓';
  return '↑';
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
  action: 'buy' | 'sell' | 'short' | 'cover';
  quantity: number;
  price: number;
  total_amount: number;
  fees: number;
  reason: string;
  score: number;
  timestamp: string;
  source: string;
  // P&L fields for closed positions
  realized_pnl?: number;
  entry_price?: number;
  exit_price?: number;
  position_id?: string;
  hold_duration_hours?: number;
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

// Crypto-specific MTSS Multi-Timeframe Analysis Types
export type CryptoTimeframe = '1h' | '4h' | '1d' | '1w';

export interface CryptoTimeframeData {
  timeframe: CryptoTimeframe;
  score: number;
  rsi: number;
  momentum_7d: number;
  momentum_14d: number;
  momentum_21d: number;
  volume_trend: 'increasing' | 'decreasing' | 'stable';
  price_action: {
    breakout_detected: boolean;
    reversal_signal: boolean;
    support_level?: number;
    resistance_level?: number;
  };
  volatility: number;
  confidence: number;
  last_updated: string;
}

export interface CryptoMTSSAnalysis {
  symbol: string;
  overall_score: number;
  signal: 'BUY' | 'SELL' | 'HOLD' | 'WAIT';
  confidence: number;
  timeframes: Record<CryptoTimeframe, CryptoTimeframeData>;
  risk_metrics: {
    atr_percentage: number;
    volatility_24h: number;
    btc_correlation: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    max_drawdown_7d: number;
  };
  trade_signals: {
    entry_price?: number;
    stop_loss_atr?: number; // ATR-based dynamic stop loss
    take_profit_levels: number[];
    position_size_percent: number;
    max_hold_hours: number;
  };
  btc_impact: {
    correlation_score: number;
    influence_level: 'LOW' | 'MEDIUM' | 'HIGH';
    independent_strength: number; // How well it moves independently of BTC
    btc_dominance_effect: number; // Impact of BTC dominance changes
  };
  portfolio_integration: {
    allocation_weight: number; // Suggested allocation within crypto portfolio
    diversification_score: number; // How much it diversifies the portfolio
    correlation_with_existing: number; // Correlation with current positions
  };
  analysis_metadata: {
    analysis_time: string;
    data_quality_score: number;
    optimization_level: 'basic' | 'crypto_optimized' | 'advanced';
    rsi_levels_used: [number, number]; // [oversold, overbought]
    momentum_periods_used: number[];
  };
}

export interface CryptoRiskManagement {
  symbol: string;
  position_sizing: {
    kelly_criterion: number;
    volatility_adjusted: number;
    correlation_adjusted: number;
    recommended_size: number;
  };
  stop_loss: {
    atr_based: number; // Dynamic ATR-based stop
    support_based?: number; // Support level-based stop
    trailing_stop: {
      enabled: boolean;
      trail_amount_percent: number;
      activation_price?: number;
    };
  };
  take_profit: {
    levels: Array<{
      price: number;
      percentage_to_close: number;
      confidence: number;
    }>;
    trailing_profit: {
      enabled: boolean;
      trail_amount_percent: number;
      lock_profit_at_percent: number;
    };
  };
  risk_assessment: {
    volatility_risk: number;
    liquidity_risk: number;
    correlation_risk: number;
    overall_risk_score: number;
    max_position_size: number;
  };
}

export interface CryptoPortfolioConfig {
  total_capital: number; // $50,000 for crypto
  max_positions: number; // Maximum 5 crypto positions
  max_single_position_percent: number; // Max % per position
  rebalance_threshold: number; // When to trigger rebalance
  correlation_threshold: number; // Max correlation between positions
  btc_hedge_requirement: boolean; // Whether to maintain BTC exposure
  risk_budget: {
    conservative: number; // % allocation
    moderate: number; // % allocation  
    aggressive: number; // % allocation
  };
}

// Asset Type Detection Utilities
export const detectAssetType = (symbol: string): 'stock' | 'crypto' => {
  if (!symbol) return 'stock';
  
  const upperSymbol = symbol.toUpperCase();
  
  // Crypto patterns
  const cryptoPatterns = [
    /.*-USD$/,           // BTC-USD, ETH-USD, SOL-USD
    /.*-USDT$/,          // BTC-USDT, ETH-USDT
    /.*-USDC$/,          // BTC-USDC, ETH-USDC
    /.*USD$/,            // BTCUSD, ETHUSD (without dash)
    /^(BTC|ETH|SOL|ADA|DOT|LINK|AVAX|MATIC|UNI|AAVE|COMP|SUSHI|YFI|SNX|MKR|CRV|BAL|REN|KNC|ZRX|REP)$/
  ];
  
  // Check if symbol matches any crypto pattern
  const isCrypto = cryptoPatterns.some(pattern => pattern.test(upperSymbol));
  
  // Stock patterns (typically 1-5 uppercase letters without special characters)
  const stockPattern = /^[A-Z]{1,5}$/;
  const isStock = stockPattern.test(upperSymbol);
  
  // Default logic:
  // 1. If matches crypto patterns -> crypto
  // 2. If matches stock pattern and no crypto indicators -> stock
  // 3. If has dash or special chars -> likely crypto
  // 4. Default to stock for ambiguous cases
  
  if (isCrypto) return 'crypto';
  if (isStock) return 'stock';
  if (upperSymbol.includes('-') || upperSymbol.includes('/')) return 'crypto';
  
  return 'stock'; // Default fallback
};

export const getAssetTypeLabel = (assetType: 'stock' | 'crypto'): string => {
  return assetType === 'crypto' ? 'Cryptocurrency' : 'Stock';
};

export const isKnownCryptoSymbol = (symbol: string): boolean => {
  const knownCryptos = [
    'BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK', 'AVAX', 'MATIC', 'UNI', 'AAVE',
    'COMP', 'SUSHI', 'YFI', 'SNX', 'MKR', 'CRV', 'BAL', 'REN', 'KNC', 'ZRX',
    'REP', 'LTC', 'BCH', 'XRP', 'DOGE', 'SHIB', 'PEPE', 'ATOM', 'NEAR', 'FTM'
  ];
  
  const baseSymbol = symbol.replace(/-USD.*$/, '').replace(/USD$/, '').toUpperCase();
  return knownCryptos.includes(baseSymbol);
};

// Crypto symbol mapping for API calls
export const getCryptoSymbolForAPI = (symbol: string): string => {
  const cryptoMap: Record<string, string> = {
    'BTC': 'BTC-USD',
    'ETH': 'ETH-USD',
    'ADA': 'ADA-USD', 
    'SOL': 'SOL-USD',
    'DOT': 'DOT-USD',
    'MATIC': 'MATIC-USD',
    'AVAX': 'AVAX-USD',
    'LINK': 'LINK-USD',
    'UNI': 'UNI-USD',
    'LTC': 'LTC-USD',
    'AAVE': 'AAVE-USD',
    'COMP': 'COMP-USD',
    'SUSHI': 'SUSHI-USD',
    'YFI': 'YFI-USD',
    'SNX': 'SNX-USD',
    'MKR': 'MKR-USD',
    'CRV': 'CRV-USD',
    'BAL': 'BAL-USD',
    'REN': 'REN-USD',
    'KNC': 'KNC-USD',
    'ZRX': 'ZRX-USD',
    'REP': 'REP-USD'
  };

  // If already has -USD suffix, return as is
  if (symbol.includes('-USD') || symbol.includes('-USDT') || symbol.includes('-BTC')) {
    return symbol;
  }

  // Map short symbol to full symbol
  return cryptoMap[symbol.toUpperCase()] || symbol;
};

// Color mapping based on new backend color system
export type CryptoOverviewColor = 'green' | 'lightgreen' | 'yellow' | 'orange' | 'red' | 'gray';

export const getCryptoColorHex = (color: CryptoOverviewColor): string => {
  const colorMap: Record<CryptoOverviewColor, string> = {
    'green': '#22c55e',      // Strong Buy (7.0+)
    'lightgreen': '#84cc16', // Buy (6.0-6.9)
    'yellow': '#eab308',     // Hold (4.0-5.9)
    'orange': '#f97316',     // Weak (2.0-3.9)
    'red': '#ef4444',        // Sell/Avoid (<2.0)
    'gray': '#6b7280'        // Error/No Data
  };
  
  return colorMap[color] || colorMap.gray;
};

export const getCryptoActionLabel = (action: string): string => {
  const actionMap: Record<string, string> = {
    'buy': 'BUY',
    'hold': 'HOLD',
    'sell': 'SELL',
    'wait': 'WAIT'
  };
  
  return actionMap[action?.toLowerCase()] || action?.toUpperCase() || 'N/A';
};

export const getCryptoActionColor = (action: string): 'success' | 'warning' | 'error' | 'info' => {
  switch (action?.toLowerCase()) {
    case 'buy':
      return 'success';
    case 'hold':
      return 'warning';
    case 'sell':
      return 'error';
    case 'wait':
      return 'info';
    default:
      return 'info';
  }
};

// Interface for crypto overview response
export interface CryptoOverviewItem {
  symbol: string;
  score: number;
  color: CryptoOverviewColor;
  action: string;
  price: number;
  change_percent: number;
}

export interface CryptoOverviewResponse {
  status: string;
  overview: Record<string, CryptoOverviewItem>;
  last_updated: string;
}