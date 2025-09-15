import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Chip,
  Tooltip,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Security,
  TrendingDown,
  TrendingUp,
  Speed,
  Assessment,
  ExpandMore,
  ExpandLess,
  Calculate,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { CryptoRiskManagement as CryptoRiskData } from '../../types';

interface CryptoRiskManagementProps {
  symbol: string;
  currentPrice?: number;
  atrValue?: number;
  volatility?: number;
  btcCorrelation?: number;
  onRiskConfigChange?: (config: any) => void;
  initialConfig?: Partial<CryptoRiskData>;
}

const CryptoRiskManagement: React.FC<CryptoRiskManagementProps> = ({
  symbol,
  currentPrice = 0,
  atrValue = 0.05,
  volatility = 0.03,
  btcCorrelation = 0.7,
  onRiskConfigChange,
  initialConfig
}) => {
  const [expanded, setExpanded] = useState(false);
  const [config, setConfig] = useState({
    positionSizePercent: initialConfig?.position_sizing?.recommended_size || 10,
    useATRStops: true,
    atrMultiplier: 2.0,
    trailingStopEnabled: true,
    trailingStopPercent: 3.0,
    takeProfitLevels: [
      { percentage: 15, closePercent: 50 },
      { percentage: 30, closePercent: 30 },
      { percentage: 50, closePercent: 20 }
    ],
    trailingProfitEnabled: false,
    maxRiskPercent: 2.0,
    correlationAdjustment: true,
  });

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onRiskConfigChange?.(newConfig);
  };

  const calculateStopLoss = () => {
    if (!currentPrice) return 0;
    
    if (config.useATRStops) {
      return currentPrice - (atrValue * config.atrMultiplier * currentPrice);
    } else {
      return currentPrice * (1 - config.trailingStopPercent / 100);
    }
  };

  const calculatePositionSize = () => {
    const baseSize = config.positionSizePercent;
    
    // Adjust for volatility
    const volatilityAdjustment = volatility > 0.05 ? 0.7 : volatility > 0.03 ? 0.85 : 1.0;
    
    // Adjust for BTC correlation (higher correlation = more risk)
    const correlationAdjustment = config.correlationAdjustment ? 
      (1 - Math.abs(btcCorrelation) * 0.3) : 1.0;
    
    return Math.max(1, baseSize * volatilityAdjustment * correlationAdjustment);
  };

  const getRiskLevel = () => {
    const totalRisk = (calculatePositionSize() / 100) * (config.maxRiskPercent / 100);
    
    if (totalRisk <= 0.01) return { level: 'LOW', color: '#22c55e' };
    if (totalRisk <= 0.02) return { level: 'MEDIUM', color: '#eab308' };
    if (totalRisk <= 0.03) return { level: 'HIGH', color: '#f97316' };
    return { level: 'EXTREME', color: '#ef4444' };
  };

  const getATRRiskColor = () => {
    if (atrValue <= 0.02) return '#22c55e'; // Low risk
    if (atrValue <= 0.05) return '#eab308'; // Medium risk
    return '#ef4444'; // High risk
  };

  const getBTCCorrelationRisk = () => {
    const absCorr = Math.abs(btcCorrelation);
    if (absCorr <= 0.3) return { level: 'LOW', color: '#22c55e' };
    if (absCorr <= 0.6) return { level: 'MEDIUM', color: '#eab308' };
    return { level: 'HIGH', color: '#ef4444' };
  };

  const riskAssessment = getRiskLevel();
  const corrRisk = getBTCCorrelationRisk();
  const stopLossPrice = calculateStopLoss();
  const adjustedPositionSize = calculatePositionSize();
  const potentialLoss = currentPrice ? ((currentPrice - stopLossPrice) / currentPrice) * 100 : 0;

  return (
    <Card sx={{ bgcolor: 'grey.900', border: '1px solid', borderColor: 'warning.main' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Security sx={{ color: 'warning.main' }} />
            <Typography variant="h6">
              Risk Management - {symbol}
            </Typography>
            <Chip
              label={`${riskAssessment.level} RISK`}
              sx={{ 
                color: riskAssessment.color,
                borderColor: riskAssessment.color
              }}
              variant="outlined"
              size="small"
            />
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {/* Quick Summary */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap">
          <Tooltip title="Adjusted for crypto volatility and BTC correlation">
            <Chip
              icon={<Calculate />}
              label={`Position Size: ${adjustedPositionSize.toFixed(1)}%`}
              color="primary"
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="ATR-based dynamic stop loss">
            <Chip
              label={`Stop Loss: $${stopLossPrice.toFixed(6)} (-${potentialLoss.toFixed(1)}%)`}
              sx={{ 
                color: getATRRiskColor(),
                borderColor: getATRRiskColor()
              }}
              variant="outlined"
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="BTC correlation risk adjustment">
            <Chip
              label={`BTC Corr: ${(btcCorrelation * 100).toFixed(0)}% (${corrRisk.level})`}
              sx={{ 
                color: corrRisk.color,
                borderColor: corrRisk.color
              }}
              variant="outlined"
              size="small"
            />
          </Tooltip>
        </Box>

        {/* Expanded Configuration */}
        <Collapse in={expanded}>
          <Box>
            <Box display="flex" gap={3} flexWrap="wrap">
              {/* Position Sizing */}
              <Box flex="1" minWidth="400px">
                <Card variant="outlined" sx={{ bgcolor: 'grey.800', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    📊 Position Sizing (Crypto-Optimized)
                  </Typography>
                  
                  <Box mb={3}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Base Position Size: {config.positionSizePercent}%
                    </Typography>
                    <Slider
                      value={config.positionSizePercent}
                      onChange={(_, value) => handleConfigChange('positionSizePercent', value)}
                      min={1}
                      max={25}
                      step={0.5}
                      marks={[
                        { value: 5, label: '5%' },
                        { value: 10, label: '10%' },
                        { value: 15, label: '15%' },
                        { value: 20, label: '20%' }
                      ]}
                      valueLabelDisplay="auto"
                      sx={{ color: 'primary.main' }}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.correlationAdjustment}
                        onChange={(e) => handleConfigChange('correlationAdjustment', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="BTC Correlation Adjustment"
                  />

                  <Box mt={2} p={2} bgcolor="info.dark" borderRadius={1}>
                    <Typography variant="caption" color="info.contrastText">
                      <strong>Adjusted Size:</strong> {adjustedPositionSize.toFixed(1)}% 
                      (Volatility: {volatility > 0.05 ? '30%' : volatility > 0.03 ? '15%' : '0%'} reduction, 
                      BTC Corr: {Math.abs(btcCorrelation * 30).toFixed(0)}% reduction)
                    </Typography>
                  </Box>
                </Card>
              </Box>

              {/* Stop Loss Configuration */}
              <Box flex="1" minWidth="400px">
                <Card variant="outlined" sx={{ bgcolor: 'grey.800', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    🛡️ Stop Loss Strategy
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.useATRStops}
                        onChange={(e) => handleConfigChange('useATRStops', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Use ATR-Based Stops"
                  />

                  {config.useATRStops && (
                    <Box mt={2}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        ATR Multiplier: {config.atrMultiplier}x
                      </Typography>
                      <Slider
                        value={config.atrMultiplier}
                        onChange={(_, value) => handleConfigChange('atrMultiplier', value)}
                        min={1.0}
                        max={4.0}
                        step={0.1}
                        marks={[
                          { value: 1.5, label: '1.5x' },
                          { value: 2.0, label: '2.0x' },
                          { value: 2.5, label: '2.5x' },
                          { value: 3.0, label: '3.0x' }
                        ]}
                        valueLabelDisplay="auto"
                        sx={{ color: 'error.main' }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        Current ATR: {(atrValue * 100).toFixed(2)}% • Stop: ${stopLossPrice.toFixed(6)}
                      </Typography>
                    </Box>
                  )}

                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.trailingStopEnabled}
                          onChange={(e) => handleConfigChange('trailingStopEnabled', e.target.checked)}
                          color="success"
                        />
                      }
                      label="Trailing Stop"
                    />
                    
                    {config.trailingStopEnabled && (
                      <TextField
                        label="Trailing %"
                        type="number"
                        value={config.trailingStopPercent}
                        onChange={(e) => handleConfigChange('trailingStopPercent', parseFloat(e.target.value) || 3.0)}
                        size="small"
                        sx={{ mt: 1, width: '100px' }}
                        InputProps={{ endAdornment: '%' }}
                      />
                    )}
                  </Box>
                </Card>
              </Box>
            </Box>

            {/* Take Profit Strategy - Full width */}
            <Box mt={3}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.800', p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  🎯 Take Profit Levels (Multi-Level Exit)
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                  {config.takeProfitLevels.map((level, index) => (
                    <Box key={index} flex="1" minWidth="200px">
                        <Box border="1px solid" borderColor="success.main" borderRadius={1} p={2}>
                          <Typography variant="caption" color="success.main" fontWeight="bold">
                            Level {index + 1}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <TextField
                              label="Profit %"
                              type="number"
                              value={level.percentage}
                              onChange={(e) => {
                                const newLevels = [...config.takeProfitLevels];
                                newLevels[index].percentage = parseFloat(e.target.value) || 0;
                                handleConfigChange('takeProfitLevels', newLevels);
                              }}
                              size="small"
                              sx={{ width: '80px' }}
                            />
                            <TextField
                              label="Close %"
                              type="number"
                              value={level.closePercent}
                              onChange={(e) => {
                                const newLevels = [...config.takeProfitLevels];
                                newLevels[index].closePercent = parseFloat(e.target.value) || 0;
                                handleConfigChange('takeProfitLevels', newLevels);
                              }}
                              size="small"
                              sx={{ width: '80px' }}
                            />
                          </Box>
                          {currentPrice > 0 && (
                            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                              Target: ${(currentPrice * (1 + level.percentage / 100)).toFixed(6)}
                            </Typography>
                          )}
                        </Box>
                    </Box>
                  ))}
                </Box>

                  <Box mt={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.trailingProfitEnabled}
                          onChange={(e) => handleConfigChange('trailingProfitEnabled', e.target.checked)}
                          color="success"
                        />
                      }
                      label="Trailing Take Profit (Lock in gains)"
                    />
                  </Box>
                </Card>
            </Box>

            {/* Risk Assessment - Full width */}
            <Box mt={3}>
              <Card variant="outlined" sx={{ bgcolor: 'grey.800', p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  ⚠️ Risk Assessment Summary
                </Typography>
                
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Box flex="1" minWidth="150px" textAlign="center" p={2} bgcolor="primary.dark" borderRadius={1}>
                    <Typography variant="h6" color="primary.contrastText">
                      {adjustedPositionSize.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="primary.contrastText">
                      Adjusted Position Size
                    </Typography>
                  </Box>
                  
                  <Box flex="1" minWidth="150px" textAlign="center" p={2} bgcolor="error.dark" borderRadius={1}>
                    <Typography variant="h6" color="error.contrastText">
                      -{potentialLoss.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="error.contrastText">
                      Max Loss per Trade
                    </Typography>
                  </Box>
                  
                  <Box flex="1" minWidth="150px" textAlign="center" p={2} bgcolor="warning.dark" borderRadius={1}>
                    <Typography variant="h6" color="warning.contrastText">
                      {(atrValue * 100).toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="warning.contrastText">
                      Current ATR
                    </Typography>
                  </Box>
                  
                  <Box flex="1" minWidth="150px" textAlign="center" p={2} bgcolor="info.dark" borderRadius={1}>
                    <Typography variant="h6" color="info.contrastText">
                      {(Math.abs(btcCorrelation) * 100).toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="info.contrastText">
                      BTC Correlation
                    </Typography>
                  </Box>
                </Box>

                  {/* Risk Alerts */}
                  <Box mt={2}>
                    {potentialLoss > 5 && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          ⚠️ High potential loss per trade ({potentialLoss.toFixed(1)}%). 
                          Consider tighter stops or smaller position size.
                        </Typography>
                      </Alert>
                    )}
                    
                    {Math.abs(btcCorrelation) > 0.8 && (
                      <Alert severity="info" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          📊 High BTC correlation ({(btcCorrelation * 100).toFixed(0)}%). 
                          This crypto moves closely with Bitcoin - consider BTC exposure in portfolio.
                        </Typography>
                      </Alert>
                    )}
                    
                    {volatility > 0.06 && (
                      <Alert severity="error">
                        <Typography variant="body2">
                          🌪️ Extreme volatility ({(volatility * 100).toFixed(1)}%). 
                          High risk asset - position size automatically reduced.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Card>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" gap={2} mt={3} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  // Reset to defaults
                  setConfig({
                    positionSizePercent: 10,
                    useATRStops: true,
                    atrMultiplier: 2.0,
                    trailingStopEnabled: true,
                    trailingStopPercent: 3.0,
                    takeProfitLevels: [
                      { percentage: 15, closePercent: 50 },
                      { percentage: 30, closePercent: 30 },
                      { percentage: 50, closePercent: 20 }
                    ],
                    trailingProfitEnabled: false,
                    maxRiskPercent: 2.0,
                    correlationAdjustment: true,
                  });
                }}
              >
                Reset to Defaults
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => onRiskConfigChange?.(config)}
                startIcon={<CheckCircle />}
              >
                Apply Risk Settings
              </Button>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default CryptoRiskManagement;