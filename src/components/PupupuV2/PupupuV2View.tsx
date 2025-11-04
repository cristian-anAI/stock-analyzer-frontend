import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { pupupuV2Service } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import { MarketStatusCard } from './MarketStatusCard';
import { SignalAlertBox } from './SignalAlertBox';
import { ActiveLevelsTable } from './ActiveLevelsTable';
import { VolumeProfileCard } from './VolumeProfileCard';
import { MarketFiltersIndicator } from './MarketFiltersIndicator';
import { SignalHistoryTable } from './SignalHistoryTable';
import { BacktestMetricsCard } from './BacktestMetricsCard';
import { StatisticsCard } from './StatisticsCard';
import { CurrentAnalysis, SignalHistoryItem, BacktestSummary, BotStatistics } from '../../types';

export const PupupuV2View: React.FC = () => {
  // Configuration state
  const [accountBalance] = useState(10000);
  const [riskPerTrade] = useState(0.02);
  const [autoRefresh] = useState(true);

  // Data state
  const [currentAnalysis, setCurrentAnalysis] = useState<CurrentAnalysis | null>(null);
  const [signalHistory, setSignalHistory] = useState<SignalHistoryItem[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestSummary | null>(null);
  const [statistics, setStatistics] = useState<BotStatistics | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedSignals, setDismissedSignals] = useState<string[]>([]);
  const [showSignalAlert, setShowSignalAlert] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);

  // Fetch current analysis
  const fetchCurrentAnalysis = async () => {
    try {
      const data = await pupupuV2Service.getCurrentAnalysis(accountBalance, riskPerTrade);
      setCurrentAnalysis(data);

      // Check if new signal appeared
      if (data.signal && !dismissedSignals.includes(data.signal.timestamp || '')) {
        setShowSignalAlert(true);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching current analysis:', err);
      setError(err.message || 'Failed to fetch current analysis');
    } finally {
      setLoading(false);
    }
  };

  // Fetch signal history
  const fetchSignalHistory = async () => {
    try {
      const data = await pupupuV2Service.getLatestSignals(20);
      setSignalHistory(data.signals || []);
    } catch (err: any) {
      console.error('Error fetching signal history:', err);
    }
  };

  // Fetch backtest results
  const fetchBacktestResults = async () => {
    try {
      const data = await pupupuV2Service.getBacktestSummary();
      setBacktestResults(data);
    } catch (err: any) {
      console.error('Error fetching backtest results:', err);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const data = await pupupuV2Service.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      console.error('Error fetching statistics:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCurrentAnalysis(),
        fetchSignalHistory(),
        fetchBacktestResults(),
        fetchStatistics(),
      ]);
      setLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup polling for current analysis (every 60 seconds)
  usePolling(fetchCurrentAnalysis, {
    interval: 60000,
    enabled: autoRefresh,
  });

  // Handlers
  const handleDismissSignal = () => {
    if (currentAnalysis?.signal?.timestamp) {
      setDismissedSignals([...dismissedSignals, currentAnalysis.signal.timestamp]);
    }
    setShowSignalAlert(false);
  };

  const handleExecuteSignal = () => {
    // Open Binance in new tab
    window.open('https://www.binance.com/en/trade/BTC_USDT', '_blank');
    setShowSignalAlert(false);
  };

  const handleStartMonitoring = async () => {
    setMonitoringLoading(true);
    try {
      await pupupuV2Service.startMonitoring();
      await fetchStatistics();
    } catch (err: any) {
      console.error('Error starting monitoring:', err);
      setError('Failed to start monitoring');
    } finally {
      setMonitoringLoading(false);
    }
  };

  const handleStopMonitoring = async () => {
    setMonitoringLoading(true);
    try {
      await pupupuV2Service.stopMonitoring();
      await fetchStatistics();
    } catch (err: any) {
      console.error('Error stopping monitoring:', err);
      setError('Failed to stop monitoring');
    } finally {
      setMonitoringLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !currentAnalysis) {
    return (
      <Box>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  const hasActiveSignal = currentAnalysis?.signal && !dismissedSignals.includes(currentAnalysis.signal.timestamp || '');

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
        BTC/USDT Scalping - 5 Minute Timeframe
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Top Section: Market Status + Signal Alert or Backtest Metrics */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Box flex="1" minWidth="300px">
          {currentAnalysis && (
            <MarketStatusCard
              currentPrice={currentAnalysis.current_price}
              currentEma={currentAnalysis.current_ema}
              priceVsEma={currentAnalysis.price_vs_ema}
              distanceFromEmaPct={currentAnalysis.distance_from_ema_pct}
              htTrend={currentAnalysis.market_filters.ht_trend}
              lastUpdate={currentAnalysis.timestamp}
            />
          )}
        </Box>

        <Box flex="1" minWidth="400px">
          {hasActiveSignal ? (
            <SignalAlertBox
              signal={currentAnalysis.signal!}
              onDismiss={handleDismissSignal}
              onExecute={handleExecuteSignal}
            />
          ) : (
            backtestResults && (
              <BacktestMetricsCard backtest={backtestResults} />
            )
          )}
        </Box>
      </Box>

      {/* Middle Section: 3 Column Layout */}
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <Box flex="1" minWidth="300px">
          {currentAnalysis && (
            <ActiveLevelsTable
              resistances={currentAnalysis.active_resistances}
              supports={currentAnalysis.active_supports}
            />
          )}
        </Box>

        <Box flex="1" minWidth="250px">
          {currentAnalysis && (
            <VolumeProfileCard
              volumeProfile={currentAnalysis.volume_profile}
              currentPrice={currentAnalysis.current_price}
            />
          )}
        </Box>

        <Box flex="1" minWidth="250px" display="flex" flexDirection="column" gap={2}>
          {currentAnalysis && (
            <MarketFiltersIndicator filters={currentAnalysis.market_filters} />
          )}
          {statistics && (
            <StatisticsCard
              statistics={statistics}
              onStartMonitoring={handleStartMonitoring}
              onStopMonitoring={handleStopMonitoring}
              loading={monitoringLoading}
            />
          )}
        </Box>
      </Box>

      {/* Bottom Section: Signal History */}
      {signalHistory.length > 0 && (
        <Box mb={2}>
          <SignalHistoryTable signals={signalHistory} />
        </Box>
      )}

      {/* Snackbar for new signals */}
      <Snackbar
        open={!!(showSignalAlert && hasActiveSignal)}
        autoHideDuration={null}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="warning" onClose={() => setShowSignalAlert(false)}>
          🚨 New Trade Signal Available!
        </Alert>
      </Snackbar>
    </Box>
  );
};
