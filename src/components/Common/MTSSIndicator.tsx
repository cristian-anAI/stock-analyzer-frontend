import React from 'react';
import { 
  Box, 
  Tooltip,
  Chip,
  Typography,
  Badge
} from '@mui/material';
import { 
  Circle as CircleIcon, 
  Remove as RemoveIcon,
  TrendingUp,
  TrendingDown,
  Timeline,
  Speed,
  Analytics
} from '@mui/icons-material';

interface MTSSData {
  unified_score?: number;
  trading_signal?: string;
  timeframe_scores?: {
    '1M'?: number;  // Monthly
    '1W'?: number;  // Weekly  
    '1d'?: number;  // Daily
    '1h'?: number;  // Hourly
  };
  analysis_performed?: boolean;
  confidence?: number;
}

// Enhanced crypto-specific MTSS data interface
interface CryptoMTSSData extends MTSSData {
  crypto_optimized?: boolean;
  risk_metrics?: {
    atr_percentage: number;
    volatility_24h: number;
    btc_correlation: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  };
  crypto_indicators?: {
    rsi_crypto_levels: boolean; // Using 20/80 instead of 30/70
    momentum_periods: number[]; // 7, 14, 21 days
    breakout_detected: boolean;
    reversal_signals: number;
  };
}

interface MTSSIndicatorProps {
  symbol: string;
  mtssData?: MTSSData | CryptoMTSSData | null;
  assetType?: 'stock' | 'crypto';
  compact?: boolean;
  showRisk?: boolean;
  onClick?: () => void;
}

const MTSSIndicator: React.FC<MTSSIndicatorProps> = ({ 
  symbol, 
  mtssData, 
  assetType = 'stock', 
  compact = false, 
  showRisk = false,
  onClick 
}) => {
  const isCrypto = assetType === 'crypto';
  const cryptoData = isCrypto && mtssData ? mtssData as CryptoMTSSData : null;

  const getSignalColor = (signal: string | undefined) => {
    if (!signal) return 'default';
    switch (signal.toUpperCase()) {
      case 'BUY': return 'success';
      case 'SELL': return 'error';
      case 'HOLD': return 'warning';
      case 'WAIT': return 'info';
      default: return 'default';
    }
  };

  const getSignalIcon = (signal: string | undefined) => {
    if (!signal) return <Analytics />;
    switch (signal.toUpperCase()) {
      case 'BUY': return <TrendingUp />;
      case 'SELL': return <TrendingDown />;
      case 'HOLD': return <Timeline />;
      case 'WAIT': return <Speed />;
      default: return <Analytics />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'EXTREME': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getScoreColor = (score: number | undefined) => {
    if (!score) return 'grey.400';
    if (isCrypto) {
      // Crypto-optimized scoring with higher volatility consideration
      if (score >= 8.5) return 'success.main';
      if (score >= 7.0) return 'success.light';
      if (score >= 6.0) return 'warning.main';
      if (score >= 4.5) return 'warning.light';
      return 'error.main';
    } else {
      // Original stock scoring
      if (score >= 8.0) return 'success.main';
      if (score >= 6.5) return 'success.light';
      if (score >= 5.0) return 'warning.main';
      return 'error.main';
    }
  };

  // Use the enhanced crypto-aware scoring for timeframes too
  const getTimeframeColor = getScoreColor;

  const getTimeframeTooltip = (timeframe: string, score: number | undefined) => {
    const labels: Record<string, string> = isCrypto ? {
      '1M': 'Mensual (Crypto)',
      '1W': 'Semanal (Crypto)', 
      '1d': 'Diario (Crypto)',
      '1h': 'Por Hora (Crypto)'
    } : {
      '1M': 'Mensual',
      '1W': 'Semanal', 
      '1d': 'Diario',
      '1h': 'Por Hora'
    };
    
    const label = labels[timeframe] || timeframe;
    if (!score) return `${label}: Sin datos`;
    
    let tooltip = `${label}: ${score.toFixed(1)}/10`;
    
    // Add crypto-specific information if available
    if (isCrypto && cryptoData?.crypto_indicators) {
      if (cryptoData.crypto_indicators.rsi_crypto_levels) {
        tooltip += ' (RSI 20/80)';
      }
      if (cryptoData.crypto_indicators.breakout_detected) {
        tooltip += ' 🚀 Breakout';
      }
    }
    
    return tooltip;
  };

  // Compact mode for crypto with enhanced info
  if (compact && mtssData) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        {/* Main signal chip */}
        <Badge
          badgeContent={mtssData.confidence && mtssData.confidence > 0.8 ? '●' : '○'}
          color={mtssData.confidence && mtssData.confidence > 0.8 ? 'success' : 'warning'}
          sx={{ '& .MuiBadge-badge': { fontSize: '8px', minWidth: '8px', height: '8px' } }}
        >
          <Chip
            label={mtssData.trading_signal || 'WAIT'}
            color={getSignalColor(mtssData.trading_signal) as any}
            size="small"
            icon={getSignalIcon(mtssData.trading_signal)}
            onClick={onClick}
            sx={{ 
              cursor: onClick ? 'pointer' : 'default',
              '&:hover': onClick ? { opacity: 0.8 } : {}
            }}
          />
        </Badge>
        
        {/* Score */}
        {mtssData.unified_score && (
          <Typography 
            variant="caption" 
            fontWeight="bold"
            sx={{ color: getScoreColor(mtssData.unified_score) }}
          >
            {mtssData.unified_score.toFixed(1)}
          </Typography>
        )}
        
        {/* Risk level for crypto */}
        {isCrypto && cryptoData?.risk_metrics && showRisk && (
          <Chip
            label={cryptoData.risk_metrics.risk_level}
            size="small"
            variant="outlined"
            sx={{ 
              color: getRiskColor(cryptoData.risk_metrics.risk_level),
              borderColor: getRiskColor(cryptoData.risk_metrics.risk_level),
              fontSize: '0.65rem'
            }}
          />
        )}
        
        {/* Crypto special indicators */}
        {isCrypto && cryptoData?.crypto_indicators?.breakout_detected && (
          <Tooltip title="Breakout detectado">
            <Typography variant="caption" sx={{ color: 'success.main' }}>
              🚀
            </Typography>
          </Tooltip>
        )}
      </Box>
    );
  }

  // Si no hay datos, mostrar indicadores grises
  if (!mtssData) {
    const noDataMessage = isCrypto ? 'Sin análisis crypto' : 'Sin información';
    return (
      <Box display="flex" gap={0.5} alignItems="center">
        <Tooltip title={`Monthly: ${noDataMessage}`} arrow>
          <RemoveIcon sx={{ fontSize: 8, color: 'grey.400' }} />
        </Tooltip>
        <Tooltip title={`Weekly: ${noDataMessage}`} arrow>
          <RemoveIcon sx={{ fontSize: 8, color: 'grey.400' }} />
        </Tooltip>
        <Tooltip title={`Daily: ${noDataMessage}`} arrow>
          <RemoveIcon sx={{ fontSize: 8, color: 'grey.400' }} />
        </Tooltip>
        <Tooltip title={`Hourly: ${noDataMessage}`} arrow>
          <RemoveIcon sx={{ fontSize: 8, color: 'grey.400' }} />
        </Tooltip>
        {onClick && (
          <Tooltip title="Click para análisis">
            <Analytics 
              sx={{ fontSize: 12, color: 'primary.main', cursor: 'pointer', ml: 1 }} 
              onClick={onClick}
            />
          </Tooltip>
        )}
      </Box>
    );
  }

  // Si análisis no fue completado, mostrar círculos amarillos
  if (!mtssData.analysis_performed) {
    const analysisMessage = isCrypto ? 
      'Score básico crypto - Click para análisis MTSS completo' : 
      'Score básico disponible - Click para análisis completo';
      
    return (
      <Box display="flex" gap={0.5} alignItems="center">
        <Tooltip title={analysisMessage} arrow>
          <CircleIcon sx={{ 
            fontSize: 8, 
            color: 'warning.main',
            cursor: onClick ? 'pointer' : 'default'
          }} onClick={onClick} />
        </Tooltip>
        <Tooltip title="Click para análisis completo" arrow>
          <CircleIcon sx={{ 
            fontSize: 8, 
            color: 'warning.main',
            cursor: onClick ? 'pointer' : 'default'
          }} onClick={onClick} />
        </Tooltip>
        <Tooltip title="Click para análisis completo" arrow>
          <CircleIcon sx={{ 
            fontSize: 8, 
            color: 'warning.main',
            cursor: onClick ? 'pointer' : 'default'
          }} onClick={onClick} />
        </Tooltip>
        <Tooltip title="Click para análisis completo" arrow>
          <CircleIcon sx={{ 
            fontSize: 8, 
            color: 'warning.main',
            cursor: onClick ? 'pointer' : 'default'
          }} onClick={onClick} />
        </Tooltip>
        {isCrypto && (
          <Tooltip title="Análisis optimizado para crypto">
            <Analytics sx={{ fontSize: 10, color: 'info.main', ml: 0.5 }} />
          </Tooltip>
        )}
      </Box>
    );
  }

  // Análisis completo disponible - mostrar timeframes individuales
  const monthlyScore = mtssData.timeframe_scores?.['1M'];
  const weeklyScore = mtssData.timeframe_scores?.['1W'];
  const dailyScore = mtssData.timeframe_scores?.['1d'];
  const hourlyScore = mtssData.timeframe_scores?.['1h'];

  return (
    <Box display="flex" gap={0.5} alignItems="center">
      <Tooltip title={getTimeframeTooltip('1M', monthlyScore)} arrow>
        <CircleIcon sx={{ 
          fontSize: 8, 
          color: getTimeframeColor(monthlyScore),
          cursor: onClick ? 'pointer' : 'help'
        }} onClick={onClick} />
      </Tooltip>
      <Tooltip title={getTimeframeTooltip('1W', weeklyScore)} arrow>
        <CircleIcon sx={{ 
          fontSize: 8, 
          color: getTimeframeColor(weeklyScore),
          cursor: onClick ? 'pointer' : 'help'
        }} onClick={onClick} />
      </Tooltip>
      <Tooltip title={getTimeframeTooltip('1d', dailyScore)} arrow>
        <CircleIcon sx={{ 
          fontSize: 8, 
          color: getTimeframeColor(dailyScore),
          cursor: onClick ? 'pointer' : 'help'
        }} onClick={onClick} />
      </Tooltip>
      <Tooltip title={getTimeframeTooltip('1h', hourlyScore)} arrow>
        <CircleIcon sx={{ 
          fontSize: 8, 
          color: getTimeframeColor(hourlyScore),
          cursor: onClick ? 'pointer' : 'help'
        }} onClick={onClick} />
      </Tooltip>
      
      {/* Additional crypto indicators */}
      {isCrypto && (
        <>
          {/* BTC correlation indicator */}
          {cryptoData?.risk_metrics && (
            <Tooltip 
              title={`BTC Correlation: ${(cryptoData.risk_metrics.btc_correlation * 100).toFixed(0)}% | Risk: ${cryptoData.risk_metrics.risk_level}`}
              arrow
            >
              <CircleIcon sx={{ 
                fontSize: 6, 
                color: getRiskColor(cryptoData.risk_metrics.risk_level),
                ml: 0.5
              }} />
            </Tooltip>
          )}
          
          {/* Breakout indicator */}
          {cryptoData?.crypto_indicators?.breakout_detected && (
            <Tooltip title="Breakout detectado - Oportunidad crypto" arrow>
              <TrendingUp sx={{ 
                fontSize: 12, 
                color: 'success.main',
                ml: 0.5
              }} />
            </Tooltip>
          )}
          
          {/* RSI crypto levels indicator */}
          {cryptoData?.crypto_indicators?.rsi_crypto_levels && (
            <Tooltip title="Usando RSI optimizado crypto (20/80)" arrow>
              <Speed sx={{ 
                fontSize: 10, 
                color: 'info.main',
                ml: 0.5
              }} />
            </Tooltip>
          )}
        </>
      )}
      
      {/* Overall score if available */}
      {mtssData.unified_score && (
        <Tooltip title={`Score unificado: ${mtssData.unified_score.toFixed(1)}/10${mtssData.confidence ? ` (${(mtssData.confidence * 100).toFixed(0)}% confianza)` : ''}`} arrow>
          <Typography 
            variant="caption" 
            sx={{ 
              color: getScoreColor(mtssData.unified_score),
              fontWeight: 'bold',
              ml: 1,
              fontSize: '0.7rem'
            }}
          >
            {mtssData.unified_score.toFixed(1)}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};

export default MTSSIndicator;