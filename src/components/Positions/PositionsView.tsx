import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as RunIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Position, getPositionSideIcon, getPositionSideColor, getPositionSideLabel, getPnLColor, getPnLChipColor } from '../../types';
import { positionService, autotraderService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PositionsView: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [autotraderRunning, setAutotraderRunning] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await positionService.getAutotraderPositions();
      setPositions(data);
    } catch (err) {
      setError('Error al cargar las posiciones');
      console.error('Error fetching positions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  // Auto refresh every 3 minutes (positions change more frequently)
  usePolling(fetchPositions, { 
    interval: 3 * 60 * 1000, 
    enabled: !loading && !refreshing && !autotraderRunning
  });


  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await positionService.refreshPositions();
      await fetchPositions();
      setSnackbarMessage('Posiciones actualizadas correctamente');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al actualizar las posiciones');
      console.error('Error refreshing positions:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunAutotrader = async () => {
    try {
      setAutotraderRunning(true);
      setError(null);
      const result = await autotraderService.runAutotrader();
      
      if (result.success) {
        setSnackbarMessage(`Autotrader ejecutado: ${result.summary.actions_taken} acciones realizadas`);
        await fetchPositions(); // Refresh positions after autotrader run
      } else {
        setSnackbarMessage('Error al ejecutar el autotrader');
      }
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al ejecutar el autotrader');
      console.error('Error running autotrader:', err);
    } finally {
      setAutotraderRunning(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const stockPositions = positions.filter(p => p.type === 'stock');
  const cryptoPositions = positions.filter(p => p.type === 'crypto');

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

  const renderPositionsTable = (positions: Position[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Símbolo</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell align="center">Side</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Precio Entrada</TableCell>
            <TableCell align="right">Precio Actual</TableCell>
            <TableCell align="right">Valor Total</TableCell>
            <TableCell align="right">P&L</TableCell>
            <TableCell align="center">P&L %</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id} hover>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {position.symbol}
                </Typography>
              </TableCell>
              <TableCell>{position.name}</TableCell>
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
                <Typography
                  color={getPnLColor(position.pnl || 0, position.positionSide)}
                  fontWeight="bold"
                >
                  ${(position.pnl || 0).toFixed(2)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={`${(position.pnlPercent || 0).toFixed(2)}%`}
                  color={getPnLChipColor(position.pnlPercent || 0, position.positionSide)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const totalValue = positions.reduce((sum, pos) => sum + (pos.value || 0), 0);
  const totalPnL = positions.reduce((sum, pos) => sum + (pos.pnl || 0), 0);
  const totalPnLPercent = totalValue > 0 ? (totalPnL / (totalValue - totalPnL)) * 100 : 0;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Posiciones del Autotrader
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            variant="contained"
            startIcon={autotraderRunning ? <CircularProgress size={16} color="inherit" /> : <RunIcon />}
            onClick={handleRunAutotrader}
            disabled={autotraderRunning || loading}
            color="success"
          >
            {autotraderRunning ? 'Ejecutando...' : 'Ejecutar Autotrader'}
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Valor Total del Portfolio
              </Typography>
              <Typography variant="h5">
                ${totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                P&L Total
              </Typography>
              <Typography
                variant="h5"
                color={totalPnL >= 0 ? 'success.main' : 'error.main'}
              >
                ${totalPnL.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="300px">
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                P&L Total %
              </Typography>
              <Typography
                variant="h5"
                color={totalPnLPercent >= 0 ? 'success.main' : 'error.main'}
              >
                {totalPnLPercent.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Stocks (${stockPositions.length})`} />
          <Tab label={`Cryptos (${cryptoPositions.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderPositionsTable(stockPositions)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderPositionsTable(cryptoPositions)}
      </TabPanel>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default PositionsView;