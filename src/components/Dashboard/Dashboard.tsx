import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { PortfolioOverview } from '../../types';
import { portfolioService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';
import PortfolioSummaryCards from '../Portfolio/PortfolioSummaryCards';
import AutotraderStats from '../Autotrader/AutotraderStats';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [portfolioOverview, setPortfolioOverview] = useState<PortfolioOverview | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const overview = await portfolioService.getOverview();
      setPortfolioOverview(overview);
    } catch (err) {
      setError('Error al cargar los datos del portfolio');
      console.error('Error fetching portfolio overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto refresh every 5 minutes
  usePolling(fetchDashboardData, { 
    interval: 5 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await portfolioService.refreshPortfolio();
      await fetchDashboardData();
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al actualizar el portfolio');
      console.error('Error refreshing portfolio:', err);
    } finally {
      setRefreshing(false);
    }
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

  if (!portfolioOverview) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No se pudieron cargar los datos del portfolio
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Dashboard - Portfolio Overview
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          {refreshing ? 'Actualizando...' : 'Actualizar Portfolio'}
        </Button>
      </Box>

      <PortfolioSummaryCards overview={portfolioOverview} />

      <Box sx={{ mt: 4 }}>
        <AutotraderStats />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Portfolio actualizado correctamente"
      />
    </Box>
  );
};

export default Dashboard;