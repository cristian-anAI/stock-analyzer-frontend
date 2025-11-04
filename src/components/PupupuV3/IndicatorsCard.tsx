import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PupupuV3Indicators } from '../../types';

interface IndicatorsCardProps {
  indicators: PupupuV3Indicators | null;
  currentPrice: number;
}

export const IndicatorsCard: React.FC<IndicatorsCardProps> = ({ indicators, currentPrice }) => {
  if (!indicators) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Technical Indicators
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading indicators...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const IndicatorRow = ({ label, value, distance, abovePrice, color }: {
    label: string;
    value: number;
    distance: number;
    abovePrice: boolean;
    color: string;
  }) => (
    <Box mb={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {abovePrice ? (
            <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
          )}
          <Typography variant="body2" fontWeight="bold" sx={{ color }}>
            ${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          Distance from price
        </Typography>
        <Chip
          label={`${Math.abs(distance).toFixed(2)}%`}
          size="small"
          sx={{
            backgroundColor: Math.abs(distance) < 0.5 ? 'warning.main' : 'action.hover',
            color: Math.abs(distance) < 0.5 ? 'warning.contrastText' : 'text.primary',
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Technical Indicators
        </Typography>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Price: <strong>${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </Typography>
        </Box>

        <IndicatorRow
          label="EMA(15)"
          value={indicators.ema_15}
          distance={indicators.ema_distance_pct}
          abovePrice={indicators.ema_above_price}
          color={indicators.ema_above_price ? 'success.main' : 'error.main'}
        />

        <IndicatorRow
          label="VWAP"
          value={indicators.vwap}
          distance={indicators.vwap_distance_pct}
          abovePrice={indicators.vwap_above_price}
          color={indicators.vwap_above_price ? 'success.main' : 'error.main'}
        />

        <Box mt={2} p={1.5} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Green arrow indicates indicator is above price (resistance).
            Red arrow indicates indicator is below price (support).
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
