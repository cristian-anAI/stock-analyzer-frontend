import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Tooltip,
  Grid,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Timeline,
  Speed,
  Assessment,
  ShowChart,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { CryptoTimeframeData, CryptoMTSSAnalysis } from '../../types';

interface CryptoScoringSystemProps {
  analysis: CryptoMTSSAnalysis;
  compact?: boolean;
}

const CryptoScoringSystem: React.FC<CryptoScoringSystemProps> = ({
  analysis,
  compact = false
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#22c55e'; // Strong green
    if (score >= 7.0) return '#84cc16'; // Light green  
    if (score >= 6.0) return '#eab308'; // Yellow
    if (score >= 4.5) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8.5) return 'STRONG BUY';
    if (score >= 7.0) return 'BUY';
    if (score >= 6.0) return 'HOLD'; 
    if (score >= 4.5) return 'WEAK HOLD';
    return 'SELL';
  };

  const getRSIStatus = (rsi: number) => {
    if (rsi <= 20) return { status: 'OVERSOLD', color: '#22c55e', icon: <TrendingUp /> };
    if (rsi >= 80) return { status: 'OVERBOUGHT', color: '#ef4444', icon: <TrendingDown /> };
    if (rsi <= 35) return { status: 'BULLISH', color: '#84cc16', icon: <TrendingUp /> };
    if (rsi >= 65) return { status: 'BEARISH', color: '#f97316', icon: <TrendingDown /> };
    return { status: 'NEUTRAL', color: '#6b7280', icon: <Timeline /> };
  };

  const getMomentumStatus = (momentum: number) => {
    if (momentum >= 0.15) return { label: 'VERY STRONG', color: '#22c55e' };
    if (momentum >= 0.08) return { label: 'STRONG', color: '#84cc16' };
    if (momentum >= 0.03) return { label: 'MODERATE', color: '#eab308' };
    if (momentum >= -0.03) return { label: 'WEAK', color: '#f97316' };
    return { label: 'VERY WEAK', color: '#ef4444' };
  };

  const getVolatilityStatus = (volatility: number) => {
    if (volatility >= 0.08) return { label: 'EXTREME', color: '#ef4444', risk: 'HIGH' };
    if (volatility >= 0.05) return { label: 'HIGH', color: '#f97316', risk: 'MEDIUM-HIGH' };
    if (volatility >= 0.03) return { label: 'MODERATE', color: '#eab308', risk: 'MEDIUM' };
    if (volatility >= 0.02) return { label: 'LOW', color: '#84cc16', risk: 'LOW-MEDIUM' };
    return { label: 'VERY LOW', color: '#22c55e', risk: 'LOW' };
  };

  const getTimeframeIcon = (timeframe: string) => {
    const icons: Record<string, React.ReactNode> = {
      '1h': <Speed />,
      '4h': <TrendingUp />,
      '1d': <Timeline />,
      '1w': <Assessment />,
    };
    return icons[timeframe] || <ShowChart />;
  };

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={2}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{ color: getScoreColor(analysis.overall_score) }}
        >
          {analysis.overall_score.toFixed(1)}/10
        </Typography>
        <Chip
          label={getScoreLabel(analysis.overall_score)}
          sx={{ 
            color: getScoreColor(analysis.overall_score),
            borderColor: getScoreColor(analysis.overall_score)
          }}
          variant="outlined"
          size="small"
        />
        <Typography variant="caption" color="textSecondary">
          Crypto-Optimized Score
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Overall Score Header */}
      <Card sx={{ mb: 3, bgcolor: 'grey.900', border: '1px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              Crypto MTSS Score - {analysis.symbol}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Typography 
                variant="h3" 
                fontWeight="bold"
                sx={{ color: getScoreColor(analysis.overall_score) }}
              >
                {analysis.overall_score.toFixed(1)}
              </Typography>
              <Box>
                <Chip
                  label={getScoreLabel(analysis.overall_score)}
                  sx={{ 
                    color: getScoreColor(analysis.overall_score),
                    borderColor: getScoreColor(analysis.overall_score),
                    fontWeight: 'bold'
                  }}
                  variant="outlined"
                />
                <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                  Confidence: {(analysis.confidence * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Optimization Level Alert */}
          <Alert 
            severity="info" 
            icon={<CheckCircle />}
            sx={{ bgcolor: 'info.dark', color: 'info.contrastText' }}
          >
            <Typography variant="body2">
              <strong>🚀 Crypto-Optimized Analysis:</strong> Using RSI 20/80 levels, 
              momentum periods [7,14,21], and crypto-specific volatility adjustments
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Optimization Level: {analysis.analysis_metadata?.optimization_level || 'crypto_optimized'}
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Timeframe Analysis */}
      <Typography variant="h6" gutterBottom>
        📊 Multi-Timeframe Analysis (Crypto-Optimized)
      </Typography>
      
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        {Object.entries(analysis.timeframes).map(([timeframe, data]) => {
          const rsiStatus = getRSIStatus(data.rsi);
          const momentum7d = getMomentumStatus(data.momentum_7d);
          const momentum14d = getMomentumStatus(data.momentum_14d);
          const momentum21d = getMomentumStatus(data.momentum_21d);
          const volatilityStatus = getVolatilityStatus(data.volatility);

          return (
            <Box key={timeframe} flex="1" minWidth="400px">
              <Card variant="outlined" sx={{ bgcolor: 'grey.800', height: '100%' }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTimeframeIcon(timeframe)}
                      <Typography variant="h6">{timeframe} Analysis</Typography>
                    </Box>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      sx={{ color: getScoreColor(data.score) }}
                    >
                      {data.score.toFixed(1)}/10
                    </Typography>
                  </Box>

                  <LinearProgress 
                    variant="determinate" 
                    value={(data.score / 10) * 100}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      mb: 2,
                      backgroundColor: 'grey.700',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(data.score)
                      }
                    }}
                  />

                  {/* RSI Crypto Analysis */}
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      RSI (Crypto 20/80 Levels):
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        icon={rsiStatus.icon}
                        label={`${data.rsi.toFixed(1)} - ${rsiStatus.status}`}
                        sx={{ 
                          color: rsiStatus.color,
                          borderColor: rsiStatus.color
                        }}
                        variant="outlined"
                        size="small"
                      />
                      {data.rsi <= 20 && (
                        <Tooltip title="Strong buy signal in crypto markets">
                          <CheckCircle sx={{ color: '#22c55e', fontSize: 16 }} />
                        </Tooltip>
                      )}
                      {data.rsi >= 80 && (
                        <Tooltip title="Strong sell signal in crypto markets">
                          <Warning sx={{ color: '#ef4444', fontSize: 16 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Crypto Momentum Analysis */}
                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Crypto Momentum Analysis:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Tooltip title="7-day momentum (short-term crypto trend)">
                        <Chip
                          label={`7d: ${momentum7d.label}`}
                          sx={{ 
                            color: momentum7d.color,
                            borderColor: momentum7d.color,
                            fontSize: '0.7rem'
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                      <Tooltip title="14-day momentum (medium-term crypto trend)">
                        <Chip
                          label={`14d: ${momentum14d.label}`}
                          sx={{ 
                            color: momentum14d.color,
                            borderColor: momentum14d.color,
                            fontSize: '0.7rem'
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                      <Tooltip title="21-day momentum (longer-term crypto trend)">
                        <Chip
                          label={`21d: ${momentum21d.label}`}
                          sx={{ 
                            color: momentum21d.color,
                            borderColor: momentum21d.color,
                            fontSize: '0.7rem'
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Volume and Price Action */}
                  <Box mb={2}>
                    <Box display="flex" gap={1} alignItems="center" mb={1}>
                      <Typography variant="caption" color="textSecondary">
                        Volume Trend:
                      </Typography>
                      <Chip
                        label={data.volume_trend.toUpperCase()}
                        color={data.volume_trend === 'increasing' ? 'success' : 
                               data.volume_trend === 'decreasing' ? 'error' : 'warning'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Price Action Signals */}
                    {(data.price_action.breakout_detected || data.price_action.reversal_signal) && (
                      <Box display="flex" gap={1}>
                        {data.price_action.breakout_detected && (
                          <Tooltip title="Breakout pattern detected - potential strong move">
                            <Chip
                              label="🚀 BREAKOUT"
                              color="success"
                              size="small"
                              icon={<TrendingUp />}
                            />
                          </Tooltip>
                        )}
                        {data.price_action.reversal_signal && (
                          <Tooltip title="Reversal pattern detected - trend change possible">
                            <Chip
                              label="🔄 REVERSAL"
                              color="warning"
                              size="small"
                              icon={<Timeline />}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Volatility Analysis */}
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Volatility: {(data.volatility * 100).toFixed(2)}% ({volatilityStatus.label} - {volatilityStatus.risk} Risk)
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(data.volatility * 1000, 100)} // Scale volatility for display
                      sx={{ 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: 'grey.700',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: volatilityStatus.color
                        }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>

      {/* Analysis Metadata */}
      <Card variant="outlined" sx={{ bgcolor: 'grey.800' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔧 Analysis Configuration
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip
              label={`RSI Levels: ${analysis.analysis_metadata?.rsi_levels_used?.join('/') || '20/80'}`}
              color="info"
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Momentum Periods: ${analysis.analysis_metadata?.momentum_periods_used?.join(', ') || '7,14,21'} days`}
              color="info"
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Data Quality: ${((analysis.analysis_metadata?.data_quality_score || 0.9) * 100).toFixed(0)}%`}
              color={analysis.analysis_metadata?.data_quality_score && analysis.analysis_metadata.data_quality_score > 0.8 ? 'success' : 'warning'}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Analysis Time: ${analysis.analysis_metadata?.analysis_time || 'Real-time'}`}
              color="default"
              size="small"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CryptoScoringSystem;