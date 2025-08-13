import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as ConnectedIcon,
  Error as DisconnectedIcon,
} from '@mui/icons-material';
import { healthService } from '../../services/api';

interface ApiStatusProps {
  compact?: boolean;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ compact = false }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkApiHealth();
    // Check every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkApiHealth = async () => {
    try {
      await healthService.healthCheck();
      setStatus('connected');
      setLastCheck(new Date());
    } catch (error) {
      setStatus('disconnected');
      setLastCheck(new Date());
      console.warn('API health check failed:', error);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'success' as const,
          icon: <ConnectedIcon fontSize="small" />,
          label: compact ? 'API' : 'API Conectada',
          tooltip: `API conectada correctamente\nÚltima verificación: ${lastCheck?.toLocaleTimeString()}`,
        };
      default:
        return {
          color: 'error' as const,
          icon: <DisconnectedIcon fontSize="small" />,
          label: compact ? 'Offline' : 'API Desconectada',
          tooltip: `API no disponible\nÚltima verificación: ${lastCheck?.toLocaleTimeString()}`,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip} placement="bottom">
      <Box display="inline-block">
        <Chip
          icon={config.icon}
          label={config.label}
          color={config.color}
          size="small"
          variant="outlined"
          onClick={checkApiHealth}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default ApiStatus;