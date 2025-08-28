import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { ManualPosition, PositionAnalysis } from '../../types';
import PositionAlertsManager from './PositionAlertsManager';
import PositionCharts from './PositionCharts';
import { positionService } from '../../services/api';

interface RealAnalysisData {
  symbol: string;
  current_price: number;
  entry_price: number;
  quantity: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  technical_indicators: {
    rsi: number;
    macd: number;
    macd_signal: string;
    ma_20: number;
    ma_50: number;
    ma_200: number;
    bollinger_upper: number;
    bollinger_lower: number;
  };
  exit_strategies: {
    stop_loss: number;
    take_profit: number;
    partial_profit: number;
    trailing_stop: number;
  };
  risk_metrics: {
    risk_reward_ratio: number;
    position_size_percent: number;
    days_held: number;
    volatility: number;
  };
  recommendation: {
    action: string;
    confidence: number;
    reasons: string[];
  };
  analysis_timestamp: string;
}

interface PositionDetailModalProps {
  position: ManualPosition;
  open: boolean;
  onClose: () => void;
  analysisData?: PositionAnalysis | null;
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`position-tabpanel-${index}`}
      aria-labelledby={`position-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PositionDetailModal: React.FC<PositionDetailModalProps> = ({
  position,
  open,
  onClose,
  analysisData,
  loading = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [alertsManagerOpen, setAlertsManagerOpen] = useState(false);
  const [realAnalysisData, setRealAnalysisData] = useState<RealAnalysisData | null>(null);
  const [realDataLoading, setRealDataLoading] = useState(false);

  // Fetch real analysis data when modal opens
  React.useEffect(() => {
    if (open && position.symbol) {
      fetchRealAnalysisData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, position.symbol]);

  const fetchRealAnalysisData = async () => {
    try {
      setRealDataLoading(true);
      const [technicalData, fundamentalData] = await Promise.all([
        positionService.getManualPositionAnalysis(position.symbol),
        positionService.getPositionAnalysis(position.symbol)
      ]);
      
      setRealAnalysisData(technicalData);
      console.log('Real technical data:', technicalData);
      console.log('Fundamental data (mock):', fundamentalData);
    } catch (error) {
      console.error('Error fetching real analysis data:', error);
    } finally {
      setRealDataLoading(false);
    }
  };

  // Use real data when available, fallback to mock
  const currentPrice = realAnalysisData?.current_price || analysisData?.technical?.movingAverages?.currentPrice || 150.25;
  const actualPnL = realAnalysisData?.unrealized_pnl || ((position.quantity * currentPrice) - (position.quantity * position.entryPrice));
  const actualPnLPercent = realAnalysisData?.unrealized_pnl_percent || (((currentPrice - position.entryPrice) / position.entryPrice) * 100);
  const lastUpdated = realAnalysisData?.analysis_timestamp || analysisData?.lastUpdated || new Date().toISOString();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getRSIColor = (rsi: number) => {
    if (rsi > 70) return 'error';
    if (rsi < 30) return 'success';
    return 'warning';
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_HOLD': return 'success';
      case 'HOLD': return 'warning';
      case 'SELL': return 'error';
      default: return 'primary';
    }
  };

  // Use real technical data when available
  const technicalData = realAnalysisData?.technical_indicators ? {
    rsi: realAnalysisData.technical_indicators.rsi,
    macd: { 
      value: realAnalysisData.technical_indicators.macd, 
      signal: realAnalysisData.technical_indicators.macd_signal as any, 
      histogram: 0.5 
    },
    bollinger: { 
      position: currentPrice > realAnalysisData.technical_indicators.bollinger_upper ? 'upper_band' as const : 'middle' as const, 
      percentage: 78, 
      squeeze: false 
    },
    volume: { status: 'above_average' as const, percentage: 125, trend: 'increasing' as const },
    movingAverages: { 
      ma20: realAnalysisData.technical_indicators.ma_20, 
      ma50: realAnalysisData.technical_indicators.ma_50, 
      ma200: realAnalysisData.technical_indicators.ma_200, 
      currentPrice 
    },
  } : (analysisData?.technical || {
    rsi: 65,
    macd: { value: 2.5, signal: 'bullish' as const, histogram: 0.5 },
    bollinger: { position: 'upper_band' as const, percentage: 78, squeeze: false },
    volume: { status: 'above_average' as const, percentage: 125, trend: 'increasing' as const },
    movingAverages: { ma20: 148.50, ma50: 145.30, ma200: 140.00, currentPrice },
  });

  const recommendation = realAnalysisData?.recommendation?.action || analysisData?.recommendation || 'STRONG_HOLD';

  // Use real fundamental data or fallback to mock data
  const fundamentalData = analysisData?.fundamental || {
    newsSentiment: 0.7,
    earningsDate: '2024-01-15',
    earningsProximity: 5,
    sectorPerformance: 2.3,
    analystRating: 'buy' as const,
    priceTarget: 175.00,
    recentAlerts: [],
  };

  const exitStrategies = realAnalysisData?.exit_strategies ? {
    stopLoss: { 
      price: realAnalysisData.exit_strategies.stop_loss, 
      distance: ((position.entryPrice - realAnalysisData.exit_strategies.stop_loss) / position.entryPrice) * 100, 
      reason: 'Technical support level' 
    },
    takeProfit: { 
      price: realAnalysisData.exit_strategies.take_profit, 
      upside: ((realAnalysisData.exit_strategies.take_profit - position.entryPrice) / position.entryPrice) * 100, 
      confidence: realAnalysisData.recommendation?.confidence || 85 
    },
    partialProfit: { 
      price: realAnalysisData.exit_strategies.partial_profit, 
      percentage: 50, 
      action: 'Reduce position size' 
    },
  } : (analysisData?.exitStrategies || {
    stopLoss: { price: position.entryPrice * 0.95, distance: 5.0, reason: 'Technical support level' },
    takeProfit: { price: position.entryPrice * 1.15, upside: 15.0, confidence: 85 },
    partialProfit: { price: position.entryPrice * 1.08, percentage: 50, action: 'Reduce position size' },
  });

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div">
              {position.symbol}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {position.name}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={1}>
              <Chip
                label={`${actualPnL >= 0 ? '+' : ''}$${actualPnL.toFixed(2)}`}
                color={actualPnL >= 0 ? 'success' : 'error'}
                variant="filled"
              />
              <Chip
                label={`${actualPnLPercent >= 0 ? '+' : ''}${actualPnLPercent.toFixed(2)}%`}
                color={actualPnLPercent >= 0 ? 'success' : 'error'}
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Actualizado: {new Date(lastUpdated).toLocaleString()}
                {realAnalysisData && (
                  <Chip label="Datos Reales" color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {(loading || realDataLoading) ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <Box textAlign="center">
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2 }}>
                {realDataLoading ? 'Cargando análisis real...' : 'Cargando...'}
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Análisis Técnico" />
                <Tab label="Exit Strategies" />
                <Tab label="Contexto Fundamental" />
                <Tab label="Charts" />
              </Tabs>
            </Box>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <Chip
                label={recommendation.replace('_', ' ')}
                color={getRecommendationColor(recommendation)}
                variant="filled"
                size="medium"
              />
              {realAnalysisData && (
                <Chip 
                  label="Datos Reales" 
                  color="success" 
                  size="small" 
                  variant="outlined"
                />
              )}
              {!realAnalysisData && (
                <Chip 
                  label="Datos Mock" 
                  color="warning" 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>

            <Box display="flex" gap={2} flexWrap="wrap">
              <Card sx={{ minWidth: 200 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">RSI</Typography>
                    <Box position="relative" display="inline-flex">
                      <CircularProgress
                        variant="determinate"
                        value={technicalData.rsi}
                        color={getRSIColor(technicalData.rsi)}
                        size={60}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="caption" component="div" color="text.secondary">
                          {technicalData.rsi}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">MACD</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      {technicalData.macd.signal === 'bullish' ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                      <Typography variant="body2">
                        {technicalData.macd.value}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {technicalData.macd.signal}
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200 }}>
                <CardContent>
                  <Typography variant="h6">Bollinger Bands</Typography>
                  <Box mt={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={technicalData.bollinger.percentage} 
                      color="info"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {technicalData.bollinger.position} - {technicalData.bollinger.percentage}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ minWidth: 200 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">Volume</Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BarChartIcon color="primary" />
                      <Typography variant="body2">
                        {technicalData.volume.percentage}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {technicalData.volume.status}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Precio vs Medias Móviles
                </Typography>
                <Box display="flex" gap={3}>
                  <Box>
                    <Typography variant="body2">Precio actual: ${currentPrice}</Typography>
                    <Typography 
                      variant="body2" 
                      color={currentPrice > technicalData.movingAverages.ma20 ? 'success.main' : 'error.main'}
                    >
                      MA20: ${technicalData.movingAverages.ma20} 
                      ({currentPrice > technicalData.movingAverages.ma20 ? 'Arriba' : 'Abajo'})
                    </Typography>
                    <Typography 
                      variant="body2"
                      color={currentPrice > technicalData.movingAverages.ma50 ? 'success.main' : 'error.main'}
                    >
                      MA50: ${technicalData.movingAverages.ma50} 
                      ({currentPrice > technicalData.movingAverages.ma50 ? 'Arriba' : 'Abajo'})
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="error">Stop Loss</Typography>
                    <Typography variant="h5">${exitStrategies.stopLoss.price.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distancia: -{exitStrategies.stopLoss.distance.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {exitStrategies.stopLoss.reason}
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<NotificationsIcon />}
                    onClick={() => setAlertsManagerOpen(true)}
                  >
                    Set Alert
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="success.main">Take Profit</Typography>
                    <Typography variant="h5">${exitStrategies.takeProfit.price.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ganancia potencial: +{exitStrategies.takeProfit.upside.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Confianza: {exitStrategies.takeProfit.confidence}%
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="success" 
                    startIcon={<CheckCircleIcon />}
                    onClick={() => setAlertsManagerOpen(true)}
                  >
                    Set Target
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" color="info.main">Partial Profit</Typography>
                    <Typography variant="h5">${exitStrategies.partialProfit.price.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {exitStrategies.partialProfit.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Vender {exitStrategies.partialProfit.percentage}% de la posición
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="info"
                    onClick={() => setAlertsManagerOpen(true)}
                  >
                    Configure
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Risk/Reward Ratio</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h4" color="primary">1:3</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Excelente ratio riesgo/beneficio
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6">Contexto Fundamental</Typography>
              <Chip 
                label="En Desarrollo" 
                color="warning" 
                size="small" 
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                Los datos mostrados son de prueba. Integración con APIs reales en progreso.
              </Typography>
            </Box>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>News Sentiment</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h3">
                    {fundamentalData.newsSentiment > 0.5 ? '+' : fundamentalData.newsSentiment > 0 ? '=' : '-'}
                  </Typography>
                  <Box>
                    <Typography variant="h6">
                      {fundamentalData.newsSentiment > 0.5 ? 'Positivo' : fundamentalData.newsSentiment > 0 ? 'Neutral' : 'Negativo'} 
                      ({fundamentalData.newsSentiment.toFixed(1)})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sentimiento general {fundamentalData.newsSentiment > 0.5 ? 'positivo' : fundamentalData.newsSentiment > 0 ? 'neutral' : 'negativo'} en las noticias
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <WarningIcon color="warning" />
                  <Box>
                    <Typography variant="h6">Earnings Proximity</Typography>
                    <Chip label="Mock Data" color="warning" size="small" sx={{ ml: 1 }} />
                    <Typography variant="body2">
                      Próximos resultados: {fundamentalData.earningsDate}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fundamentalData.earningsProximity} días restantes - Mayor volatilidad esperada
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sector Performance</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <ShowChartIcon color="success" />
                  <Box>
                    <Typography variant="body1">
                      {fundamentalData.sectorPerformance >= 0 ? '+' : ''}{fundamentalData.sectorPerformance}% vs sector
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fundamentalData.sectorPerformance >= 0 ? 'Outperforming' : 'Underperforming'} sector average
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {fundamentalData.recentAlerts.length > 0 ? (
                    fundamentalData.recentAlerts.map((alert, index) => {
                      const alertDate = alert.triggeredAt ? new Date(alert.triggeredAt) : new Date();
                      const isValidDate = !isNaN(alertDate.getTime());
                      
                      return (
                        <Box key={index} display="flex" alignItems="center" gap={2}>
                          <ScheduleIcon color="action" fontSize="small" />
                          <Box>
                            <Typography variant="body2">{alert.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isValidDate ? alertDate.toLocaleDateString('es-ES') : 'Fecha no disponible'}
                              <Chip label="Mock" color="warning" size="small" sx={{ ml: 1 }} />
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="text.secondary">
                        No recent alerts
                      </Typography>
                      <Chip label="Sistema en desarrollo" color="info" size="small" />
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <PositionCharts
            position={position}
            analysisData={analysisData}
            loading={loading}
          />
        </TabPanel>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" startIcon={<ShowChartIcon />}>
            Actualizar Análisis
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<NotificationsIcon />}
            onClick={() => setAlertsManagerOpen(true)}
          >
            Configurar Alertas
          </Button>
          <Button onClick={onClose} variant="contained">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <PositionAlertsManager
        open={alertsManagerOpen}
        position={position}
        onClose={() => setAlertsManagerOpen(false)}
      />
    </>
  );
};

export default PositionDetailModal;