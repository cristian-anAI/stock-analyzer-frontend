import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Alert } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PupupuV3BacktestComparison } from '../../types';

interface BacktestComparisonChartProps {
  results: PupupuV3BacktestComparison | null;
}

export const BacktestComparisonChart: React.FC<BacktestComparisonChartProps> = ({ results }) => {
  if (!results || !results.comparison) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Backtest Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading backtest results...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { comparison, test_period, symbol, total_signals } = results;
  const { phase1_tp1_only, phase3_ml_dynamic, improvement } = comparison;

  const MetricRow = ({ label, value1, value2, format = 'number' }: {
    label: string;
    value1: number;
    value2: number;
    format?: 'number' | 'currency' | 'percentage';
  }) => {
    const formatValue = (val: number) => {
      const safeVal = val || 0;
      if (format === 'currency') return `$${safeVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      if (format === 'percentage') return `${safeVal.toFixed(2)}%`;
      return safeVal.toFixed(2);
    };

    const isImprovement = (value2 || 0) > (value1 || 0);
    const v2Color = isImprovement ? 'success.main' : 'error.main';

    return (
      <Box display="flex" justifyContent="space-between" py={1} borderBottom="1px solid" borderColor="divider">
        <Typography variant="body2" flex="1">
          {label}
        </Typography>
        <Typography variant="body2" flex="1" textAlign="center">
          {formatValue(value1)}
        </Typography>
        <Typography variant="body2" flex="1" textAlign="right" fontWeight="bold" sx={{ color: v2Color }}>
          {formatValue(value2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📈 Backtest Comparison
          </Typography>
          <Box display="flex" gap={1}>
            <Chip label={`${test_period}`} size="small" variant="outlined" />
            <Chip label={`${symbol}`} size="small" variant="outlined" />
            <Chip label={`${total_signals} signals`} size="small" variant="outlined" />
          </Box>
        </Box>

        {/* Highlight Box */}
        <Alert
          severity="success"
          icon={<TrendingUpIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            +{(improvement.pnl_percentage || 0).toFixed(0)}% 🚀
          </Typography>
          <Typography variant="body2">
            PnL Improvement with ML Dynamic TPs
          </Typography>
          <Typography variant="caption" display="block" mt={0.5}>
            ${(improvement.pnl_change || 0).toLocaleString()} additional profit
          </Typography>
        </Alert>

        {/* Metrics Table */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" py={1} borderBottom="2px solid" borderColor="divider">
            <Typography variant="body2" fontWeight="bold" flex="1">
              Metric
            </Typography>
            <Typography variant="body2" fontWeight="bold" flex="1" textAlign="center">
              Phase 1 (TP1 Only)
            </Typography>
            <Typography variant="body2" fontWeight="bold" flex="1" textAlign="right">
              Phase 3 (ML Dynamic)
            </Typography>
          </Box>

          <MetricRow
            label="Total PnL"
            value1={phase1_tp1_only.total_pnl}
            value2={phase3_ml_dynamic.total_pnl}
            format="currency"
          />
          <MetricRow
            label="Win Rate"
            value1={phase1_tp1_only.win_rate}
            value2={phase3_ml_dynamic.win_rate}
            format="percentage"
          />
          <MetricRow
            label="Avg Win"
            value1={phase1_tp1_only.avg_win}
            value2={phase3_ml_dynamic.avg_win}
            format="currency"
          />
          <MetricRow
            label="Avg Loss"
            value1={phase1_tp1_only.avg_loss}
            value2={phase3_ml_dynamic.avg_loss}
            format="currency"
          />
          <MetricRow
            label="Profit Factor"
            value1={phase1_tp1_only.profit_factor}
            value2={phase3_ml_dynamic.profit_factor}
          />
          <MetricRow
            label="Expectancy"
            value1={phase1_tp1_only.expectancy}
            value2={phase3_ml_dynamic.expectancy}
            format="currency"
          />
        </Box>
      </CardContent>
    </Card>
  );
};
