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
import { Crypto } from '../../types';
import { cryptoService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import ScoreChip from '../Common/ScoreChip';

const CryptosView: React.FC = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const fetchCryptos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cryptoService.getCryptosByScore();
      setCryptos(data.sort((a, b) => b.score - a.score));
    } catch (err) {
      setError('Error al cargar las criptomonedas');
      console.error('Error fetching cryptos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCryptos();
  }, [fetchCryptos]);

  // Auto refresh every 5 minutes
  usePolling(fetchCryptos, { 
    interval: 5 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await cryptoService.refreshCryptos();
      await fetchCryptos();
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al actualizar las criptomonedas');
      console.error('Error refreshing cryptos:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
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
          Análisis de Criptomonedas
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
        {cryptos.length} criptomonedas ordenadas por score (mayor a menor)
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
              <TableCell align="center">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cryptos.map((crypto) => (
              <TableRow key={crypto.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {crypto.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'orange' }}>
                      {crypto.symbol.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">{crypto.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  ${(crypto.currentPrice || 0).toFixed(6)}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                    {crypto.change === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        N/A
                      </Typography>
                    ) : (
                      <>
                        {(crypto.change || 0) >= 0 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography
                          color={(crypto.change || 0) >= 0 ? 'success.main' : 'error.main'}
                          variant="body2"
                        >
                          ${Math.abs(crypto.change || 0).toFixed(6)}
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {crypto.changePercent === 0 ? (
                    <Chip
                      label="N/A"
                      color="default"
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label={`${(crypto.changePercent || 0) >= 0 ? '+' : ''}${(crypto.changePercent || 0).toFixed(2)}%`}
                      color={(crypto.changePercent || 0) >= 0 ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {formatVolume(crypto.volume)}
                </TableCell>
                <TableCell align="right">
                  {formatMarketCap(crypto.marketCap)}
                </TableCell>
                <TableCell align="center">
                  <ScoreChip score={crypto.score} />
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
        message="Criptomonedas actualizadas correctamente"
      />
    </Box>
  );
};

export default CryptosView;