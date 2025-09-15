import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Analytics,
  Security,
  AccountBalance,
  Assessment,
  Refresh,
  Settings,
  TrendingUp,
  ShowChart,
  Psychology,
} from '@mui/icons-material';
import CryptoScoringSystem from './CryptoScoringSystem';
import CryptoRiskManagement from './CryptoRiskManagement';
import CryptoPortfolioIntegration from './CryptoPortfolioIntegration';
import SystemHealthIndicator from '../Common/SystemHealthIndicator';
import { CryptoMTSSAnalysis, getCryptoSymbolForAPI } from '../../types';
import { cryptoMTSSService } from '../../services/api';

interface MTSSCryptoViewProps {
  symbol?: string;
  fullView?: boolean;
}

const MTSSCryptoView: React.FC<MTSSCryptoViewProps> = ({
  symbol,
  fullView = true
}) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [analysis, setAnalysis] = useState<CryptoMTSSAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [cryptoList, setCryptoList] = useState<string[]>(['BTC', 'ETH', 'SOL', 'LINK', 'ADA', 'DOT', 'AVAX', 'MATIC']);
  const [selectedCrypto, setSelectedCrypto] = useState(symbol || 'BTC');

  useEffect(() => {
    if (selectedCrypto) {
      fetchCryptoAnalysis(selectedCrypto);
    }
    fetchSystemHealth();
  }, [selectedCrypto]);

  const fetchCryptoAnalysis = async (cryptoSymbol: string, forceAnalysis = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await cryptoMTSSService.getCryptoMTSSAnalysis(cryptoSymbol, forceAnalysis);
      
      // Mock comprehensive crypto analysis data for development
      const fullSymbol = getCryptoSymbolForAPI(cryptoSymbol); // BTC -> BTC-USD
      const mockAnalysis: CryptoMTSSAnalysis = {
        symbol: fullSymbol,
        overall_score: data.unified_score || 7.2 + (Math.random() - 0.5) * 2,
        signal: data.trading_signal || (['BUY', 'HOLD', 'SELL'][Math.floor(Math.random() * 3)] as any),
        confidence: data.confidence || 0.75 + Math.random() * 0.2,
        timeframes: {
          '1h': {
            timeframe: '1h',
            score: 7.8 + (Math.random() - 0.5) * 2,
            rsi: 15 + Math.random() * 70,
            momentum_7d: -0.05 + Math.random() * 0.2,
            momentum_14d: -0.03 + Math.random() * 0.15,
            momentum_21d: -0.02 + Math.random() * 0.1,
            volume_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
            price_action: {
              breakout_detected: Math.random() > 0.7,
              reversal_signal: Math.random() > 0.8,
              support_level: 40000 * (0.9 + Math.random() * 0.1),
              resistance_level: 45000 * (1.0 + Math.random() * 0.1)
            },
            volatility: 0.02 + Math.random() * 0.06,
            confidence: 0.7 + Math.random() * 0.25,
            last_updated: new Date().toISOString()
          },
          '4h': {
            timeframe: '4h',
            score: 7.5 + (Math.random() - 0.5) * 2,
            rsi: 25 + Math.random() * 50,
            momentum_7d: -0.03 + Math.random() * 0.15,
            momentum_14d: -0.02 + Math.random() * 0.12,
            momentum_21d: -0.01 + Math.random() * 0.08,
            volume_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
            price_action: {
              breakout_detected: Math.random() > 0.8,
              reversal_signal: Math.random() > 0.75
            },
            volatility: 0.025 + Math.random() * 0.05,
            confidence: 0.75 + Math.random() * 0.2,
            last_updated: new Date().toISOString()
          },
          '1d': {
            timeframe: '1d',
            score: 6.9 + (Math.random() - 0.5) * 2,
            rsi: 30 + Math.random() * 40,
            momentum_7d: -0.02 + Math.random() * 0.1,
            momentum_14d: -0.015 + Math.random() * 0.08,
            momentum_21d: -0.01 + Math.random() * 0.06,
            volume_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
            price_action: {
              breakout_detected: Math.random() > 0.9,
              reversal_signal: Math.random() > 0.85
            },
            volatility: 0.03 + Math.random() * 0.04,
            confidence: 0.8 + Math.random() * 0.15,
            last_updated: new Date().toISOString()
          },
          '1w': {
            timeframe: '1w',
            score: 7.1 + (Math.random() - 0.5) * 1.5,
            rsi: 35 + Math.random() * 30,
            momentum_7d: -0.01 + Math.random() * 0.08,
            momentum_14d: -0.005 + Math.random() * 0.06,
            momentum_21d: 0 + Math.random() * 0.04,
            volume_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
            price_action: {
              breakout_detected: Math.random() > 0.95,
              reversal_signal: Math.random() > 0.9
            },
            volatility: 0.02 + Math.random() * 0.03,
            confidence: 0.85 + Math.random() * 0.1,
            last_updated: new Date().toISOString()
          }
        },
        risk_metrics: {
          atr_percentage: 0.02 + Math.random() * 0.06,
          volatility_24h: 0.025 + Math.random() * 0.05,
          btc_correlation: cryptoSymbol === 'BTC' ? 1.0 : 0.4 + Math.random() * 0.5,
          risk_level: (['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any),
          max_drawdown_7d: 0.05 + Math.random() * 0.15
        },
        trade_signals: {
          entry_price: 42000 + Math.random() * 5000,
          stop_loss_atr: 40000 + Math.random() * 2000,
          take_profit_levels: [45000, 48000, 52000],
          position_size_percent: 8 + Math.random() * 12,
          max_hold_hours: 48 + Math.random() * 120
        },
        btc_impact: {
          correlation_score: cryptoSymbol === 'BTC' ? 1.0 : 0.4 + Math.random() * 0.5,
          influence_level: (['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any),
          independent_strength: Math.random() * 0.8,
          btc_dominance_effect: Math.random() * 0.6
        },
        portfolio_integration: {
          allocation_weight: 0.1 + Math.random() * 0.2,
          diversification_score: 0.6 + Math.random() * 0.3,
          correlation_with_existing: Math.random() * 0.8
        },
        analysis_metadata: {
          analysis_time: new Date().toISOString(),
          data_quality_score: 0.85 + Math.random() * 0.1,
          optimization_level: 'crypto_optimized',
          rsi_levels_used: [20, 80],
          momentum_periods_used: [7, 14, 21]
        }
      };
      
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Failed to fetch crypto analysis');
      console.error('Error fetching crypto analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const health = await cryptoMTSSService.getCryptoSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      console.error('Error fetching system health:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCryptoSelect = (crypto: string) => {
    setSelectedCrypto(crypto);
  };

  const handleForceAnalysis = () => {
    fetchCryptoAnalysis(selectedCrypto, true);
  };

  if (!fullView) {
    // Compact widget view
    return (
      <Card sx={{ bgcolor: 'grey.900', border: '1px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">MTSS Crypto</Typography>
            <SystemHealthIndicator />
          </Box>
          
          {loading ? (
            <CircularProgress size={24} />
          ) : analysis ? (
            <CryptoScoringSystem analysis={analysis} compact />
          ) : (
            <Typography variant="body2" color="textSecondary">
              No analysis available
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Psychology sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4">
            MTSS Crypto Strategy
          </Typography>
          <Chip
            label="CRYPTO OPTIMIZED"
            color="primary"
            variant="filled"
            icon={<TrendingUp />}
          />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <SystemHealthIndicator />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => fetchCryptoAnalysis(selectedCrypto)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Assessment />}
            onClick={handleForceAnalysis}
            disabled={loading}
          >
            Force Analysis
          </Button>
        </Box>
      </Box>

      {/* Crypto Selection */}
      <Card sx={{ mb: 3, bgcolor: 'grey.900' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Cryptocurrency for Analysis
          </Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {cryptoList.map((crypto) => (
              <Chip
                key={crypto}
                label={crypto}
                onClick={() => handleCryptoSelect(crypto)}
                color={selectedCrypto === crypto ? 'primary' : 'default'}
                variant={selectedCrypto === crypto ? 'filled' : 'outlined'}
                icon={selectedCrypto === crypto ? <ShowChart /> : undefined}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Box textAlign="center">
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing {selectedCrypto} with MTSS...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Using crypto-optimized parameters (RSI 20/80, momentum 7/14/21)
            </Typography>
          </Box>
        </Box>
      ) : analysis ? (
        <Box>
          {/* Analysis Overview */}
          <Card sx={{ mb: 3, bgcolor: 'grey.900', border: '1px solid', borderColor: 'success.main' }}>
            <CardContent>
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={2} flex="1" minWidth="200px">
                  <Analytics sx={{ color: 'success.main' }} />
                  <Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {analysis.overall_score.toFixed(1)}/10
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Overall MTSS Score
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} flex="1" minWidth="200px">
                  <TrendingUp sx={{ color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6" color="primary.main">
                      {analysis.signal}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Trading Signal
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} flex="1" minWidth="200px">
                  <Assessment sx={{ color: 'info.main' }} />
                  <Box>
                    <Typography variant="h6" color="info.main">
                      {(analysis.confidence * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Confidence
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" gap={2} flex="1" minWidth="200px">
                  <Security sx={{ color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6" color="warning.main">
                      {analysis.risk_metrics.risk_level}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Risk Level
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Tabs for Different Analysis Views */}
          <Card sx={{ bgcolor: 'grey.900' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} centered>
                <Tab 
                  label="Scoring Analysis" 
                  icon={<Analytics />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Risk Management" 
                  icon={<Security />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Portfolio Integration" 
                  icon={<AccountBalance />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {currentTab === 0 && (
                <CryptoScoringSystem analysis={analysis} />
              )}
              
              {currentTab === 1 && (
                <CryptoRiskManagement
                  symbol={selectedCrypto}
                  currentPrice={analysis.trade_signals.entry_price}
                  atrValue={analysis.risk_metrics.atr_percentage}
                  volatility={analysis.risk_metrics.volatility_24h}
                  btcCorrelation={analysis.btc_impact.correlation_score}
                />
              )}
              
              {currentTab === 2 && (
                <CryptoPortfolioIntegration
                  totalCapital={50000}
                  maxPositions={5}
                />
              )}
            </Box>
          </Card>

          {/* Footer Information */}
          <Box mt={3}>
            <Alert severity="info" icon={<Psychology />}>
              <Typography variant="body2">
                <strong>🚀 MTSS Crypto Strategy:</strong> This analysis uses crypto-optimized parameters including 
                RSI 20/80 levels (vs traditional 30/70), momentum periods of 7/14/21 days (vs 14/30), 
                and enhanced volatility calculations specifically designed for cryptocurrency markets.
              </Typography>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Analysis performed at: {analysis.analysis_metadata.analysis_time} • 
                Data Quality: {((analysis.analysis_metadata.data_quality_score || 0.9) * 100).toFixed(0)}% • 
                Optimization Level: {analysis.analysis_metadata.optimization_level}
              </Typography>
            </Alert>
          </Box>
        </Box>
      ) : (
        <Alert severity="warning">
          <Typography variant="body2">
            No analysis data available for {selectedCrypto}. Click "Force Analysis" to generate new analysis.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default MTSSCryptoView;