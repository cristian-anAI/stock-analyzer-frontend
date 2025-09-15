import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Chip, 
  Tooltip, 
  Typography,
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface SystemHealth {
  mtssAnalyzed: number;
  totalStocks: number;
  lastUpdateTime: string;
  performanceMs: number;
}

const SystemHealthIndicator: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchSystemHealth = async () => {
      setLoading(true);
      try {
        // Simular datos de salud mientras esperamos el endpoint real
        // TODO: Reemplazar con fetch real cuando esté disponible el endpoint
        // const response = await fetch('/api/v1/mtss-bulk/scheduler/status');
        // const data = await response.json();
        
        // Simulación temporal
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (mounted) {
          setHealth({
            mtssAnalyzed: 45,
            totalStocks: 200,
            lastUpdateTime: new Date().toLocaleTimeString(),
            performanceMs: 350
          });
        }
      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSystemHealth();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(fetchSystemHealth, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading && !health) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Verificando sistema...
        </Typography>
      </Box>
    );
  }

  if (!health) {
    return (
      <Tooltip title="Sistema no disponible" arrow>
        <Chip
          icon={<ErrorIcon />}
          label="Sistema N/A"
          color="error"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  const analysisPercentage = (health.mtssAnalyzed / health.totalStocks) * 100;
  
  const getHealthStatus = () => {
    if (analysisPercentage >= 80) {
      return {
        color: 'success' as const,
        icon: <CheckCircleIcon />,
        label: 'Sistema Óptimo'
      };
    } else if (analysisPercentage >= 50) {
      return {
        color: 'warning' as const,
        icon: <WarningIcon />,
        label: 'Sistema Parcial'
      };
    } else {
      return {
        color: 'error' as const,
        icon: <ErrorIcon />,
        label: 'Sistema Limitado'
      };
    }
  };

  const status = getHealthStatus();

  const tooltipContent = (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        Estado del Sistema MTSS
      </Typography>
      <Typography variant="caption" display="block">
        📊 Stocks analizados: {health.mtssAnalyzed}/{health.totalStocks} ({analysisPercentage.toFixed(1)}%)
      </Typography>
      <Typography variant="caption" display="block">
        🕐 Última actualización: {health.lastUpdateTime}
      </Typography>
      <Typography variant="caption" display="block">
        ⚡ Performance promedio: {health.performanceMs}ms
      </Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} arrow>
      <Chip
        icon={status.icon}
        label={`${health.mtssAnalyzed} MTSS activos`}
        color={status.color}
        size="small"
        variant="filled"
        sx={{
          '& .MuiChip-label': {
            fontSize: '0.75rem'
          }
        }}
      />
    </Tooltip>
  );
};

export default SystemHealthIndicator;