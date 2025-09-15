import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp,
  TrendingDown,
  Timeline,
  Assessment,
  ShowChart,
} from '@mui/icons-material';
import { detectAssetType, getCryptoSymbolForAPI } from '../../types';

// Types para la respuesta del endpoint Unified Scoring
interface DataQuality {
  status: string;
  periods: number;
  expected: number;
  quality: string;
  quality_ratio: number;
}

interface TimeframeScores {
  '1M': number;
  '1W': number;
  '1d': number;
  '1h': number;
}

interface DataQualityMap {
  '1M': DataQuality;
  '1W': DataQuality;
  '1d': DataQuality;
  '1h': DataQuality;
}

interface Breakdown {
  traditional: {
    score: number;
    weight: number;
    contribution: number;
  };
  advanced: {
    score: number;
    weight: number;
    contribution: number;
    details: {
      method: string;
    };
  };
  mtss: {
    score: number;
    weight: number;
    contribution: number;
    monthly_filter_passed: boolean;
    timeframe_scores: TimeframeScores;
    data_quality: DataQualityMap;
  };
}

interface Recommendations {
  action: string;
  position_size: number;
  stop_loss: number;
  take_profit: number;
  max_hold_days: number;
  risk_level: string;
  reasoning: string[];
}

interface DebugInfo {
  thresholds: {
    buy_threshold: number;
    sell_threshold: number;
  };
  method_weights: {
    traditional: number;
    advanced: number;
    mtss: number;
  };
  data_sources_used: string[];
  calculation_time_ms: number;
}

interface PreFilterResult {
  traditional_score: number;
  threshold: number;
  passed: boolean;
  forced: boolean;
  reason?: string;
}

interface Performance {
  analysis_time_ms: number;
  api_calls_made: {
    yahoo_finance_calls: number;
    estimated_total: number;
    note: string;
  };
}

interface MTSSAnalysisData {
  symbol: string;
  asset_type: string;
  timestamp: string;
  unified_score: number;
  trading_signal: string;
  confidence: number;
  breakdown: Breakdown;
  recommendations: Recommendations;
  analysis_performed: boolean;
  debug_info?: DebugInfo;
  pre_filter_result?: PreFilterResult;
  performance?: Performance;
}

interface MTSSAnalysisModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

const MTSSAnalysisModal: React.FC<MTSSAnalysisModalProps> = ({
  symbol,
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<MTSSAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forceAnalysis, setForceAnalysis] = useState(false);

  useEffect(() => {
    if (isOpen && symbol) {
      fetchMTSSAnalysis();
    }
  }, [isOpen, symbol]);

  const fetchMTSSAnalysis = async (forceAnalysisParam = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const fullSymbol = getCryptoSymbolForAPI(symbol); // BTC -> BTC-USD
      const assetType = detectAssetType(fullSymbol);
      const baseUrl = `http://localhost:8000/api/v1/unified-scoring/analyze/${fullSymbol}?asset_type=${assetType}`;
      const url = forceAnalysisParam ? `${baseUrl}&force_analysis=true` : baseUrl;
      
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('El endpoint de Unified Scoring no está disponible. Contacte al administrador del sistema.');
        }
        if (response.status === 500) {
          throw new Error(`Error del servidor (500): Posible problema de validación con el símbolo ${fullSymbol}. Verifique que el símbolo sea válido para el tipo de activo detectado: ${assetType}`);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const analysisData = await response.json();
      setData(analysisData);
      
      // Si se forzó el análisis, actualizar el estado
      if (forceAnalysisParam) {
        setForceAnalysis(true);
      }
    } catch (err) {
      console.error('Error fetching unified scoring analysis:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleForceAnalysis = () => {
    fetchMTSSAnalysis(true);
  };

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return 'success'; // Verde
      case 'SELL':
        return 'error'; // Rojo
      case 'HOLD':
        return 'warning'; // Amarillo
      case 'WAIT':
        return 'info'; // Azul
      default:
        return 'default';
    }
  };

  const getSignalIcon = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return <TrendingUp sx={{ color: '#16a34a' }} />; // Verde
      case 'SELL':
        return <TrendingDown sx={{ color: '#dc2626' }} />; // Rojo
      case 'HOLD':
        return <Timeline sx={{ color: '#d97706' }} />; // Naranja
      case 'WAIT':
        return <Timeline sx={{ color: '#3b82f6' }} />; // Azul
      default:
        return <Timeline />;
    }
  };

  const getSignalLabel = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return 'Buy';
      case 'SELL':
        return 'Sell';
      case 'HOLD':
        return 'Hold';
      case 'WAIT':
        return 'Wait';
      default:
        return signalType || 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bullish':
        return 'success';
      case 'bearish':
        return 'error';
      case 'neutral':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Función para colores granulares basados en score (1-10)
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#22c55e'; // Verde fuerte
    if (score >= 7.0) return '#84cc16'; // Verde medio
    if (score >= 6.0) return '#eab308'; // Amarillo
    if (score >= 4.0) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  };

  // Función para colores basados en confianza (0-1)
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.85) return '#22c55e'; // Verde fuerte
    if (confidence >= 0.70) return '#84cc16'; // Verde medio
    if (confidence >= 0.60) return '#eab308'; // Amarillo
    if (confidence >= 0.40) return '#f97316'; // Naranja
    return '#ef4444'; // Rojo
  };

  const getScoreColorForMUI = (score: number) => {
    if (score >= 7.0) return 'success';
    if (score >= 6.0) return 'warning';
    if (score >= 4.0) return 'info';
    return 'error';
  };

  const getConfidenceLevelColor = (level?: string) => {
    switch (level) {
      case 'EXCELLENT':
        return '#22c55e';
      case 'HIGH':
        return '#84cc16';
      case 'MEDIUM':
        return '#eab308';
      case 'LOW':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTimeframeLabel = (timeframe: string) => {
    const labels: Record<string, string> = {
      '1M': 'Mensual',
      '1W': 'Semanal', 
      '1d': 'Diario',
      '1h': 'Por Hora',
    };
    return labels[timeframe] || timeframe;
  };

  const getTimeframeIcon = (timeframe: string) => {
    const icons: Record<string, React.ReactNode> = {
      '1M': <Assessment />,
      '1W': <ShowChart />,
      '1d': <Timeline />,
      '1h': <TrendingUp />,
    };
    return icons[timeframe] || <Timeline />;
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { 
          minHeight: '600px',
          bgcolor: 'grey.900',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'primary.main',
          '& .MuiDialogTitle-root': {
            bgcolor: 'grey.900',
            borderBottom: '1px solid',
            borderColor: 'grey.700'
          },
          '& .MuiDialogContent-root': {
            bgcolor: 'grey.900'
          },
          '& .MuiDialogActions-root': {
            bgcolor: 'grey.900',
            borderTop: '1px solid',
            borderColor: 'grey.700'
          }
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight="bold">
              Análisis Unified Scoring - {symbol}
            </Typography>
            {data && (
              <Chip
                label={getSignalLabel(data.trading_signal)}
                color={getSignalColor(data.trading_signal) as any}
                icon={getSignalIcon(data.trading_signal)}
                size="medium"
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error al cargar el análisis MTSS: {error}
          </Alert>
        )}

        {data && (
          <Box>
            {/* Mensaje para análisis no completo */}
            {!data.analysis_performed && (
              <Alert severity="warning" sx={{ mb: 2, bgcolor: 'warning.dark', color: 'warning.contrastText' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex="1">
                    <Typography variant="body2" color="inherit">
                      <strong>⚠️ Análisis básico solamente:</strong> {data.pre_filter_result?.traditional_score ? 
                        `Score tradicional: ${data.pre_filter_result.traditional_score.toFixed(1)}/10` : 
                        'Score demasiado bajo para análisis detallado'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }} color="inherit">
                      {data.pre_filter_result?.reason || 'El stock no cumple los criterios mínimos para análisis completo'}
                    </Typography>
                  </Box>
                  <Box ml={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleForceAnalysis}
                      disabled={loading}
                      startIcon={<Assessment />}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        }
                      }}
                    >
                      🔍 Analizar de Todas Formas
                    </Button>
                  </Box>
                </Box>
              </Alert>
            )}

            {/* Mensaje cuando se forzó el análisis */}
            {forceAnalysis && data.analysis_performed && (
              <Alert severity="success" sx={{ mb: 2, bgcolor: 'success.dark', color: 'success.contrastText' }}>
                <Typography variant="body2" color="inherit">
                  ✅ <strong>Análisis forzado completado:</strong> Se realizó análisis completo incluso con score tradicional bajo.
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }} color="inherit">
                  Los resultados incluyen MTSS multi-timeframe y recomendaciones detalladas.
                </Typography>
              </Alert>
            )}

            {/* Resumen General - Solo mostrar si hay análisis completo */}
            {data.analysis_performed && (
              <Card sx={{ 
                mb: 3, 
                bgcolor: 'grey.900', 
                border: '1px solid', 
                borderColor: 'primary.main',
                '& .MuiCardContent-root': {
                  bgcolor: 'grey.900',
                  color: 'primary.contrastText'
                }
              }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Resumen General</Typography>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ color: getScoreColor(data.unified_score) }}
                  >
                    {(data.unified_score || 0).toFixed(1)}/10
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Confianza del Análisis
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.confidence * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                    color={data.confidence >= 0.75 ? 'success' : 'warning'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {((data.confidence || 0) * 100).toFixed(1)}% confianza
                  </Typography>
                </Box>

                <Alert 
                  severity={data.unified_score >= 7 ? 'success' : data.unified_score >= 4 ? 'warning' : 'info'}
                  variant="filled"
                >
                  <Typography variant="body2">
                    <strong>Acción Recomendada:</strong> {data.recommendations.action} ({data.recommendations.risk_level} risk)
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    {data.recommendations.reasoning.join('. ')}
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
            )}

            {/* Breakdown por Método - Solo mostrar si hay análisis completo */}
            {data.analysis_performed && (
            <>
            <Typography variant="h6" gutterBottom>
              Desglose por Método de Análisis
            </Typography>

            <Box display="flex" flexDirection="column" gap={2}>
              {/* Traditional */}
              <Card variant="outlined" sx={{
                bgcolor: 'grey.800',
                borderColor: 'grey.600',
                '& .MuiCardContent-root': {
                  bgcolor: 'grey.800',
                  color: 'text.primary'
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Assessment />
                      <Typography variant="h6">Traditional Analysis</Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{ color: getScoreColor(data.breakdown.traditional.score) }}
                    >
                      {(data.breakdown.traditional.score || 0).toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(data.breakdown.traditional.score / 10) * 100} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(data.breakdown.traditional.score)
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Weight: {((data.breakdown.traditional.weight || 0) * 100).toFixed(0)}% • Contribution: {(data.breakdown.traditional.contribution || 0).toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* Advanced */}
              <Card variant="outlined" sx={{
                bgcolor: 'grey.800',
                borderColor: 'grey.600',
                '& .MuiCardContent-root': {
                  bgcolor: 'grey.800',
                  color: 'text.primary'
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <ShowChart />
                      <Typography variant="h6">Advanced Analysis</Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{ color: getScoreColor(data.breakdown.advanced.score) }}
                    >
                      {(data.breakdown.advanced.score || 0).toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(data.breakdown.advanced.score / 10) * 100} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(data.breakdown.advanced.score)
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Weight: {((data.breakdown.advanced.weight || 0) * 100).toFixed(0)}% • Method: {data.breakdown.advanced.details?.method || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {/* MTSS with Detailed Timeframe Analysis */}
              <Card variant="outlined" sx={{
                bgcolor: 'grey.800',
                borderColor: 'success.main',
                '& .MuiCardContent-root': {
                  bgcolor: 'grey.800',
                  color: 'text.primary'
                }
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Timeline />
                      <Typography variant="h6">MTSS Multi-Timeframe Analysis</Typography>
                      <Chip
                        label={data.breakdown.mtss.monthly_filter_passed ? 'FILTER PASS' : 'FILTER FAIL'}
                        color={data.breakdown.mtss.monthly_filter_passed ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{ color: getScoreColor(data.breakdown.mtss.score) }}
                    >
                      {(data.breakdown.mtss.score || 0).toFixed(1)}/10
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(data.breakdown.mtss.score / 10) * 100} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(data.breakdown.mtss.score)
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Weight: {((data.breakdown.mtss.weight || 0) * 100).toFixed(0)}% • Contribution: {(data.breakdown.mtss.contribution || 0).toFixed(2)}
                    </Typography>
                  </Box>
                  
                  {/* Detailed Timeframe Analysis */}
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" fontWeight="bold" mb={2}>
                    📊 Análisis Detallado por Timeframe:
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    {Object.entries(data.breakdown.mtss.timeframe_scores).map(([timeframe, score]) => {
                      const quality = data.breakdown.mtss.data_quality[timeframe as keyof typeof data.breakdown.mtss.data_quality];
                      return (
                        <Box key={timeframe} display="flex" alignItems="center" gap={2}>
                          <Box minWidth="80px" display="flex" alignItems="center">
                            {getTimeframeIcon(timeframe)}
                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                              {getTimeframeLabel(timeframe)}
                            </Typography>
                          </Box>
                          <Box flex="1">
                            <LinearProgress 
                              variant="determinate" 
                              value={(score / 10) * 100} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                backgroundColor: '#f1f5f9',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getScoreColor(score)
                                }
                              }}
                            />
                          </Box>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            sx={{ 
                              color: getScoreColor(score),
                              minWidth: '60px',
                              textAlign: 'center'
                            }}
                          >
                            {(score || 0).toFixed(1)}/10
                          </Typography>
                          <Box minWidth="120px">
                            <Chip
                              label={quality?.quality === 'good' ? `✅ ${quality.periods}p` : `⚠️ ${quality?.periods || 0}p`}
                              size="small"
                              color={quality?.quality === 'good' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Data Quality Summary */}
                  <Box mt={2} p={2} bgcolor="grey.800" borderRadius={2} border="1px solid" borderColor="grey.600">
                    <Typography variant="caption" color="text.primary" display="block" mb={1} fontWeight="bold">
                      📈 Calidad de Datos por Timeframe:
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      {Object.entries(data.breakdown.mtss.data_quality).map(([timeframe, quality]) => (
                        <Typography key={timeframe} variant="caption" color="text.primary">
                          <strong>{getTimeframeLabel(timeframe)}:</strong> {quality?.periods || 0}/{quality?.expected || 0} periods 
                          ({((quality?.quality_ratio || 0) * 100).toFixed(0)}%)
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Debug Info - Mostrar información adicional disponible */}
                  {data.debug_info && (
                    <Box mt={2} p={2} bgcolor="info.dark" borderRadius={2} border="1px solid" borderColor="info.main">
                      <Typography variant="caption" color="text.primary" display="block" mb={1} fontWeight="bold">
                        🔍 Información de Análisis:
                      </Typography>
                      <Box display="flex" gap={2} flexWrap="wrap">
                        <Typography variant="caption" color="text.primary">
                          <strong>Umbral de Compra:</strong> {data.debug_info.thresholds?.buy_threshold}/10
                        </Typography>
                        <Typography variant="caption" color="text.primary">
                          <strong>Fuentes Usadas:</strong> {data.debug_info.data_sources_used?.join(', ') || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.primary">
                          <strong>Tiempo de Análisis:</strong> {data.performance?.analysis_time_ms ? `${data.performance.analysis_time_ms.toFixed(0)}ms` : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {/* Pre-filter Information */}
                  {data.pre_filter_result && (
                    <Box mt={2} p={2} bgcolor={data.pre_filter_result.passed ? "success.dark" : "warning.dark"} borderRadius={2} border="1px solid" borderColor={data.pre_filter_result.passed ? "success.main" : "warning.main"}>
                      <Typography variant="caption" color="text.primary" display="block" mb={1} fontWeight="bold">
                        ⚡ Filtro Previo:
                      </Typography>
                      <Typography variant="caption" color="text.primary">
                        <strong>Score Tradicional:</strong> {(data.pre_filter_result.traditional_score || 0).toFixed(1)}/10 • 
                        <strong> Estado:</strong> {data.pre_filter_result.passed ? '✅ PASSED' : '❌ FAILED'} • 
                        <strong> Umbral:</strong> {data.pre_filter_result.threshold}/10
                        {data.pre_filter_result.forced && ' (Forzado)'}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Recommendations */}
            <Box mt={3}>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                🎯 Recomendaciones de Trading
              </Typography>
              
              <Card variant="outlined" sx={{ 
                bgcolor: 'primary.dark',
                borderColor: 'primary.main',
                '& .MuiCardContent-root': {
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText'
                }
              }}>
                <CardContent>
                  <Box display="flex" gap={4}>
                    <Box flex="1">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Acción Recomendada
                      </Typography>
                      <Chip
                        label={getSignalLabel(data.trading_signal)}
                        color={getSignalColor(data.trading_signal) as any}
                        icon={getSignalIcon(data.trading_signal)}
                        variant="filled"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Risk Level: {data.recommendations.risk_level}
                      </Typography>
                    </Box>
                    
                    <Box flex="1">
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Position Details
                      </Typography>
                      <Typography variant="body2">
                        <strong>Position Size:</strong> {(data.recommendations.position_size || 0).toFixed(2)}%<br/>
                        <strong>Risk Level:</strong> {data.recommendations.risk_level}<br/>
                        <strong>Max Hold Days:</strong> {data.recommendations.max_hold_days || 0} days<br/>
                        <strong>Strategy:</strong> MTSS Multi-Timeframe
                      </Typography>
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
                        ⚠️ Los precios TP/SL requieren precio actual del mercado
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            </>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cerrar
        </Button>
        {data && (
          <Button 
            onClick={() => fetchMTSSAnalysis()} 
            variant="contained"
            disabled={loading}
          >
            Actualizar Análisis
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MTSSAnalysisModal;