import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  Timeline,
  Speed,
} from '@mui/icons-material';
import { autotraderService } from '../../services/api';

interface AutotraderSummary {
  cycle_start: string;
  actions_taken: number;
  buy_signals: number;
  sell_signals: number;
  total_value: number;
  total_pnl: number;
  success_rate: number;
}

const AutotraderStats: React.FC = () => {
  const [summary, setSummary] = useState<AutotraderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await autotraderService.getAutotraderSummary();
      setSummary(data);
    } catch (err) {
      setError('Error al cargar las estadísticas del autotrader');
      console.error('Error fetching autotrader summary:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !summary) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || 'No se pudieron cargar las estadísticas'}
      </Alert>
    );
  }

  const successRatePercent = (summary.success_rate || 0) * 100;
  const lastCycle = summary.cycle_start ? new Date(summary.cycle_start).toLocaleString() : 'N/A';

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Estadísticas del Autotrader
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <ShowChart color="primary" />
                <Typography color="textSecondary" variant="body2">
                  Acciones Totales
                </Typography>
              </Box>
              <Typography variant="h4">
                {summary.actions_taken || 0}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Último ciclo: {lastCycle}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingUp color="success" />
                <Typography color="textSecondary" variant="body2">
                  Señales de Compra
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {summary.buy_signals || 0}
              </Typography>
              <Chip
                label={`${Math.round(((summary.buy_signals || 0) / ((summary.buy_signals || 0) + (summary.sell_signals || 0))) * 100) || 0}% del total`}
                size="small"
                color="success"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TrendingDown color="error" />
                <Typography color="textSecondary" variant="body2">
                  Señales de Venta
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {summary.sell_signals || 0}
              </Typography>
              <Chip
                label={`${Math.round(((summary.sell_signals || 0) / ((summary.buy_signals || 0) + (summary.sell_signals || 0))) * 100) || 0}% del total`}
                size="small"
                color="error"
                variant="outlined"
              />
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Timeline color="info" />
                <Typography color="textSecondary" variant="body2">
                  Valor Total
                </Typography>
              </Box>
              <Typography variant="h4">
                ${(summary.total_value || 0).toFixed(0)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Portfolio del autotrader
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {(summary.total_pnl || 0) >= 0 ? (
                  <TrendingUp color="success" />
                ) : (
                  <TrendingDown color="error" />
                )}
                <Typography color="textSecondary" variant="body2">
                  P&L Total
                </Typography>
              </Box>
              <Typography
                variant="h4"
                color={(summary.total_pnl || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                {(summary.total_pnl || 0) >= 0 ? '+' : ''}${(summary.total_pnl || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {(((summary.total_pnl || 0) / ((summary.total_value || 0) - (summary.total_pnl || 0))) * 100).toFixed(2)}% ROI
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Speed color="warning" />
                <Typography color="textSecondary" variant="body2">
                  Tasa de Éxito
                </Typography>
              </Box>
              <Typography variant="h4">
                {successRatePercent.toFixed(1)}%
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={successRatePercent}
                  color={successRatePercent >= 70 ? 'success' : successRatePercent >= 50 ? 'warning' : 'error'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {successRatePercent >= 70 ? 'Excelente' : successRatePercent >= 50 ? 'Bueno' : 'Necesita mejora'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AutotraderStats;