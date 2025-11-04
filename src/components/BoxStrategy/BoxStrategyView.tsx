import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { boxStrategyService } from '../../services/api';
import {
  BoxStrategyMarket,
  BoxStrategyDashboard,
  ActiveTradesResponse,
  getConfidenceColor,
  getDirectionColor,
  getRecommendationColor,
  getBoxStatusColor,
} from '../../types';
import { ActiveBoxTradesCard } from './ActiveBoxTradesCard';
import { BoxStrategyStatsCard } from './BoxStrategyStatsCard';

const usePolling = (fetchFunction: () => Promise<any>, interval: number) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const result = await fetchFunction();
      setData(result);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Error fetching data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return { data, loading, error, lastUpdate, refresh: fetchData };
};

const BoxStrategyView: React.FC = () => {
  const [mlVersion] = useState<number>(1);
  const [, setCurrentTime] = useState<Date>(new Date());

  const { data: dashboard, loading, error, lastUpdate, refresh } = usePolling(
    () => boxStrategyService.getDashboard(mlVersion),
    60000 // 1 minute for active trades monitoring
  );

  // Try to fetch active trades, but don't fail if endpoint doesn't exist
  const { data: activeTrades, lastUpdate: activeTradesUpdate } = usePolling(
    async () => {
      try {
        return await boxStrategyService.getActiveTrades();
      } catch (error) {
        console.log('Active trades endpoint not available, using breakouts data');
        return null;
      }
    },
    60000 // 1 minute
  );

  const dashboardData: BoxStrategyDashboard | null = dashboard;
  const activeTradesData: ActiveTradesResponse | null = activeTrades;

  // Convert breakouts to active trades format if active trades endpoint is not available
  const displayTrades = React.useMemo(() => {
    if (activeTradesData?.trades && activeTradesData.trades.length > 0) {
      return activeTradesData.trades;
    }

    // Fallback: convert breakouts to active trades format
    if (dashboardData?.all_breakouts && dashboardData.all_breakouts.length > 0) {
      return dashboardData.all_breakouts.map((breakout: BoxStrategyMarket) => ({
        market: breakout.market,
        direction: breakout.box_setup.direction,
        entry_price: breakout.box_setup.entry_price,
        entry_time: breakout.box_setup.entry_time || breakout.box_setup.breakout_candle_time || '',
        stop_loss: breakout.box_setup.stop_loss,
        current_stop_loss: breakout.box_setup.stop_loss,
        tp1: breakout.box_setup.tp1,
        tp2: breakout.box_setup.tp2,
        tp3: breakout.box_setup.tp3,
        box_high: breakout.box_setup.entry_price,
        box_low: breakout.box_setup.stop_loss,
        box_range: Math.abs(breakout.box_setup.entry_price - breakout.box_setup.stop_loss),
        risk_points: Math.abs(breakout.box_setup.entry_price - breakout.box_setup.stop_loss),
        ml_confidence: breakout.ml_prediction.confidence_level,
        ml_win_probability: breakout.ml_prediction.win_probability * 100,
        tp1_hit: false, // We don't have this data from breakouts
        stop_moved_to_breakeven: false, // We don't have this data from breakouts
        breakout_key: `${breakout.market}_${breakout.box_setup.entry_time || Date.now()}`,
      }));
    }

    return [];
  }, [activeTradesData, dashboardData]);

  // Update current time every minute to refresh "Time in Trade" display
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minute

    return () => clearInterval(timer);
  }, []);

  const formatPrice = (price: number) => (price || 0).toFixed(2);
  const formatPercent = (value: number) => `${((value || 0) * 100).toFixed(1)}%`;
  const formatStatus = (status: string | undefined) =>
    status ? status.replace(/_/g, ' ') : 'N/A';

  const getTimezone = (market: string): string => {
    // Map markets to their timezones
    const timezoneMap: Record<string, string> = {
      'SPX': 'ET',
      'NDX': 'ET',
      'RUT': 'ET',
      'ES': 'ET',
      'NQ': 'ET',
      'YM': 'ET',
    };
    return timezoneMap[market] || 'ET';
  };

  const formatEntryTime = (entryTime?: string, market?: string) => {
    if (!entryTime) return '-';
    try {
      const date = new Date(entryTime);
      const timeString = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const tz = market ? getTimezone(market) : 'ET';
      return `${timeString} ${tz}`;
    } catch {
      return '-';
    }
  };

  const calculateTimeInTrade = (entryTime?: string): string => {
    if (!entryTime) return '-';
    try {
      const entry = new Date(entryTime);
      const now = new Date();
      const diffMs = now.getTime() - entry.getTime();

      if (diffMs < 0) return '-';

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    } catch {
      return '-';
    }
  };

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading Box Strategy data: {error}
        </Alert>
        <Button onClick={refresh} variant="contained" startIcon={<Refresh />}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="info">No Box Strategy data available</Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          📦 Box Strategy Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Active Trades Section */}
      {displayTrades.length > 0 && (
        <Box mb={4}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex="3" minWidth="600px">
              <ActiveBoxTradesCard
                trades={displayTrades}
                lastUpdate={activeTradesUpdate || lastUpdate}
              />
            </Box>
            <Box flex="1" minWidth="300px">
              <BoxStrategyStatsCard dashboard={dashboardData} />
            </Box>
          </Box>
        </Box>
      )}

      {/* Summary Cards */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Card sx={{ flex: '1', minWidth: '250px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Markets
            </Typography>
            <Typography variant="h3" component="div">
              {dashboardData.summary.total_markets}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1', minWidth: '250px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Active Breakouts
            </Typography>
            <Typography variant="h3" component="div" color="primary">
              {dashboardData.summary.breakouts}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1', minWidth: '250px' }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              High Confidence Setups
            </Typography>
            <Typography variant="h3" component="div" color="success.main">
              {dashboardData.summary.high_confidence}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* High Confidence Setups */}
      {dashboardData.high_confidence_setups && dashboardData.high_confidence_setups.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" component="h2" mb={2}>
            🎯 High Confidence Setups
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            {dashboardData.high_confidence_setups.map((setup: BoxStrategyMarket) => {
              if (!setup?.box_setup || !setup?.ml_prediction) return null;

              return (
                <Card key={setup.market} sx={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        {setup.market || 'N/A'} - {setup.name || 'N/A'}
                      </Typography>
                      <Chip
                        icon={setup.box_setup.direction === 'LONG' ? <TrendingUp /> : <TrendingDown />}
                        label={setup.box_setup.direction || 'N/A'}
                        color={getDirectionColor(setup.box_setup.direction)}
                        size="small"
                      />
                    </Box>

                    <Box mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Entry: ${formatPrice(setup.box_setup.entry_price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current: ${formatPrice(setup.box_setup.current_price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Stop Loss: ${formatPrice(setup.box_setup.stop_loss)}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1} mb={2}>
                      <Chip label={`TP1: $${formatPrice(setup.box_setup.tp1)}`} size="small" />
                      <Chip label={`TP2: $${formatPrice(setup.box_setup.tp2)}`} size="small" />
                      <Chip label={`TP3: $${formatPrice(setup.box_setup.tp3)}`} size="small" />
                    </Box>

                    <Box display="flex" gap={1} alignItems="center">
                      <Tooltip title="Win Probability">
                        <Chip
                          label={formatPercent(setup.ml_prediction.win_probability)}
                          color={getConfidenceColor(setup.ml_prediction.confidence_level)}
                          size="small"
                          icon={<CheckCircle />}
                        />
                      </Tooltip>
                      <Chip
                        label={setup.ml_prediction.confidence_level || 'N/A'}
                        color={getConfidenceColor(setup.ml_prediction.confidence_level)}
                        size="small"
                      />
                      <Chip
                        label={setup.ml_prediction.recommendation || 'N/A'}
                        color={getRecommendationColor(setup.ml_prediction.recommendation)}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}

      {/* All Breakouts Table */}
      {dashboardData.all_breakouts && dashboardData.all_breakouts.length > 0 && (
        <Box>
          <Typography variant="h5" component="h2" mb={2}>
            📊 All Breakouts
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Market</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Entry Time</TableCell>
                  <TableCell>Time in Trade</TableCell>
                  <TableCell align="right">Entry Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Stop Loss</TableCell>
                  <TableCell align="right">Win Probability</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Recommendation</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.all_breakouts.map((setup: BoxStrategyMarket) => {
                  if (!setup?.box_setup || !setup?.ml_prediction) return null;

                  return (
                    <TableRow key={setup.market || Math.random()} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {setup.market || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {setup.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={setup.box_setup.direction === 'LONG' ? <TrendingUp /> : <TrendingDown />}
                          label={setup.box_setup.direction || 'N/A'}
                          color={getDirectionColor(setup.box_setup.direction)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatEntryTime(setup.box_setup.entry_time, setup.market)}</TableCell>
                      <TableCell>{calculateTimeInTrade(setup.box_setup.entry_time)}</TableCell>
                      <TableCell align="right">${formatPrice(setup.box_setup.entry_price)}</TableCell>
                      <TableCell align="right">${formatPrice(setup.box_setup.current_price)}</TableCell>
                      <TableCell align="right">${formatPrice(setup.box_setup.stop_loss)}</TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={setup.ml_prediction.win_probability >= 0.7 ? 'success.main' : 'text.primary'}
                          fontWeight="bold"
                        >
                          {formatPercent(setup.ml_prediction.win_probability)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={setup.ml_prediction.confidence_level || 'N/A'}
                          color={getConfidenceColor(setup.ml_prediction.confidence_level)}
                          size="small"
                          icon={
                            setup.ml_prediction.confidence_level === 'HIGH' ? <CheckCircle /> :
                            setup.ml_prediction.confidence_level === 'MEDIUM' ? <Warning /> :
                            <Error />
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={setup.ml_prediction.recommendation || 'N/A'}
                          color={getRecommendationColor(setup.ml_prediction.recommendation)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatStatus(setup.box_setup?.status)}
                          color={getBoxStatusColor(setup.box_setup?.status || 'PENDING')}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* No Breakouts Message */}
      {(!dashboardData.all_breakouts || dashboardData.all_breakouts.length === 0) && (
        <Alert severity="info">
          No active breakouts detected at this time. The system is monitoring all markets for new opportunities.
        </Alert>
      )}
    </Box>
  );
};

export default BoxStrategyView;
