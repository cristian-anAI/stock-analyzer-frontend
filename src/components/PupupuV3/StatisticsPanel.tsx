import React from 'react';
import { Card, CardContent, Typography, Box, Divider, Chip } from '@mui/material';
import { PupupuV3Statistics } from '../../types';

interface StatisticsPanelProps {
  statistics: PupupuV3Statistics | null;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ statistics }) => {
  if (!statistics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const StatRow = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <Box display="flex" justifyContent="space-between" mb={1.5}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📊 Statistics
          </Typography>
          <Chip label={`${statistics.period_days} days`} size="small" variant="outlined" />
        </Box>

        <Divider sx={{ my: 2 }} />

        <StatRow label="Total Signals" value={statistics.signals_total || 0} />
        <StatRow label="Valid Signals" value={statistics.signals_valid || 0} />
        <StatRow label="Total Trades" value={statistics.trades_total || 0} />

        <Divider sx={{ my: 2 }} />

        <StatRow label="Wins" value={statistics.wins || 0} color="success.main" />
        <StatRow label="Losses" value={statistics.losses || 0} color="error.main" />
        <StatRow
          label="Win Rate"
          value={`${(statistics.win_rate || 0).toFixed(2)}%`}
          color={(statistics.win_rate || 0) >= 50 ? 'success.main' : 'error.main'}
        />

        <Divider sx={{ my: 2 }} />

        <StatRow
          label="Total PnL"
          value={`$${(statistics.total_pnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color={(statistics.total_pnl || 0) >= 0 ? 'success.main' : 'error.main'}
        />
        <StatRow
          label="Avg Win"
          value={`$${(statistics.avg_win || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="success.main"
        />
        <StatRow
          label="Avg Loss"
          value={`$${(statistics.avg_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="error.main"
        />

        <Divider sx={{ my: 2 }} />

        <StatRow
          label="Profit Factor"
          value={(statistics.profit_factor || 0).toFixed(2)}
          color={(statistics.profit_factor || 0) >= 1.5 ? 'success.main' : (statistics.profit_factor || 0) >= 1.0 ? 'warning.main' : 'error.main'}
        />
        <StatRow
          label="Expectancy"
          value={`$${(statistics.expectancy || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color={(statistics.expectancy || 0) >= 0 ? 'success.main' : 'error.main'}
        />
        <StatRow
          label="Max Drawdown"
          value={`$${(statistics.max_drawdown || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          color="error.main"
        />

        <Divider sx={{ my: 2 }} />

        <StatRow label="No EMA Test Count" value={statistics.no_test_count || 0} />
      </CardContent>
    </Card>
  );
};
