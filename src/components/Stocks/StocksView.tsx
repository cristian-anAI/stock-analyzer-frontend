import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
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
import { TrendingUp, TrendingDown, Refresh as RefreshIcon } from '@mui/icons-material';
import { Stock } from '../../types';
import { stockService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import ScoreChip from '../Common/ScoreChip';

const StocksView: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockService.getStocksByScore();
      setStocks(data.sort((a, b) => b.score - a.score));
    } catch (err) {
      setError('Error al cargar las acciones');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Auto refresh every 5 minutes
  usePolling(fetchStocks, { 
    interval: 5 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await stockService.refreshStocks();
      await fetchStocks();
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al actualizar las acciones');
      console.error('Error refreshing stocks:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    return `$${marketCap}`;
  };

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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          Análisis de Acciones
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </Box>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {stocks.length} acciones ordenadas por score (mayor a menor)
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Símbolo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Cambio</TableCell>
              <TableCell align="center">Cambio %</TableCell>
              <TableCell align="right">Volumen</TableCell>
              <TableCell align="right">Market Cap</TableCell>
              <TableCell align="center">Sector</TableCell>
              <TableCell align="center">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stocks.map((stock) => (
              <TableRow key={stock.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {stock.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {stock.symbol.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{stock.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  ${(stock.currentPrice || 0).toFixed(2)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    {stock.change === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        N/A
                      </Typography>
                    ) : (
                      <>
                        {(stock.change || 0) >= 0 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography
                          color={(stock.change || 0) >= 0 ? 'success.main' : 'error.main'}
                          variant="body2"
                        >
                          ${Math.abs(stock.change || 0).toFixed(2)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {stock.changePercent === 0 ? (
                    <Chip
                      label="N/A"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label={`${(stock.changePercent || 0) >= 0 ? '+' : ''}${(stock.changePercent || 0).toFixed(2)}%`}
                      color={(stock.changePercent || 0) >= 0 ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatVolume(stock.volume)}
                </TableCell>
                <TableCell align="right">
                  {formatMarketCap(stock.marketCap)}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={stock.sector || 'N/A'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <ScoreChip score={stock.score} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Acciones actualizadas correctamente"
      />
    </Box>
  );
};

export default StocksView;