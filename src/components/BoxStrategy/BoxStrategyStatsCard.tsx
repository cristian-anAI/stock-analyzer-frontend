import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { BoxStrategyDashboardExtended } from '../../types';

interface BoxStrategyStatsCardProps {
  dashboard: BoxStrategyDashboardExtended;
}

export const BoxStrategyStatsCard: React.FC<BoxStrategyStatsCardProps> = ({
  dashboard,
}) => {
  const activeTrades = dashboard.summary.active_trades_count || 0;
  const tp1Achieved = dashboard.summary.tp1_achieved_count || 0;
  const slBreakeven = dashboard.summary.stop_moved_to_breakeven_count || 0;
  const avgWinProb = dashboard.summary.avg_win_probability || 0;

  const tp1Percentage = activeTrades > 0 ? ((tp1Achieved / activeTrades) * 100).toFixed(0) : 0;
  const bePercentage = activeTrades > 0 ? ((slBreakeven / activeTrades) * 100).toFixed(0) : 0;

  const StatRow = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
    <Box display="flex" justifyContent="space-between" mb={1.5}>
      <Typography variant="body2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" fontWeight="bold" sx={{ color: color || 'text.primary' }}>
        {value}
      </Typography>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Box Strategy Stats
        </Typography>

        <Divider sx={{ my: 2 }} />

        <StatRow
          label="Active Trades"
          value={activeTrades}
          color={activeTrades > 0 ? 'success.main' : 'text.secondary'}
        />

        <StatRow
          label="TP1 Achieved"
          value={`${tp1Achieved} (${tp1Percentage}%)`}
          color={tp1Achieved > 0 ? 'success.main' : 'text.secondary'}
        />

        <StatRow
          label="SL at Breakeven"
          value={`${slBreakeven} (${bePercentage}%)`}
          color={slBreakeven > 0 ? 'info.main' : 'text.secondary'}
        />

        <Divider sx={{ my: 2 }} />

        <StatRow
          label="High Confidence"
          value={dashboard.summary.high_confidence}
          color="warning.main"
        />

        <StatRow
          label="Total Breakouts"
          value={dashboard.summary.breakouts}
        />

        <StatRow
          label="Avg ML Confidence"
          value={`${(avgWinProb * 100).toFixed(1)}%`}
          color={avgWinProb > 0.75 ? 'success.main' : avgWinProb > 0.6 ? 'warning.main' : 'error.main'}
        />
      </CardContent>
    </Card>
  );
};
