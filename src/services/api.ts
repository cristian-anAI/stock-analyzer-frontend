import axios from 'axios';
import { 
  Stock, 
  Crypto, 
  Position, 
  ManualPosition, 
  PortfolioOverview, 
  PortfolioPositionsResponse, 
  TransactionsResponse, 
  PerformanceResponse, 
  ComparisonAnalysis,
  PositionAnalysis,
  AlertConfig,
  Alert
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

export default api;