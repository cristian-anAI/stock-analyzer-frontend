import React from 'react';
import { Card, CardContent, Typography, Box, Alert, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { MarketFilters, HTTrend } from '../../types';

interface MarketFiltersIndicatorProps {
  filters: MarketFilters;
}

export const MarketFiltersIndicator: React.FC<MarketFiltersIndicatorProps> = ({
  filters,
}) => {
  const getTrendIcon = (trend: HTTrend) => {
    if (trend === 'bullish') return <TrendingUpIcon fontSize="small" />;
    if (trend === 'bearish') return <TrendingDownIcon fontSize="small" />;
    return <ArrowForwardIcon fontSize="small" />;
  };

  const getTrendColor = (trend: HTTrend): 'success' | 'error' | 'default' => {
    if (trend === 'bullish') return 'success';
    if (trend === 'bearish') return 'error';
    return 'default';
  };

  const FilterRow = ({ label, value, icon }: { label: string; value: boolean; icon?: React.ReactNode }) => (
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      {value ? (
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
      ) : (
        <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
      )}
      <Typography
        variant="body2"
        sx={{
          color: value ? 'success.main' : 'error.main',
          fontWeight: value ? 'medium' : 'normal'
        }}
      >
        {label}
      </Typography>
      {icon}
    </Box>
  );

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🚦 Market Filters
        </Typography>

        <Box mt={2}>
          <FilterRow
            label="Liquidity OK"
            value={filters.liquidity_ok}
          />
          <FilterRow
            label="Volatility Normal"
            value={filters.volatility_ok}
          />
          <FilterRow
            label={filters.fundamental_event ? 'Fundamental Event Active' : 'No Fundamental Events'}
            value={!filters.fundamental_event}
          />

          <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            {getTrendIcon(filters.ht_trend)}
            <Typography variant="body2">
              HT Trend:{' '}
              <Chip
                label={filters.ht_trend.charAt(0).toUpperCase() + filters.ht_trend.slice(1)}
                size="small"
                color={getTrendColor(filters.ht_trend)}
              />
            </Typography>
          </Box>
        </Box>

        <Box mt={3}>
          <Alert
            severity={filters.pass_all ? 'success' : 'error'}
            sx={{ fontWeight: 'bold' }}
          >
            Status: {filters.pass_all ? 'SAFE TO TRADE 🟢' : 'DO NOT TRADE 🔴'}
          </Alert>
        </Box>

        {filters.description && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              {filters.description}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
