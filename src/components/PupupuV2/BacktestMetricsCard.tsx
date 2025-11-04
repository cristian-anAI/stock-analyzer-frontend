import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { BacktestSummary, formatPriceUSD } from '../../types';

interface BacktestMetricsCardProps {
  backtest: BacktestSummary;
  onViewReport?: () => void;
}

export const BacktestMetricsCard: React.FC<BacktestMetricsCardProps> = ({
  backtest,
  onViewReport,
}) => {
  // Add fallbacks for all numeric values
  const winRate = backtest?.win_rate || 0;
  const totalPnl = backtest?.total_pnl || 0;
  const profitFactor = backtest?.profit_factor || 0;
  const maxDrawdown = backtest?.max_drawdown || 0;
  const avgRiskReward = backtest?.avg_risk_reward || 0;
  const avgWin = backtest?.avg_win || 0;
  const avgLoss = backtest?.avg_loss || 0;
  const winningTrades = backtest?.winning_trades || 0;
  const losingTrades = backtest?.losing_trades || 0;

  const winRateColor = winRate >= 60 ? 'success' : winRate >= 50 ? 'warning' : 'error';
  const pnlColor = totalPnl >= 0 ? 'success.main' : 'error.main';

  const MetricRow = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <Box display="flex" justifyContent="space-between" mb={1}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" fontWeight="medium" sx={{ color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📈 Backtest Performance
        </Typography>

        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="body2" color="text.secondary">
              Win Rate:
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={`${winRate.toFixed(1)}%`}
                color={winRateColor}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                ({winningTrades}W/{losingTrades}L)
              </Typography>
            </Box>
          </Box>

          <MetricRow
            label="Total P&L"
            value={formatPriceUSD(totalPnl)}
            color={pnlColor}
          />

          <MetricRow
            label="Profit Factor"
            value={profitFactor.toFixed(2)}
            color={profitFactor > 1.5 ? 'success.main' : 'warning.main'}
          />

          <MetricRow
            label="Max Drawdown"
            value={formatPriceUSD(maxDrawdown)}
            color="error.main"
          />

          <MetricRow
            label="Avg R:R"
            value={`1:${avgRiskReward.toFixed(2)}`}
          />

          {backtest?.sharpe_ratio !== undefined && (
            <MetricRow
              label="Sharpe Ratio"
              value={backtest.sharpe_ratio.toFixed(2)}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <MetricRow
            label="Avg Win"
            value={formatPriceUSD(avgWin)}
            color="success.main"
          />
          <MetricRow
            label="Avg Loss"
            value={formatPriceUSD(avgLoss)}
            color="error.main"
          />
        </Box>

        {onViewReport && (
          <Box mt={2}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={onViewReport}
            >
              View Full Report
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
