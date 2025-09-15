import axios from 'axios';
import { 
  Stock, 
  Crypto, 
  Position, 
  ManualPosition, 
  Transaction,
  PortfolioOverview, 
  PortfolioPositionsResponse, 
  TransactionsResponse, 
  PerformanceResponse, 
  ComparisonAnalysis,
  PositionAnalysis,
  AlertConfig,
  Alert,
  detectAssetType,
  CryptoOverviewResponse,
  getCryptoSymbolForAPI
} from '../types';
import { cacheService, CACHE_KEYS } from './cache';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Helper function for cached API requests
async function cachedRequest<T>(
  cacheKey: string,
  apiCall: () => Promise<T>,
  customTTL?: number
): Promise<T> {
  // Check cache first
  const cached = cacheService.get<T>(cacheKey);
  if (cached) {
    console.log(`Cache HIT for ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS for ${cacheKey} - fetching from API`);
  
  try {
    // Make API call
    const result = await apiCall();
    
    // Cache the result
    cacheService.set(cacheKey, result, customTTL);
    
    return result;
  } catch (error) {
    // If API fails, check if we have stale cache data as fallback
    const staleData = cacheService.get<T>(cacheKey + ':stale');
    if (staleData) {
      console.warn(`API failed, using stale cache for ${cacheKey}`);
      return staleData;
    }
    
    throw error;
  }
}

// Data mapping functions to convert snake_case to camelCase
const mapStockData = (data: any): Stock => ({
  id: data.id,
  symbol: data.symbol,
  name: data.name,
  currentPrice: data.currentPrice || data.current_price,
  score: data.score,
  change: data.change,
  changePercent: data.changePercent || data.change_percent,
  volume: data.volume,
  marketCap: data.marketCap || data.market_cap,
  sector: data.sector,
});

const mapCryptoData = (data: any): Crypto => ({
  id: data.id,
  symbol: data.symbol,
  name: data.name,
  currentPrice: data.currentPrice || data.current_price,
  score: data.score,
  change: data.change,
  changePercent: data.changePercent || data.change_percent,
  volume: data.volume,
  marketCap: data.marketCap || data.market_cap,
});

const mapPositionData = (data: any): Position => ({
  id: data.id,
  symbol: data.symbol,
  name: data.name,
  type: data.type,
  quantity: data.quantity,
  entryPrice: data.entry_price || data.entryPrice,
  currentPrice: data.current_price || data.currentPrice,
  value: data.value,
  pnl: data.pnl,
  pnlPercent: data.pnl_percent || data.pnlPercent,
  source: data.source,
  positionSide: data.position_side || data.positionSide,
  createdAt: data.created_at || data.createdAt,
  updatedAt: data.updated_at || data.updatedAt,
});

const mapTransactionData = (data: any): Transaction => ({
  symbol: data.symbol,
  action: data.action,
  quantity: data.quantity,
  price: data.price,
  total_amount: data.total_amount,
  fees: data.fees || 0,
  reason: data.reason || '',
  score: data.score || 0,
  timestamp: data.timestamp,
  source: data.source || '',
  // P&L fields
  realized_pnl: data.realized_pnl,
  entry_price: data.entry_price,
  exit_price: data.exit_price,
  position_id: data.position_id,
  hold_duration_hours: data.hold_duration_hours,
});

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 segundos para datos que pueden tardar en procesar
});

// API error handler
const handleApiError = (error: any) => {
  if (error.response) {
    console.error('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    console.error('Network Error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);

export const stockService = {
  getAllStocks: async (): Promise<Stock[]> => {
    return cachedRequest(
      CACHE_KEYS.STOCKS_ALL,
      async () => {
        const response = await api.get('/stocks');
        return response.data.map(mapStockData);
      }
    );
  },

  getStocksByScore: async (): Promise<Stock[]> => {
    return cachedRequest(
      CACHE_KEYS.STOCKS_BY_SCORE,
      async () => {
        const response = await api.get('/stocks?sort=score');
        return response.data.map(mapStockData);
      }
    );
  },

  getStock: async (symbol: string): Promise<Stock> => {
    return cachedRequest(
      CACHE_KEYS.STOCK_DETAIL(symbol),
      async () => {
        const response = await api.get(`/stocks/${symbol}`);
        return mapStockData(response.data);
      }
    );
  },

  refreshStocks: async (): Promise<void> => {
    // Invalidate cache when refreshing
    cacheService.invalidatePattern('stocks:');
    await api.post('/stocks/refresh');
  },
};

export const cryptoService = {
  getAllCryptos: async (): Promise<Crypto[]> => {
    return cachedRequest(
      CACHE_KEYS.CRYPTOS_ALL,
      async () => {
        const response = await api.get('/cryptos');
        return response.data.map(mapCryptoData);
      }
    );
  },

  getCryptosByScore: async (): Promise<Crypto[]> => {
    return cachedRequest(
      CACHE_KEYS.CRYPTOS_BY_SCORE,
      async () => {
        const response = await api.get('/cryptos?sort=score');
        return response.data.map(mapCryptoData);
      }
    );
  },

  getCrypto: async (symbol: string): Promise<Crypto> => {
    return cachedRequest(
      CACHE_KEYS.CRYPTO_DETAIL(symbol),
      async () => {
        const response = await api.get(`/cryptos/${symbol}`);
        return mapCryptoData(response.data);
      }
    );
  },

  refreshCryptos: async (): Promise<void> => {
    // Invalidate cache when refreshing
    cacheService.invalidatePattern('cryptos:');
    await api.post('/cryptos/refresh');
  },
};

export const positionService = {
  getAutotraderPositions: async (type?: 'stock' | 'crypto'): Promise<Position[]> => {
    const cacheKey = type ? `${CACHE_KEYS.POSITIONS_AUTOTRADER}:${type}` : CACHE_KEYS.POSITIONS_AUTOTRADER;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const url = type ? `/positions/autotrader?type=${type}` : '/positions/autotrader';
        const response = await api.get(url);
        return response.data.map(mapPositionData);
      }
    );
  },

  getManualPositions: async (): Promise<Position[]> => {
    return cachedRequest(
      CACHE_KEYS.POSITIONS_MANUAL,
      async () => {
        const response = await api.get('/positions/manual');
        return response.data.map(mapPositionData);
      }
    );
  },

  createManualPosition: async (position: ManualPosition): Promise<Position> => {
    // Invalidate cache when creating
    cacheService.invalidate(CACHE_KEYS.POSITIONS_MANUAL);
    
    const response = await api.post('/positions/manual', position);
    return mapPositionData(response.data);
  },

  updateManualPosition: async (id: string, position: ManualPosition): Promise<Position> => {
    // Invalidate cache when updating
    cacheService.invalidate(CACHE_KEYS.POSITIONS_MANUAL);
    
    const response = await api.put(`/positions/manual/${id}`, position);
    return mapPositionData(response.data);
  },

  deleteManualPosition: async (id: string): Promise<void> => {
    // Invalidate cache when deleting
    cacheService.invalidate(CACHE_KEYS.POSITIONS_MANUAL);
    
    await api.delete(`/positions/manual/${id}`);
  },

  refreshPositions: async (): Promise<void> => {
    // Invalidate cache when refreshing
    cacheService.invalidatePattern('positions:');
    await api.post('/positions/refresh');
  },

  // Real technical analysis endpoint
  getManualPositionAnalysis: async (symbol: string): Promise<any> => {
    return cachedRequest(
      `position:manual:analysis:${symbol}`,
      async () => {
        const response = await api.get(`/positions/manual/${symbol}/analysis`);
        return response.data;
      },
      120000 // 2 minutes cache for real-time data
    );
  },

  // Mock fundamental data endpoint (to be improved)
  getPositionAnalysis: async (symbol: string): Promise<PositionAnalysis> => {
    return cachedRequest(
      `position:analysis:${symbol}`,
      async () => {
        const response = await api.get(`/positions/analysis/${symbol}`);
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },
};

interface AutotraderSummary {
  cycle_start: string;
  actions_taken: number;
  buy_signals: number;
  sell_signals: number;
  total_value: number;
  total_pnl: number;
  success_rate: number;
}

interface AutotraderRunResult {
  success: boolean;
  summary: AutotraderSummary;
  message?: string;
}

export const autotraderService = {
  runAutotrader: async (): Promise<AutotraderRunResult> => {
    // Invalidate relevant caches when running autotrader
    cacheService.invalidatePattern('positions:');
    cacheService.invalidate(CACHE_KEYS.AUTOTRADER_SUMMARY);
    cacheService.invalidatePattern('autotrader:transactions');
    
    const response = await api.post('/autotrader/run');
    return response.data;
  },

  getAutotraderSummary: async (): Promise<AutotraderSummary> => {
    return cachedRequest(
      CACHE_KEYS.AUTOTRADER_SUMMARY,
      async () => {
        const response = await api.get('/autotrader/summary');
        return response.data;
      }
    );
  },

  getAutotraderTransactions: async (limit?: number, symbol?: string): Promise<TransactionsResponse & { summary: { total_realized_pnl: number; win_rate: number; average_hold_hours: number } }> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (symbol) params.append('symbol', symbol);
    
    const cacheKey = `autotrader:transactions:${limit || 'all'}:${symbol || 'all'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/autotrader/transactions?${params.toString()}`);
        return {
          ...response.data,
          transactions: response.data.transactions.map(mapTransactionData)
        };
      },
      300000 // 5 minutes cache
    );
  },
};

// Health check service (separate from main API as it's not under /api/v1)
export const healthService = {
  healthCheck: async (): Promise<{ status: string; service?: string }> => {
    // Health endpoint is at root level, not under /api/v1
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },
};

export const portfolioService = {
  getOverview: async (): Promise<PortfolioOverview> => {
    return cachedRequest(
      'portfolio:overview',
      async () => {
        const response = await api.get('/portfolio/overview');
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },

  getStockPositions: async (): Promise<PortfolioPositionsResponse> => {
    return cachedRequest(
      'portfolio:stocks:positions',
      async () => {
        const response = await api.get('/portfolio/stocks/positions');
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },

  getCryptoPositions: async (): Promise<PortfolioPositionsResponse> => {
    return cachedRequest(
      'portfolio:crypto:positions',
      async () => {
        const response = await api.get('/portfolio/crypto/positions');
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },

  getStockTransactions: async (limit?: number, symbol?: string): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (symbol) params.append('symbol', symbol);
    
    const cacheKey = `portfolio:stocks:transactions:${limit || 'all'}:${symbol || 'all'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/portfolio/stocks/transactions?${params.toString()}`);
        return response.data;
      },
      600000 // 10 minutes cache
    );
  },

  getCryptoTransactions: async (limit?: number, symbol?: string): Promise<TransactionsResponse> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (symbol) params.append('symbol', symbol);
    
    const cacheKey = `portfolio:crypto:transactions:${limit || 'all'}:${symbol || 'all'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/portfolio/crypto/transactions?${params.toString()}`);
        return response.data;
      },
      600000 // 10 minutes cache
    );
  },

  getStockPerformance: async (days?: number): Promise<PerformanceResponse> => {
    const params = days ? `?days=${days}` : '';
    const cacheKey = `portfolio:stocks:performance:${days || 'default'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/portfolio/stocks/performance${params}`);
        return response.data;
      },
      600000 // 10 minutes cache
    );
  },

  getCryptoPerformance: async (days?: number): Promise<PerformanceResponse> => {
    const params = days ? `?days=${days}` : '';
    const cacheKey = `portfolio:crypto:performance:${days || 'default'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/portfolio/crypto/performance${params}`);
        return response.data;
      },
      600000 // 10 minutes cache
    );
  },

  getComparison: async (): Promise<ComparisonAnalysis> => {
    return cachedRequest(
      'portfolio:analytics:comparison',
      async () => {
        const response = await api.get('/portfolio/analytics/comparison');
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },

  refreshPortfolio: async (): Promise<void> => {
    // Invalidate all portfolio cache when refreshing
    cacheService.invalidatePattern('portfolio:');
    await api.post('/portfolio/refresh');
  },
};

export const alertService = {
  getAlerts: async (positionId?: string): Promise<Alert[]> => {
    const params = positionId ? `?positionId=${positionId}` : '';
    const cacheKey = `alerts:${positionId || 'all'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/alerts${params}`);
        return response.data;
      },
      60000 // 1 minute cache for alerts
    );
  },

  createAlert: async (config: AlertConfig): Promise<Alert> => {
    // Invalidate alerts cache when creating
    cacheService.invalidatePattern('alerts:');
    
    const response = await api.post('/alerts', config);
    return response.data;
  },

  updateAlert: async (id: string, config: Partial<AlertConfig>): Promise<Alert> => {
    // Invalidate alerts cache when updating
    cacheService.invalidatePattern('alerts:');
    
    const response = await api.put(`/alerts/${id}`, config);
    return response.data;
  },

  deleteAlert: async (id: string): Promise<void> => {
    // Invalidate alerts cache when deleting
    cacheService.invalidatePattern('alerts:');
    
    await api.delete(`/alerts/${id}`);
  },

  dismissAlert: async (id: string): Promise<void> => {
    // Invalidate alerts cache when dismissing
    cacheService.invalidatePattern('alerts:');
    
    await api.patch(`/alerts/${id}/dismiss`);
  },

  checkAlerts: async (): Promise<Alert[]> => {
    // Don't cache this as it's for real-time checking
    const response = await api.get('/alerts/check');
    return response.data;
  },
};

// Crypto Overview Service - New optimized endpoints
export const cryptoOverviewService = {
  getCryptoOverview: async (): Promise<CryptoOverviewResponse> => {
    const cacheKey = 'crypto:overview:all';
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get('/unified-scoring/crypto-overview');
        return response.data;
      },
      300000 // 5 minutes cache to match backend cache
    );
  },

  getAnalyzeAllCryptos: async (): Promise<any> => {
    const cacheKey = 'crypto:analyze:all';
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get('/unified-scoring/analyze-all-cryptos');
        return response.data;
      },
      300000 // 5 minutes cache
    );
  },

  // Smart refresh - only refresh if cache is older than 5 minutes
  smartRefreshCryptoOverview: async (): Promise<CryptoOverviewResponse | null> => {
    const lastUpdate = localStorage.getItem('crypto_overview_last_update');
    const now = Date.now();
    const fiveMinutes = 300000; // 5 minutes in milliseconds

    if (!lastUpdate || (now - parseInt(lastUpdate)) > fiveMinutes) {
      try {
        const data = await cryptoOverviewService.getCryptoOverview();
        localStorage.setItem('crypto_overview_last_update', now.toString());
        return data;
      } catch (error: any) {
        // If new endpoints are not available, don't throw error
        if (error.response?.status === 404) {
          console.warn('Crypto overview endpoint not available yet');
          return null;
        }
        throw error; // Re-throw other errors
      }
    }

    return null; // No refresh needed
  },
};

// Crypto-specific MTSS Multi-Timeframe Analysis Service
export const cryptoMTSSService = {
  getCryptoMTSSAnalysis: async (symbol: string, forceAnalysis = false): Promise<any> => {
    const fullSymbol = getCryptoSymbolForAPI(symbol); // BTC -> BTC-USD
    const assetType = detectAssetType(fullSymbol);
    const params = forceAnalysis ? '?force_analysis=true' : '';
    const separator = params ? '&' : '?';
    const cacheKey = `crypto:mtss:${fullSymbol}:${forceAnalysis ? 'forced' : 'cached'}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/unified-scoring/analyze/${fullSymbol}${params}${separator}asset_type=${assetType}`);
        return response.data;
      },
      forceAnalysis ? 60000 : 300000 // 1 minute if forced, 5 minutes if cached
    );
  },

  getCryptoTimeframeAnalysis: async (symbol: string, timeframes: string[] = ['1h', '4h', '1d', '1w']): Promise<any> => {
    const timeframeParams = timeframes.join(',');
    const cacheKey = `crypto:timeframes:${symbol}:${timeframeParams}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/crypto/mtss/timeframes/${symbol}?timeframes=${timeframeParams}`);
        return response.data;
      },
      120000 // 2 minutes cache for timeframe data
    );
  },

  getCryptoRiskMetrics: async (symbol: string): Promise<any> => {
    const cacheKey = `crypto:risk:${symbol}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/crypto/risk/${symbol}`);
        return response.data;
      },
      300000 // 5 minutes cache for risk metrics
    );
  },

  getCryptoBTCCorrelation: async (symbol: string, period = '7d'): Promise<any> => {
    const cacheKey = `crypto:btc-correlation:${symbol}:${period}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/crypto/btc-correlation/${symbol}?period=${period}`);
        return response.data;
      },
      600000 // 10 minutes cache for correlation data
    );
  },

  getCryptoPortfolioOptimization: async (capital = 50000, maxPositions = 5): Promise<any> => {
    const cacheKey = `crypto:portfolio:optimization:${capital}:${maxPositions}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.get(`/crypto/portfolio/optimize?capital=${capital}&max_positions=${maxPositions}`);
        return response.data;
      },
      1800000 // 30 minutes cache for portfolio optimization
    );
  },

  runCryptoRebalance: async (): Promise<any> => {
    // Clear cache when rebalancing
    cacheService.invalidatePattern('crypto:portfolio:');
    cacheService.invalidatePattern('portfolio:crypto:');
    
    const response = await api.post('/crypto/portfolio/rebalance');
    return response.data;
  },

  getCryptoSystemHealth: async (): Promise<any> => {
    // Don't cache system health - always fresh
    const response = await api.get('/crypto/system/health');
    return response.data;
  },

  // Batch analysis for multiple cryptos
  getCryptoMTSSBatch: async (symbols: string[], cryptoOptimized = true): Promise<any> => {
    const symbolsParam = symbols.join(',');
    const cacheKey = `crypto:mtss:batch:${symbolsParam}:${cryptoOptimized}`;
    
    return cachedRequest(
      cacheKey,
      async () => {
        const response = await api.post('/crypto/mtss/batch', {
          symbols,
          crypto_optimized: cryptoOptimized,
          rsi_levels: [20, 80], // Crypto-optimized RSI levels
          momentum_periods: [7, 14, 21], // Shorter momentum periods for crypto
          timeframes: ['1h', '4h', '1d', '1w']
        });
        return response.data;
      },
      300000 // 5 minutes cache for batch analysis
    );
  }
};

export default api;