import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
} from '@mui/material';
import {
  Storage as CacheIcon,
  Refresh as RefreshIcon,
  Delete as ClearIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { cacheService } from '../../services/cache';

interface CacheIndicatorProps {
  compact?: boolean;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({ compact = false }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cacheStats, setCacheStats] = useState({ size: 0, keys: [] as string[] });

  const updateStats = () => {
    setCacheStats(cacheService.getStats());
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    updateStats(); // Refresh stats when opening menu
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearCache = () => {
    cacheService.clear();
    updateStats();
    handleClose();
  };

  const getCacheStatus = () => {
    if (cacheStats.size === 0) {
      return {
        color: 'default' as const,
        label: compact ? 'Cache' : 'Cache Vacío',
        tooltip: 'Sin datos en caché',
      };
    } else if (cacheStats.size < 5) {
      return {
        color: 'warning' as const,
        label: compact ? `${cacheStats.size}` : `Cache (${cacheStats.size})`,
        tooltip: `${cacheStats.size} elementos en caché`,
      };
    } else {
      return {
        color: 'success' as const,
        label: compact ? `${cacheStats.size}` : `Cache (${cacheStats.size})`,
        tooltip: `${cacheStats.size} elementos en caché - datos cargando rápido`,
      };
    }
  };

  const config = getCacheStatus();

  return (
    <>
      <Tooltip title={config.tooltip} placement="bottom">
        <Box display="inline-block">
          <Chip
            icon={<CacheIcon fontSize="small" />}
            label={config.label}
            color={config.color}
            size="small"
            variant="outlined"
            onClick={handleClick}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          />
        </Box>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 250 },
        }}
      >
        <MenuItem disabled>
          <Box display="flex" alignItems="center" gap={1}>
            <InfoIcon fontSize="small" />
            <Typography variant="body2" fontWeight="bold">
              Estado del Cache
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider />
        
        <MenuItem disabled>
          <Typography variant="body2">
            Elementos: {cacheStats.size}
          </Typography>
        </MenuItem>
        
        {cacheStats.keys.map((key) => {
          const info = cacheService.getInfo(key);
          const ageInMinutes = info.age ? Math.floor(info.age / 60000) : 0;
          const expiresInMinutes = info.expiresIn ? Math.floor(info.expiresIn / 60000) : 0;
          
          return (
            <MenuItem key={key} disabled>
              <Box>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  {key}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Edad: {ageInMinutes}m | Expira en: {expiresInMinutes}m
                </Typography>
              </Box>
            </MenuItem>
          );
        })}
        
        {cacheStats.size > 0 && (
          <>
            <Divider />
            <MenuItem onClick={handleClearCache}>
              <Box display="flex" alignItems="center" gap={1}>
                <ClearIcon fontSize="small" />
                <Typography variant="body2">
                  Limpiar Cache
                </Typography>
              </Box>
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
};

export default CacheIndicator;