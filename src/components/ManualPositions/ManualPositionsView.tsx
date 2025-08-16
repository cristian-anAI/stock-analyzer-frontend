import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { Position, ManualPosition, PositionAnalysis, TechnicalIndicators, getPositionSideIcon, getPositionSideColor, getPositionSideLabel, getPnLColor, getPnLChipColor } from '../../types';
import { positionService } from '../../services/api';
import ManualPositionDialog from './ManualPositionDialog';
import PositionDetailModal from './PositionDetailModal';

// Helper functions for technical indicators
const getRSIColor = (rsi: number): 'success' | 'warning' | 'error' => {
  if (rsi < 30) return 'success'; // Oversold - potential buy
  if (rsi > 70) return 'error';   // Overbought - potential sell
  return 'warning';               // Neutral
};

const getRSITooltip = (rsi: number): string => {
  const rsiValue = (rsi || 0).toFixed(1);
  if (rsi < 30) return `RSI ${rsiValue}: Oversold - Potential buying opportunity`;
  if (rsi > 70) return `RSI ${rsiValue}: Overbought - Consider taking profits`;
  return `RSI ${rsiValue}: Neutral zone`;
};

const getMACDColor = (signal: 'bullish' | 'bearish'): 'success' | 'error' => {
  return signal === 'bullish' ? 'success' : 'error';
};

const getMACDTooltip = (macd: TechnicalIndicators['macd']): string => {
  return `MACD ${macd.signal === 'bullish' ? 'Bullish' : 'Bearish'}: ${(macd.value || 0).toFixed(3)}`;
};

const getBollingerTooltip = (bollinger: TechnicalIndicators['bollinger']): string => {
  const position = bollinger.position === 'upper_band' ? 'Near Upper Band (Overbought)' :
                  bollinger.position === 'lower_band' ? 'Near Lower Band (Oversold)' :
                  'Middle Range';
  return `${position}: ${(bollinger.percentage || 0).toFixed(1)}%`;
};

const getRecommendationColor = (recommendation?: PositionAnalysis['recommendation']): 'success' | 'warning' | 'error' | 'info' => {
  if (!recommendation) return 'info';
  
  switch (recommendation) {
    case 'STRONG_HOLD': return 'success';
    case 'HOLD': return 'info';
    case 'SELL': return 'warning';
    case 'STRONG_SELL': return 'error';
    default: return 'info';
  }
};

const getDaysHeld = (createdAt?: string): number => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
};

// Helper function to format prices with appropriate decimals
const formatPrice = (price: number, type: 'stock' | 'crypto'): string => {
  if (type === 'crypto') {
    // For crypto, use more decimals to show small price differences
    if (price < 0.01) {
      return price.toFixed(6); // For very small prices like SHIB
    } else if (price < 1) {
      return price.toFixed(4); // For prices like $0.23xx
    } else if (price < 100) {
      return price.toFixed(3); // For prices like $10.xxx
    } else {
      return price.toFixed(2); // For higher prices
    }
  } else {
    // For stocks, 2 decimals is usually sufficient
    return price.toFixed(2);
  }
};

const ManualPositionsView: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  
  // Modal state
  const [selectedPosition, setSelectedPosition] = useState<ManualPosition | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<PositionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisAvailable, setAnalysisAvailable] = useState<Record<string, boolean>>({});
  const [technicalData, setTechnicalData] = useState<Record<string, PositionAnalysis>>({});

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await positionService.getManualPositions();
      setPositions(data);
      
      // Check analysis availability and fetch technical data for each position
      const availabilityMap: Record<string, boolean> = {};
      const technicalMap: Record<string, PositionAnalysis> = {};
      
      for (const position of data) {
        try {
          const analysis = await positionService.getPositionAnalysis(position.symbol);
          availabilityMap[position.symbol] = true;
          technicalMap[position.symbol] = analysis;
        } catch {
          availabilityMap[position.symbol] = false;
        }
      }
      
      setAnalysisAvailable(availabilityMap);
      setTechnicalData(technicalMap);
    } catch (err) {
      setError('Error al cargar las posiciones manuales');
      console.error('Error fetching manual positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setDialogOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta posición?')) {
      try {
        await positionService.deleteManualPosition(id);
        await fetchPositions();
      } catch (err) {
        setError('Error al eliminar la posición');
        console.error('Error deleting position:', err);
      }
    }
  };

  const handleDialogClose = async (shouldRefresh: boolean = false) => {
    setDialogOpen(false);
    setEditingPosition(null);
    if (shouldRefresh) {
      await fetchPositions();
    }
  };

  const handleRowClick = async (position: Position) => {
    try {
      setAnalysisLoading(true);
      
      // Convert Position to ManualPosition for the modal
      const manualPosition: ManualPosition = {
        id: position.id,
        symbol: position.symbol,
        name: position.name,
        type: position.type,
        quantity: position.quantity,
        entryPrice: position.entryPrice,
      };
      
      setSelectedPosition(manualPosition);
      setModalOpen(true);
      
      // Fetch analysis data
      const analysis = await positionService.getPositionAnalysis(position.symbol);
      setAnalysisData(analysis);
    } catch (err) {
      console.error('Error fetching position analysis:', err);
      setAnalysisData(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPosition(null);
    setAnalysisData(null);
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Posiciones Manuales
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Posición
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {positions.length} posiciones manuales
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Símbolo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="center">Side</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Precio Entrada</TableCell>
              <TableCell align="right">Precio Actual</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell align="center">P&L %</TableCell>
              <TableCell align="center">RSI</TableCell>
              <TableCell align="center">MACD</TableCell>
              <TableCell align="center">Bollinger</TableCell>
              <TableCell align="center">Días</TableCell>
              <TableCell align="center">Recomendación</TableCell>
              <TableCell align="center">R/R</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => {
              const analysis = technicalData[position.symbol];
              const daysHeld = getDaysHeld(position.createdAt);
              
              return (
                <Tooltip 
                  key={position.id}
                  title="Click for detailed analysis"
                  placement="top"
                >
                  <TableRow 
                    hover 
                    onClick={() => handleRowClick(position)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      ...(analysisLoading && selectedPosition?.symbol === position.symbol && {
                        backgroundColor: 'action.selected',
                      }),
                    }}
                  >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {position.symbol}
                      </Typography>
                      {analysisAvailable[position.symbol] ? (
                        <AnalyticsIcon color="primary" fontSize="small" />
                      ) : (
                        <AnalyticsIcon color="disabled" fontSize="small" />
                      )}
                    </Box>
                  </TableCell>
                <TableCell>{position.name}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={position.type === 'stock' ? 'Stock' : 'Crypto'}
                    color={position.type === 'stock' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${getPositionSideIcon(position.positionSide)} ${getPositionSideLabel(position.positionSide)}`}
                    color={getPositionSideColor(position.positionSide)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{position.quantity || 0}</TableCell>
                <TableCell align="right">${formatPrice(position.entryPrice || 0, position.type)}</TableCell>
                <TableCell align="right">${formatPrice(position.currentPrice || 0, position.type)}</TableCell>
                <TableCell align="right">${(position.value || 0).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    <Typography
                      color={getPnLColor(position.pnl || 0, position.positionSide)}
                      fontWeight="bold"
                    >
                      ${(position.pnl || 0).toFixed(2)}
                    </Typography>
                    {(position.pnl || 0) >= 0 ? (
                      <TrendingUpIcon color="success" fontSize="small" />
                    ) : (
                      <TrendingDownIcon color="error" fontSize="small" />
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${(position.pnlPercent || 0).toFixed(2)}%`}
                    color={getPnLChipColor(position.pnlPercent || 0, position.positionSide)}
                    size="small"
                  />
                </TableCell>
                
                {/* RSI Cell */}
                <TableCell align="center">
                  {analysis?.technical ? (
                    <Tooltip title={getRSITooltip(analysis.technical.rsi)} arrow>
                      <Chip
                        label={(analysis.technical.rsi || 0).toFixed(1)}
                        color={getRSIColor(analysis.technical.rsi || 0)}
                        size="small"
                        icon={<SpeedIcon />}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                
                {/* MACD Cell */}
                <TableCell align="center">
                  {analysis?.technical?.macd ? (
                    <Tooltip title={getMACDTooltip(analysis.technical.macd)} arrow>
                      <Chip
                        label={analysis.technical.macd.signal === 'bullish' ? '↗' : '↘'}
                        color={getMACDColor(analysis.technical.macd.signal)}
                        size="small"
                        icon={<TimelineIcon />}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                
                {/* Bollinger Bands Cell */}
                <TableCell align="center">
                  {analysis?.technical?.bollinger ? (
                    <Tooltip title={getBollingerTooltip(analysis.technical.bollinger)} arrow>
                      <Chip
                        label={analysis.technical.bollinger.position === 'upper_band' ? 'Alto' :
                               analysis.technical.bollinger.position === 'lower_band' ? 'Bajo' : 'Medio'}
                        color={analysis.technical.bollinger.position === 'upper_band' ? 'error' :
                               analysis.technical.bollinger.position === 'lower_band' ? 'success' : 'warning'}
                        size="small"
                        icon={<ShowChartIcon />}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                
                {/* Days Held Cell */}
                <TableCell align="center">
                  <Typography variant="body2" color="textSecondary">
                    {daysHeld}d
                  </Typography>
                </TableCell>
                
                {/* Recommendation Cell */}
                <TableCell align="center">
                  {analysis?.recommendation ? (
                    <Tooltip title={`Score: ${(analysis.score || 0).toFixed(1)}/10`} arrow>
                      <Chip
                        label={(analysis.recommendation || '').replace('_', ' ')}
                        color={getRecommendationColor(analysis.recommendation)}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                
                {/* Risk/Reward Ratio Cell */}
                <TableCell align="center">
                  {analysis?.exitStrategies ? (
                    <Tooltip 
                      title={`Stop Loss: $${(analysis.exitStrategies.stopLoss.price || 0).toFixed(2)} | Take Profit: $${(analysis.exitStrategies.takeProfit.price || 0).toFixed(2)}`} 
                      arrow
                    >
                      <Typography 
                        variant="body2" 
                        color={(analysis.exitStrategies.takeProfit.upside || 0) > Math.abs(analysis.exitStrategies.stopLoss.distance || 0) ? 'success.main' : 'warning.main'}
                        fontWeight="bold"
                      >
                        {((analysis.exitStrategies.takeProfit.upside || 0) / Math.abs(analysis.exitStrategies.stopLoss.distance || 1)).toFixed(1)}:1
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                
                {/* Actions Cell */}
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(position);
                    }}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(position.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
                  </TableRow>
                </Tooltip>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <ManualPositionDialog
        open={dialogOpen}
        position={editingPosition}
        onClose={handleDialogClose}
      />

      {selectedPosition && (
        <PositionDetailModal
          open={modalOpen}
          position={selectedPosition}
          analysisData={analysisData}
          loading={analysisLoading}
          onClose={handleModalClose}
        />
      )}
    </Box>
  );
};

export default ManualPositionsView;