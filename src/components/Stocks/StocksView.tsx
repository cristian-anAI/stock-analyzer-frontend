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
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import { TrendingUp, TrendingDown, Refresh as RefreshIcon } from '@mui/icons-material';
import { Stock } from '../../types';
import { stockService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import ScoreChip from '../Common/ScoreChip';
import MTSSIndicator from '../Common/MTSSIndicator';
import SystemHealthIndicator from '../Common/SystemHealthIndicator';
import { MTSSAnalysisModal } from '../MTSS';

interface StockWithMTSS extends Stock {
  mtssData?: {
    unified_score?: number;
    trading_signal?: string;
    timeframe_scores?: {
      '1M'?: number;
      '1W'?: number;
      '1d'?: number;
      '1h'?: number;
    };
    analysis_performed?: boolean;
    confidence?: number;
  } | null;
}

const StocksView: React.FC = () => {
  const [allStocks, setAllStocks] = useState<StockWithMTSS[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<StockWithMTSS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [mtssLoading, setMtssLoading] = useState(false);
  const [mtssLoadedCount, setMtssLoadedCount] = useState(0);
  const [currentWave, setCurrentWave] = useState<1 | 2 | 3 | null>(null);
  const [waveProgress, setWaveProgress] = useState({ wave1: 0, wave2: 0, wave3: 0 });
  
  // Filtros y paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'symbol' | 'price' | 'change' | 'volume'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // MTSS Analysis Modal
  const [selectedSymbolForMTSS, setSelectedSymbolForMTSS] = useState<string>('');
  const [mtssModalOpen, setMtssModalOpen] = useState(false);

  // Smart cache functions - optimized for bulk endpoint
  const getCachedMTSS = (symbol: string) => {
    try {
      const cached = sessionStorage.getItem(`mtss_${symbol}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Cache válido por 30 minutos
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        } else {
          sessionStorage.removeItem(`mtss_${symbol}`);
        }
      }
    } catch (error) {
      console.error(`Error reading cache for ${symbol}:`, error);
    }
    return null;
  };

  const setCachedMTSS = (symbol: string, data: any) => {
    try {
      sessionStorage.setItem(`mtss_${symbol}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`Error caching MTSS for ${symbol}:`, error);
    }
  };

  // Cache bulk data timestamp to avoid frequent calls
  const getBulkCacheTimestamp = () => {
    try {
      const cached = sessionStorage.getItem('mtss_bulk_timestamp');
      return cached ? parseInt(cached) : 0;
    } catch {
      return 0;
    }
  };

  const setBulkCacheTimestamp = () => {
    try {
      sessionStorage.setItem('mtss_bulk_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error setting bulk cache timestamp:', error);
    }
  };

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Usar getAllStocks para obtener TODAS las stocks
      const data = await stockService.getAllStocks();
      const stocksWithMTSS = data.map((stock: Stock): StockWithMTSS => {
        // Intentar cargar desde cache
        const cachedMTSS = getCachedMTSS(stock.symbol);
        return {
          ...stock,
          mtssData: cachedMTSS
        };
      });
      setAllStocks(stocksWithMTSS);
      
      // Log cache stats
      const cachedCount = stocksWithMTSS.filter(s => s.mtssData).length;
      if (cachedCount > 0) {
        console.log(`💾 Cache hit: ${cachedCount} stocks loaded from sessionStorage`);
      }
    } catch (err) {
      setError('Error al cargar las acciones');
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para transformar datos bulk a estructura MTSS esperada
  const transformBulkToMTSSData = useCallback((bulkResults: any[]) => {
    return bulkResults.map(stock => ({
      symbol: stock.symbol,
      data: {
        unified_score: stock.mtss?.unified_score,
        trading_signal: stock.mtss?.trading_signal,
        timeframe_scores: stock.mtss?.timeframe_scores,
        analysis_performed: Boolean(stock.mtss), // True si hay datos MTSS
        confidence: stock.mtss?.confidence
      }
    }));
  }, []);

  // Nueva función optimizada usando bulk endpoint con cache inteligente
  const fetchMTSSBulk = useCallback(async () => {
    // Check if we have recent bulk data (less than 10 minutes old)
    const lastBulkFetch = getBulkCacheTimestamp();
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    
    if (lastBulkFetch > tenMinutesAgo) {
      console.log('💾 Using recent bulk cache, skipping API call');
      return;
    }
    
    setMtssLoading(true);
    console.log('🚀 Loading MTSS data using bulk endpoint...');
    
    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/mtss-bulk/scores?limit=500&min_score=0'
      );
      
      if (!response.ok) {
        throw new Error(`Bulk endpoint failed: ${response.status}`);
      }
      
      const bulkData = await response.json();
      console.log(`📦 Bulk response: ${bulkData.results?.length || 0} stocks with MTSS data`);
      
      // Transformar datos bulk a formato esperado
      const mtssResults = transformBulkToMTSSData(bulkData.results || []);
      
      // Actualizar todos los stocks con datos MTSS disponibles
      setAllStocks(prevStocks => 
        prevStocks.map(stock => {
          const mtssResult = mtssResults.find(r => r.symbol === stock.symbol);
          
          if (mtssResult && mtssResult.data) {
            // Cache los datos
            setCachedMTSS(stock.symbol, mtssResult.data);
            return {
              ...stock,
              mtssData: mtssResult.data
            };
          }
          return stock;
        })
      );
      
      const loadedCount = mtssResults.filter(r => r.data).length;
      setMtssLoadedCount(loadedCount);
      setBulkCacheTimestamp(); // Mark successful bulk fetch
      console.log(`✅ Bulk MTSS data loaded for ${loadedCount} stocks`);
      
    } catch (error) {
      console.error('❌ Error loading bulk MTSS data:', error);
      setError('Error al cargar datos MTSS en lote');
    } finally {
      setMtssLoading(false);
    }
  }, [transformBulkToMTSSData, setCachedMTSS, getBulkCacheTimestamp, setBulkCacheTimestamp]);

  // Función legacy para cargar símbolos específicos (solo para casos manuales)
  const fetchMTSSBatch = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;
    
    // Para símbolos específicos, usar el bulk y filtrar
    setMtssLoading(true);
    console.log(`🔄 Loading MTSS data for ${symbols.length} specific stocks...`);
    
    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/mtss-bulk/scores?limit=500&min_score=0'
      );
      
      if (!response.ok) throw new Error(`Bulk endpoint failed: ${response.status}`);
      
      const bulkData = await response.json();
      const mtssResults = transformBulkToMTSSData(bulkData.results || [])
        .filter(r => symbols.includes(r.symbol));
      
      // Actualizar solo los stocks solicitados
      setAllStocks(prevStocks => 
        prevStocks.map(stock => {
          const mtssResult = mtssResults.find(r => r.symbol === stock.symbol);
          
          if (mtssResult && mtssResult.data) {
            setCachedMTSS(stock.symbol, mtssResult.data);
            return {
              ...stock,
              mtssData: mtssResult.data
            };
          }
          return stock;
        })
      );
      
      const loadedCount = mtssResults.filter(r => r.data).length;
      console.log(`✅ MTSS data loaded for ${loadedCount}/${symbols.length} requested stocks`);
      
    } catch (error) {
      console.error('❌ Error loading specific MTSS data:', error);
    } finally {
      setMtssLoading(false);
    }
  }, [transformBulkToMTSSData, setCachedMTSS]);

  // Función simplificada - ya no usa waves, usa bulk endpoint
  const fetchMTSSBatchWithProgress = useCallback(async (symbols: string[], wave: 1 | 2 | 3) => {
    // Redirigir al bulk endpoint para consistencia
    console.log(`🌊 Wave ${wave} (using bulk endpoint): Loading MTSS data for ${symbols.length} stocks...`);
    await fetchMTSSBulk();
  }, [fetchMTSSBulk]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Simplified Loading Strategy: Single bulk call después de cargar stocks
  useEffect(() => {
    if (allStocks.length > 0 && !mtssLoading) {
      // Verificar si ya tenemos datos MTSS desde cache
      const stocksWithMTSS = allStocks.filter(stock => stock.mtssData).length;
      
      if (stocksWithMTSS === 0) {
        console.log('🚀 No MTSS data found, loading bulk data...');
        fetchMTSSBulk();
      } else {
        console.log(`💾 Found ${stocksWithMTSS} stocks with cached MTSS data`);
      }
    }
  }, [allStocks, mtssLoading, fetchMTSSBulk]);

  // Filtrar y ordenar stocks
  useEffect(() => {
    let filtered = allStocks.filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'all' || stock.sector === sectorFilter;
      return matchesSearch && matchesSector;
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

    setFilteredStocks(filtered);
    setPage(0); // Reset page when filters change
  }, [allStocks, searchTerm, sortBy, sortOrder, sectorFilter]);

  // Auto refresh every 5 minutes
  usePolling(fetchStocks, { 
    interval: 5 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  // Get unique sectors for filter
  const sectors = ['all', ...Array.from(new Set(allStocks.map(stock => stock.sector).filter(Boolean)))];

  // Paginación
  const paginatedStocks = filteredStocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbolForMTSS(symbol);
    setMtssModalOpen(true);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <Typography variant="h4">
              Análisis de Acciones
            </Typography>
            <SystemHealthIndicator />
          </Box>
          {mtssLoading && (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <Typography variant="caption" color="text.secondary">
                🚀 Cargando datos MTSS desde bulk endpoint... {mtssLoadedCount} completados
              </Typography>
            </Box>
          )}
          
          {/* Progress Summary cuando no está loading */}
          {!mtssLoading && mtssLoadedCount > 0 && (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="caption" color="success.main">
                ✅ MTSS Bulk: {mtssLoadedCount} stocks con indicadores cargados
              </Typography>
            </Box>
          )}
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={fetchMTSSBulk}
            disabled={mtssLoading || loading}
            size="small"
          >
            🚀 Recargar MTSS Bulk ({allStocks.filter(s => !s.mtssData).length} sin datos)
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              // Clear all MTSS data and reload
              setAllStocks(prev => prev.map(stock => ({ ...stock, mtssData: null })));
              setMtssLoadedCount(0);
              // Clear cache
              Object.keys(sessionStorage)
                .filter(key => key.startsWith('mtss_'))
                .forEach(key => sessionStorage.removeItem(key));
              // Reload
              setTimeout(fetchMTSSBulk, 100);
            }}
            disabled={mtssLoading || loading}
            size="small"
            color="warning"
          >
            🔄 Force Refresh MTSS
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Box>
      </Box>

      {/* Estadísticas Resumen */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {allStocks.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Stocks
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {allStocks.filter(s => s.changePercent > 0).length}
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
                {allStocks.filter(s => s.changePercent < 0).length}
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
                {allStocks.filter(s => s.score >= 8).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Score ≥ 8.0
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary.main">
                {allStocks.filter(s => s.mtssData?.analysis_performed).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Con MTSS Completo
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
        <TextField
          select
          label="Sector"
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          {sectors.map((sector) => (
            <MenuItem key={sector} value={sector}>
              {sector === 'all' ? 'Todos los sectores' : sector}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Mostrando {paginatedStocks.length} de {filteredStocks.length} acciones
        {searchTerm && ` (filtradas de ${allStocks.length} total)`}
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
            {paginatedStocks.map((stock) => (
              <TableRow key={stock.id} hover>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ 
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                      '&:hover': {
                        color: 'primary.dark',
                      }
                    }}
                    onClick={() => handleSymbolClick(stock.symbol)}
                    title="Ver análisis MTSS"
                  >
                    {stock.symbol}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {stock.symbol.charAt(0)}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography variant="body2">{stock.name}</Typography>
                      <MTSSIndicator 
                        symbol={stock.symbol} 
                        mtssData={stock.mtssData}
                      />
                    </Box>
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

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredStocks.length}
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
        message="Acciones actualizadas correctamente"
      />

      {/* MTSS Analysis Modal */}
      <MTSSAnalysisModal
        symbol={selectedSymbolForMTSS}
        isOpen={mtssModalOpen}
        onClose={() => setMtssModalOpen(false)}
      />
    </Box>
  );
};

export default StocksView;