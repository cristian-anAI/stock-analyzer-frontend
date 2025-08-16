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
  TextField,
  MenuItem,
  TablePagination,
  Card,
  CardContent,
} from '@mui/material';
import { TrendingUp, TrendingDown, Refresh as RefreshIcon } from '@mui/icons-material';
import { Crypto } from '../../types';
import { cryptoService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import ScoreChip from '../Common/ScoreChip';

const CryptosView: React.FC = () => {
  const [allCryptos, setAllCryptos] = useState<Crypto[]>([]);
  const [filteredCryptos, setFilteredCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'symbol' | 'price' | 'change' | 'volume'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchCryptos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Usar getAllCryptos para obtener TODAS las cryptos
      const data = await cryptoService.getAllCryptos();
      setAllCryptos(data);
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

  // Filtrar y ordenar cryptos
  useEffect(() => {
    let filtered = allCryptos.filter(crypto => {
      const matchesSearch = crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           crypto.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'price':
          aValue = a.currentPrice || 0;
          bValue = b.currentPrice || 0;
          break;
        case 'change':
          aValue = a.changePercent || 0;
          bValue = b.changePercent || 0;
          break;
        case 'volume':
          aValue = a.volume || 0;
          bValue = b.volume || 0;
          break;
        default: // score
          aValue = a.score || 0;
          bValue = b.score || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCryptos(filtered);
    setPage(0); // Reset page when filters change
  }, [allCryptos, searchTerm, sortBy, sortOrder]);

  // Auto refresh every 5 minutes
  usePolling(fetchCryptos, { 
    interval: 5 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  // Paginación
  const paginatedCryptos = filteredCryptos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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

      {/* Estadísticas Resumen */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {allCryptos.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Cryptos
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {allCryptos.filter(c => c.changePercent > 0).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                En Alza
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {allCryptos.filter(c => c.changePercent < 0).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                En Baja
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {allCryptos.filter(c => c.score >= 8).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Score ≥ 8.0
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filtros */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Buscar por símbolo o nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
        />
        <TextField
          select
          label="Ordenar por"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="score">Score</MenuItem>
          <MenuItem value="symbol">Símbolo</MenuItem>
          <MenuItem value="price">Precio</MenuItem>
          <MenuItem value="change">Cambio %</MenuItem>
          <MenuItem value="volume">Volumen</MenuItem>
        </TextField>
        <TextField
          select
          label="Orden"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="desc">Desc</MenuItem>
          <MenuItem value="asc">Asc</MenuItem>
        </TextField>
      </Box>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Mostrando {paginatedCryptos.length} de {filteredCryptos.length} criptomonedas
        {searchTerm && ` (filtradas de ${allCryptos.length} total)`}
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
            {paginatedCryptos.map((crypto) => (
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
                    {crypto.changePercent === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        N/A
                      </Typography>
                    ) : (
                      <>
                        {(crypto.changePercent || 0) >= 0 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography
                          color={(crypto.changePercent || 0) >= 0 ? 'success.main' : 'error.main'}
                          variant="body2"
                        >
                          {(crypto.changePercent || 0).toFixed(2)}%
                        </Typography>
                      </>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${(crypto.changePercent || 0) >= 0 ? '+' : ''}${(crypto.changePercent || 0).toFixed(2)}%`}
                    color={(crypto.changePercent || 0) >= 0 ? 'success' : 'error'}
                    size="small"
                    variant="outlined"
                  />
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

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredCryptos.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />
      
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