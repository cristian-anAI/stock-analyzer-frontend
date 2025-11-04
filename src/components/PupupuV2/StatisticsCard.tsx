import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { BotStatistics } from '../../types';

interface StatisticsCardProps {
  statistics: BotStatistics;
  onStartMonitoring?: () => void;
  onStopMonitoring?: () => void;
  loading?: boolean;
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({
  statistics,
  onStartMonitoring,
  onStopMonitoring,
  loading,
}) => {
  // Add fallbacks for all values
  const totalSignals = statistics?.total_signals || 0;
  const longSignals = statistics?.long_signals || 0;
  const shortSignals = statistics?.short_signals || 0;
  const avgConfidence = statistics?.avg_confidence || 0;
  const monitoringActive = statistics?.monitoring_active || false;

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
          📊 Bot Statistics
        </Typography>

        <Box mt={2}>
          <MetricRow
            label="Total Signals"
            value={totalSignals}
          />

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              LONG:
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="success.main">
              {longSignals}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              SHORT:
            </Typography>
            <Typography variant="body2" fontWeight="medium" color="error.main">
              {shortSignals}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <MetricRow
            label="Avg Confidence"
            value={`${avgConfidence.toFixed(1)}%`}
            color={avgConfidence >= 80 ? 'success.main' : 'warning.main'}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Monitoring:
            </Typography>
            <Chip
              label={monitoringActive ? '⚫ Active' : '⚫ Inactive'}
              color={monitoringActive ? 'success' : 'default'}
              size="small"
            />
          </Box>

          {statistics?.last_signal_time && (
            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                Last Signal: {new Date(statistics.last_signal_time).toLocaleString()}
              </Typography>
            </Box>
          )}
        </Box>

        <Box mt={3}>
          {monitoringActive ? (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={onStopMonitoring}
              disabled={loading}
            >
              Stop Monitoring
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={onStartMonitoring}
              disabled={loading}
            >
              Start Monitoring
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
