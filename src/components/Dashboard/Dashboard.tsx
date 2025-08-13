import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CurrencyBitcoin,
  Timeline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Stock, Crypto, Position } from '../../types';
import { stockService, cryptoService, positionService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import ScoreChip from '../Common/ScoreChip';
import AutotraderStats from '../Autotrader/AutotraderStats';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStocks: 0,
    totalCryptos: 0,
    totalPositions: 0,
    totalValue: 0,
    totalPnL: 0,
    topStocks: [] as Stock[],
    topCryptos: [] as Crypto[],
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [stocks, cryptos, positions] = await Promise.all([
        stockService.getStocksByScore(),
        cryptoService.getCryptosByScore(),
        positionService.getAutotraderPositions(),
      ]);

      const totalValue = positions.reduce((sum, pos) => sum + pos.value, 0);
      const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);

      setStats({
        totalStocks: stocks.length,
        totalCryptos: cryptos.length,
        totalPositions: positions.length,
        totalValue,
        totalPnL,
        topStocks: stocks.slice(0, 5),
        topCryptos: cryptos.slice(0, 5),
      });
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto refresh every 10 minutes (600,000 ms)
  usePolling(fetchDashboardData, { 
    interval: 10 * 60 * 1000, 
    enabled: !loading 
  });

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
      <Typography variant="h4" gutterBottom>
        Dashboard - Stock Analyzer
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 4 }}>
        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="primary" />
                <Typography color="textSecondary" gutterBottom>
                  Total Stocks
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalStocks}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/stocks')}>
                Ver Todas
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <CurrencyBitcoin color="warning" />
                <Typography color="textSecondary" gutterBottom>
                  Total Cryptos
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalCryptos}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/cryptos')}>
                Ver Todas
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <AccountBalance color="info" />
                <Typography color="textSecondary" gutterBottom>
                  Posiciones Activas
                </Typography>
              </Box>
              <Typography variant="h4">
                {stats.totalPositions}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/positions')}>
                Ver Posiciones
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Timeline color="success" />
                <Typography color="textSecondary" gutterBottom>
                  Valor del Portfolio
                </Typography>
              </Box>
              <Typography variant="h4">
                ${(stats.totalValue || 0).toFixed(0)}
              </Typography>
              <Typography 
                variant="body2"
                color={(stats.totalPnL || 0) >= 0 ? 'success.main' : 'error.main'}
              >
                P&L: ${(stats.totalPnL || 0).toFixed(2)}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/positions')}>
                Ver Detalles
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="1" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Stocks por Score
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stats.topStocks.map((stock, index) => (
                  <Box
                    key={stock.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stock.symbol}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {stock.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        ${(stock.currentPrice || 0).toFixed(2)}
                      </Typography>
                      <ScoreChip score={stock.score} size="small" />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/stocks')}>
                Ver Todas las Stocks
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box flex="1" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top 5 Cryptos por Score
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {stats.topCryptos.map((crypto, index) => (
                  <Box
                    key={crypto.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      bgcolor: index % 2 === 0 ? 'grey.50' : 'transparent',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {crypto.symbol}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {crypto.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        ${(crypto.currentPrice || 0).toFixed(6)}
                      </Typography>
                      <ScoreChip score={crypto.score} size="small" />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/cryptos')}>
                Ver Todas las Cryptos
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <AutotraderStats />
      </Box>
    </Box>
  );
};

export default Dashboard;