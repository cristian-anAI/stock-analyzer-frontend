import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Refresh,
  Settings,
  Warning,
  CheckCircle,
  Balance,
  ShowChart,
  Timeline,
} from '@mui/icons-material';
import { cryptoMTSSService } from '../../services/api';

interface CryptoPosition {
  symbol: string;
  allocation_percent: number;
  current_value: number;
  target_value: number;
  pnl: number;
  pnl_percent: number;
  mtss_score: number;
  btc_correlation: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  last_rebalance: string;
}

interface PortfolioOptimization {
  total_capital: number;
  invested_amount: number;
  available_cash: number;
  current_positions: number;
  max_positions: number;
  positions: CryptoPosition[];
  diversification_score: number;
  overall_risk: number;
  btc_exposure_percent: number;
  correlation_matrix: Record<string, Record<string, number>>;
  rebalance_needed: boolean;
  rebalance_suggestions: Array<{
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    current_percent: number;
    target_percent: number;
    amount_usd: number;
  }>;
}

interface CryptoPortfolioIntegrationProps {
  totalCapital?: number;
  maxPositions?: number;
  onRebalanceComplete?: () => void;
}

const CryptoPortfolioIntegration: React.FC<CryptoPortfolioIntegrationProps> = ({
  totalCapital = 50000,
  maxPositions = 5,
  onRebalanceComplete
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rebalancing, setRebalancing] = useState(false);
  const [settings, setSettings] = useState({
    riskTolerance: 0.6, // 0 = conservative, 1 = aggressive
    maxSinglePosition: 25, // Max % for single position
    btcMinExposure: 20, // Min BTC exposure %
    correlationThreshold: 0.7, // Max correlation between positions
    rebalanceThreshold: 5, // % deviation before rebalance
    autoRebalance: false
  });

  useEffect(() => {
    fetchPortfolioData();
  }, [totalCapital, maxPositions]);

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const data = await cryptoMTSSService.getCryptoPortfolioOptimization(totalCapital, maxPositions);
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching crypto portfolio data:', error);
      // Mock data for development
      setPortfolio({
        total_capital: totalCapital,
        invested_amount: 42500,
        available_cash: 7500,
        current_positions: 4,
        max_positions: maxPositions,
        positions: [
          {
            symbol: 'BTC',
            allocation_percent: 25,
            current_value: 12500,
            target_value: 12000,
            pnl: 1250,
            pnl_percent: 11.1,
            mtss_score: 7.8,
            btc_correlation: 1.0,
            risk_level: 'MEDIUM',
            last_rebalance: '2024-01-10T10:00:00Z'
          },
          {
            symbol: 'ETH',
            allocation_percent: 20,
            current_value: 10000,
            target_value: 10500,
            pnl: 800,
            pnl_percent: 8.7,
            mtss_score: 8.2,
            btc_correlation: 0.85,
            risk_level: 'MEDIUM',
            last_rebalance: '2024-01-10T10:00:00Z'
          },
          {
            symbol: 'SOL',
            allocation_percent: 15,
            current_value: 7500,
            target_value: 8000,
            pnl: -200,
            pnl_percent: -2.6,
            mtss_score: 6.9,
            btc_correlation: 0.65,
            risk_level: 'HIGH',
            last_rebalance: '2024-01-08T15:30:00Z'
          },
          {
            symbol: 'LINK',
            allocation_percent: 12.5,
            current_value: 6250,
            target_value: 6500,
            pnl: 450,
            pnl_percent: 7.8,
            mtss_score: 7.5,
            btc_correlation: 0.72,
            risk_level: 'MEDIUM',
            last_rebalance: '2024-01-09T09:15:00Z'
          }
        ],
        diversification_score: 0.73,
        overall_risk: 0.68,
        btc_exposure_percent: 25,
        correlation_matrix: {
          'BTC': { 'ETH': 0.85, 'SOL': 0.65, 'LINK': 0.72 },
          'ETH': { 'BTC': 0.85, 'SOL': 0.68, 'LINK': 0.74 },
          'SOL': { 'BTC': 0.65, 'ETH': 0.68, 'LINK': 0.58 },
          'LINK': { 'BTC': 0.72, 'ETH': 0.74, 'SOL': 0.58 }
        },
        rebalance_needed: true,
        rebalance_suggestions: [
          {
            symbol: 'BTC',
            action: 'SELL',
            current_percent: 25,
            target_percent: 24,
            amount_usd: -500
          },
          {
            symbol: 'ETH',
            action: 'BUY',
            current_percent: 20,
            target_percent: 21,
            amount_usd: 500
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRebalance = async () => {
    setRebalancing(true);
    try {
      await cryptoMTSSService.runCryptoRebalance();
      await fetchPortfolioData();
      onRebalanceComplete?.();
    } catch (error) {
      console.error('Error rebalancing portfolio:', error);
    } finally {
      setRebalancing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return '#22c55e';
      case 'MEDIUM': return '#eab308';
      case 'HIGH': return '#f97316';
      case 'EXTREME': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? '#22c55e' : '#ef4444';
  };

  const getDiversificationColor = (score: number) => {
    if (score >= 0.8) return '#22c55e';
    if (score >= 0.6) return '#eab308';
    return '#ef4444';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Box>
          <Typography variant="h6" gutterBottom>
            Loading Crypto Portfolio...
          </Typography>
          <LinearProgress />
        </Box>
      </Box>
    );
  }

  if (!portfolio) {
    return (
      <Alert severity="error">
        Failed to load crypto portfolio data
      </Alert>
    );
  }

  return (
    <Box>
      {/* Portfolio Header */}
      <Card sx={{ mb: 3, bgcolor: 'grey.900', border: '1px solid', borderColor: 'primary.main' }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <AccountBalance sx={{ color: 'primary.main' }} />
              <Typography variant="h5">
                Crypto Portfolio Integration
              </Typography>
              {portfolio.rebalance_needed && (
                <Chip
                  icon={<Warning />}
                  label="Rebalance Needed"
                  color="warning"
                  variant="filled"
                />
              )}
            </Box>
            <Box display="flex" gap={1}>
              <IconButton onClick={() => setSettingsOpen(true)} color="primary">
                <Settings />
              </IconButton>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchPortfolioData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Balance />}
                onClick={handleRebalance}
                disabled={rebalancing || !portfolio.rebalance_needed}
              >
                {rebalancing ? 'Rebalancing...' : 'Rebalance Portfolio'}
              </Button>
            </Box>
          </Box>

          {/* Portfolio Summary */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Box flex="1" minWidth="200px" textAlign="center" p={2} bgcolor="primary.dark" borderRadius={1}>
              <Typography variant="h6" color="primary.contrastText">
                ${portfolio.total_capital.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="primary.contrastText">
                Total Capital
              </Typography>
            </Box>
            
            <Box flex="1" minWidth="200px" textAlign="center" p={2} bgcolor="success.dark" borderRadius={1}>
              <Typography variant="h6" color="success.contrastText">
                ${portfolio.invested_amount.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="success.contrastText">
                Invested Amount
              </Typography>
            </Box>
            
            <Box flex="1" minWidth="200px" textAlign="center" p={2} bgcolor="info.dark" borderRadius={1}>
              <Typography variant="h6" color="info.contrastText">
                {portfolio.current_positions}/{portfolio.max_positions}
              </Typography>
              <Typography variant="caption" color="info.contrastText">
                Positions
              </Typography>
            </Box>
            
            <Box flex="1" minWidth="200px" textAlign="center" p={2} bgcolor="warning.dark" borderRadius={1}>
              <Typography variant="h6" color="warning.contrastText">
                ${portfolio.available_cash.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="warning.contrastText">
                Available Cash
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Box display="flex" gap={3} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="300px">
          <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Diversification Score
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ color: getDiversificationColor(portfolio.diversification_score) }}
                >
                  {(portfolio.diversification_score * 100).toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={portfolio.diversification_score * 100}
                  sx={{ 
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'grey.700',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getDiversificationColor(portfolio.diversification_score)
                    }
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {portfolio.diversification_score >= 0.8 ? 'Excellent diversification' :
                 portfolio.diversification_score >= 0.6 ? 'Good diversification' :
                 'Poor diversification - consider more variety'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚠️ Overall Risk Level
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  sx={{ color: portfolio.overall_risk >= 0.7 ? '#ef4444' : portfolio.overall_risk >= 0.5 ? '#f97316' : '#22c55e' }}
                >
                  {(portfolio.overall_risk * 100).toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={portfolio.overall_risk * 100}
                  color={portfolio.overall_risk >= 0.7 ? 'error' : portfolio.overall_risk >= 0.5 ? 'warning' : 'success'}
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {portfolio.overall_risk >= 0.7 ? 'High risk portfolio' :
                 portfolio.overall_risk >= 0.5 ? 'Moderate risk portfolio' :
                 'Conservative portfolio'}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="300px">
          <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ₿ BTC Exposure
              </Typography>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold"
                  color="primary.main"
                >
                  {portfolio.btc_exposure_percent.toFixed(0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={portfolio.btc_exposure_percent}
                  color="primary"
                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {portfolio.btc_exposure_percent >= 20 ? 'Sufficient BTC hedge' : 'Consider increasing BTC exposure'}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Positions Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Positions
          </Typography>
          
          <TableContainer component={Paper} sx={{ bgcolor: 'grey.900' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">Allocation</TableCell>
                  <TableCell align="right">Current Value</TableCell>
                  <TableCell align="right">Target Value</TableCell>
                  <TableCell align="right">P&L</TableCell>
                  <TableCell align="center">MTSS Score</TableCell>
                  <TableCell align="center">BTC Correlation</TableCell>
                  <TableCell align="center">Risk Level</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {portfolio.positions.map((position) => (
                  <TableRow key={position.symbol} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {position.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {position.allocation_percent.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${position.current_value.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        ${position.target_value.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" gap={1}>
                        {position.pnl >= 0 ? <TrendingUp color="success" fontSize="small" /> : <TrendingDown color="error" fontSize="small" />}
                        <Typography 
                          variant="body2"
                          sx={{ color: getPnLColor(position.pnl) }}
                        >
                          ${Math.abs(position.pnl).toLocaleString()} ({position.pnl_percent >= 0 ? '+' : ''}{position.pnl_percent.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={position.mtss_score.toFixed(1)}
                        color={position.mtss_score >= 7.5 ? 'success' : position.mtss_score >= 6.5 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`${(position.btc_correlation * 100).toFixed(0)}% correlation with BTC`}>
                        <Chip
                          label={`${(position.btc_correlation * 100).toFixed(0)}%`}
                          sx={{ 
                            color: position.btc_correlation >= 0.8 ? '#ef4444' : position.btc_correlation >= 0.6 ? '#f97316' : '#22c55e',
                            borderColor: position.btc_correlation >= 0.8 ? '#ef4444' : position.btc_correlation >= 0.6 ? '#f97316' : '#22c55e'
                          }}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={position.risk_level}
                        sx={{ 
                          color: getRiskColor(position.risk_level),
                          borderColor: getRiskColor(position.risk_level)
                        }}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Rebalance Suggestions */}
      {portfolio.rebalance_needed && portfolio.rebalance_suggestions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔄 Rebalance Suggestions
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Portfolio has drifted from target allocations. Consider rebalancing to optimize risk-adjusted returns.
              </Typography>
            </Alert>

            <Box display="flex" gap={2} flexWrap="wrap">
              {portfolio.rebalance_suggestions.map((suggestion) => (
                <Box key={suggestion.symbol} flex="1" minWidth="250px">
                  <Card variant="outlined" sx={{ bgcolor: 'grey.800', height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">{suggestion.symbol}</Typography>
                        <Chip
                          label={suggestion.action}
                          color={suggestion.action === 'BUY' ? 'success' : suggestion.action === 'SELL' ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Current: {suggestion.current_percent.toFixed(1)}% → Target: {suggestion.target_percent.toFixed(1)}%
                      </Typography>
                      
                      <Typography 
                        variant="h6"
                        sx={{ color: suggestion.amount_usd >= 0 ? '#22c55e' : '#ef4444' }}
                      >
                        {suggestion.amount_usd >= 0 ? '+' : ''}${Math.abs(suggestion.amount_usd).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Portfolio Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Box display="flex" gap={3} flexWrap="wrap" mb={3}>
              <Box flex="1" minWidth="250px">
                <Typography gutterBottom>Risk Tolerance</Typography>
                <Slider
                  value={settings.riskTolerance}
                  onChange={(_, value) => setSettings({ ...settings, riskTolerance: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0.2, label: 'Conservative' },
                    { value: 0.6, label: 'Moderate' },
                    { value: 0.9, label: 'Aggressive' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Box flex="1" minWidth="250px">
                <Typography gutterBottom>Max Single Position (%)</Typography>
                <Slider
                  value={settings.maxSinglePosition}
                  onChange={(_, value) => setSettings({ ...settings, maxSinglePosition: value as number })}
                  min={10}
                  max={40}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Box>

            <Box display="flex" gap={3} flexWrap="wrap" mb={3}>
              <Box flex="1" minWidth="250px">
                <Typography gutterBottom>Min BTC Exposure (%)</Typography>
                <Slider
                  value={settings.btcMinExposure}
                  onChange={(_, value) => setSettings({ ...settings, btcMinExposure: value as number })}
                  min={0}
                  max={50}
                  step={5}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>

              <Box flex="1" minWidth="250px">
                <Typography gutterBottom>Rebalance Threshold (%)</Typography>
                <Slider
                  value={settings.rebalanceThreshold}
                  onChange={(_, value) => setSettings({ ...settings, rebalanceThreshold: value as number })}
                  min={2}
                  max={15}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRebalance}
                    onChange={(e) => setSettings({ ...settings, autoRebalance: e.target.checked })}
                  />
                }
                label="Enable Automatic Rebalancing"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          <Button onClick={() => setSettingsOpen(false)} variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CryptoPortfolioIntegration;