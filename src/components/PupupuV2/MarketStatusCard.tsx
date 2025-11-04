import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { PricePosition, HTTrend } from '../../types';

interface MarketStatusCardProps {
  currentPrice: number;
  currentEma: number;
  priceVsEma: PricePosition;
  distanceFromEmaPct: number;
  htTrend: HTTrend;
  lastUpdate: string;
}

export const MarketStatusCard: React.FC<MarketStatusCardProps> = ({
  currentPrice,
  currentEma,
  priceVsEma,
  distanceFromEmaPct,
  htTrend,
  lastUpdate,
}) => {
  // Add fallbacks
  const safeCurrentPrice = currentPrice || 0;
  const safeCurrentEma = currentEma || 0;
  const safeDistanceFromEmaPct = distanceFromEmaPct || 0;

  const getTrendColor = (trend: HTTrend): 'success' | 'error' | 'default' => {
    if (trend === 'bullish') return 'success';
    if (trend === 'bearish') return 'error';
    return 'default';
  };

  const getTrendIcon = (trend: HTTrend): string => {
    if (trend === 'bullish') return '📈';
    if (trend === 'bearish') return '📉';
    return '➡️';
  };

  const positionColor = priceVsEma === 'above' ? 'success.main' : 'error.main';

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Market Status
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            BTC/USDT
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
            ${safeCurrentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            EMA(12)
          </Typography>
          <Typography variant="h6">
            ${safeCurrentEma.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Position
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body1" sx={{ color: positionColor, fontWeight: 'medium' }}>
              {priceVsEma === 'above' ? 'Above' : 'Below'} EMA
            </Typography>
            <Chip
              label={`${safeDistanceFromEmaPct >= 0 ? '+' : ''}${safeDistanceFromEmaPct.toFixed(2)}%`}
              size="small"
              color={priceVsEma === 'above' ? 'success' : 'error'}
            />
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            HT Trend
          </Typography>
          <Chip
            label={`${getTrendIcon(htTrend)} ${htTrend.charAt(0).toUpperCase() + htTrend.slice(1)}`}
            color={getTrendColor(htTrend)}
            size="medium"
          />
        </Box>

        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Last Update: {new Date(lastUpdate).toLocaleTimeString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
