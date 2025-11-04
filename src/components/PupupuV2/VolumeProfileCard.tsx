import React from 'react';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import { VolumeProfileSet, formatPriceUSD } from '../../types';

interface VolumeProfileCardProps {
  volumeProfile: VolumeProfileSet;
  currentPrice: number;
}

export const VolumeProfileCard: React.FC<VolumeProfileCardProps> = ({
  volumeProfile,
  currentPrice,
}) => {
  const { vp_corto, vp_medio, vp_largo } = volumeProfile;

  const renderVPSection = (label: string, vp: any, timeframe: string) => {
    const valueArea = vp.vah - vp.val;
    const valueAreaPct = ((valueArea / vp.poc) * 100);

    return (
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label} ({timeframe}):
        </Typography>
        <Box ml={2}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">POC:</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              {formatPriceUSD(vp.poc)} ●
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">VAH:</Typography>
            <Typography variant="body2" fontWeight="medium" color="error.main">
              {formatPriceUSD(vp.vah)} ▲
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2">VAL:</Typography>
            <Typography variant="body2" fontWeight="medium" color="success.main">
              {formatPriceUSD(vp.val)} ▼
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              Value Area:
            </Typography>
            <Typography variant="caption" fontWeight="medium">
              {formatPriceUSD(valueArea)} ({valueAreaPct.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const totalHVN = vp_corto.hvn_count + vp_medio.hvn_count + (vp_largo?.hvn_count || 0);
  const totalLVN = vp_corto.lvn_count + vp_medio.lvn_count + (vp_largo?.lvn_count || 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Volume Profile
        </Typography>

        <Box mt={2}>
          {renderVPSection('VP Corto', vp_corto, '4h')}
          <Divider sx={{ my: 2 }} />
          {renderVPSection('VP Medio', vp_medio, '24h')}
          {vp_largo && (
            <>
              <Divider sx={{ my: 2 }} />
              {renderVPSection('VP Largo', vp_largo, '7d')}
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" fontWeight="medium">
            HVN Nodes: <span style={{ color: '#4caf50' }}>{totalHVN}</span>
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            LVN Nodes: <span style={{ color: '#f44336' }}>{totalLVN}</span>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
