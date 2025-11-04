import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { pupupuV3Service } from '../../services/api';
import {
  PupupuV3CurrentAnalysis,
  PupupuV3Statistics,
  PupupuV3BacktestComparison,
  PupupuV3ActiveTrade,
  PupupuV3PendingTrade,
  PupupuV3SignalHistory,
} from '../../types';
import { CurrentSignalCard } from './CurrentSignalCard';
import { MLPredictionCard } from './MLPredictionCard';
import { BacktestComparisonChart } from './BacktestComparisonChart';
import { StatisticsPanel } from './StatisticsPanel';
import { ActiveTradesPanel } from './ActiveTradesPanel';
import { RecentSignalsTable } from './RecentSignalsTable';
import { IndicatorsCard } from './IndicatorsCard';
import { ActivePivotsCard } from './ActivePivotsCard';
import { SignalConditionsCard } from './SignalConditionsCard';
import { PendingOrdersPanel } from './PendingOrdersPanel';

const PupupuV3View: React.FC = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<PupupuV3CurrentAnalysis | null>(null);
  const [statistics, setStatistics] = useState<PupupuV3Statistics | null>(null);
  const [backtestResults, setBacktestResults] = useState<PupupuV3BacktestComparison | null>(null);
  const [pendingTrades, setPendingTrades] = useState<PupupuV3PendingTrade[]>([]);
  const [activeTrades, setActiveTrades] = useState<PupupuV3ActiveTrade[]>([]);
  const [recentSignals, setRecentSignals] = useState<PupupuV3SignalHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAllData = async () => {
    try {
      setError(null);
      const [analysisData, statsData, backtestData, pendingData, tradesData, signalsData] = await Promise.all([
        pupupuV3Service.getCurrentAnalysis('BTC/USDT'),
        pupupuV3Service.getStatistics(30),
        pupupuV3Service.getBacktestResults(),
        pupupuV3Service.getPendingTrades(),
        pupupuV3Service.getActiveTrades(),
        pupupuV3Service.getRecentSignals(50),
      ]);

      setCurrentAnalysis(analysisData);
      setStatistics(statsData);
      setBacktestResults(backtestData);
      setPendingTrades(pendingData.pending_trades || []);
      setActiveTrades(tradesData.active_trades || []);
      setRecentSignals(signalsData.signals || []);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || 'Error fetching PupupuV3 data');
      console.error('Error fetching PupupuV3 data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !currentAnalysis) {
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
          Error loading PupupuV3 data: {error}
        </Alert>
        <Button onClick={fetchAllData} variant="contained" startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2">
          ⚡ PupupuV3 Scalping (1-min)
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Last update: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchAllData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Main Dashboard Grid */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Left Column - Signal & ML Prediction */}
        <Box flex="1" minWidth="400px" display="flex" flexDirection="column" gap={2}>
          <CurrentSignalCard analysis={currentAnalysis} />
          <MLPredictionCard prediction={currentAnalysis?.ml_prediction || null} />
          <IndicatorsCard
            indicators={currentAnalysis?.indicators || null}
            currentPrice={currentAnalysis?.current_price || 0}
          />
        </Box>

        {/* Right Column - Stats, Pending & Active Trades */}
        <Box flex="1" minWidth="350px" display="flex" flexDirection="column" gap={2}>
          <StatisticsPanel statistics={statistics} />
          {pendingTrades.length > 0 && (
            <PendingOrdersPanel
              pendingTrades={pendingTrades}
              currentPrice={currentAnalysis?.current_price || 0}
            />
          )}
          {activeTrades.length > 0 && <ActiveTradesPanel trades={activeTrades} />}
          <SignalConditionsCard
            conditions={currentAnalysis?.signal_conditions || null}
            hasSignal={!!currentAnalysis?.signal}
          />
        </Box>
      </Box>

      {/* Full Width - Active Pivots */}
      <Box mt={3}>
        <ActivePivotsCard
          activeResistances={currentAnalysis?.active_resistances || []}
          activeSupports={currentAnalysis?.active_supports || []}
          currentPrice={currentAnalysis?.current_price || 0}
        />
      </Box>

      {/* Full Width - Backtest Comparison */}
      <Box mt={3}>
        <BacktestComparisonChart results={backtestResults} />
      </Box>

      {/* Full Width - Recent Signals Table */}
      <Box mt={3}>
        <RecentSignalsTable signals={recentSignals} />
      </Box>
    </Box>
  );
};

export default PupupuV3View;
