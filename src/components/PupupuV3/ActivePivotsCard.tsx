import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PupupuV3PivotLevel } from '../../types';

interface ActivePivotsCardProps {
  activeResistances: PupupuV3PivotLevel[];
  activeSupports: PupupuV3PivotLevel[];
  currentPrice: number;
}

export const ActivePivotsCard: React.FC<ActivePivotsCardProps> = ({
  activeResistances,
  activeSupports,
  currentPrice,
}) => {
  const PivotItem = ({
    pivot,
    type
  }: {
    pivot: PupupuV3PivotLevel;
    type: 'resistance' | 'support'
  }) => {
    const isResistance = type === 'resistance';
    const distance = Math.abs(pivot.price - currentPrice);
    const distancePct = (distance / currentPrice) * 100;

    const strengthColor =
      (pivot.strength || 0) >= 80 ? 'success.main' :
      (pivot.strength || 0) >= 60 ? 'warning.main' :
      'error.main';

    return (
      <Box
        mb={1.5}
        p={2}
        sx={{
          backgroundColor: 'action.hover',
          borderRadius: 1,
          borderLeft: 4,
          borderColor: isResistance ? '#26a69a' : '#ff5252',
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            {isResistance ? (
              <TrendingUpIcon sx={{ color: '#26a69a', fontSize: 20 }} />
            ) : (
              <TrendingDownIcon sx={{ color: '#ff5252', fontSize: 20 }} />
            )}
            <Typography variant="body2" fontWeight="bold" sx={{ color: isResistance ? '#26a69a' : '#ff5252' }}>
              {isResistance ? 'RESISTANCE' : 'SUPPORT'}
            </Typography>
          </Box>
          <Chip
            label="ACTIVE"
            size="small"
            color="success"
            variant="filled"
          />
        </Box>

        {/* Price */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          ${pivot.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>

        {/* Distance from current price */}
        <Box display="flex" gap={2} mb={1}>
          <Typography variant="caption" color="text.secondary">
            Distance: <strong>${distance.toFixed(2)}</strong> ({distancePct.toFixed(2)}%)
          </Typography>
        </Box>

        {/* Stats */}
        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Strength: <span style={{ color: strengthColor, fontWeight: 'bold' }}>{(pivot.strength || 0).toFixed(1)}</span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Touches: <strong>{pivot.touches || 0}</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {pivot.bars_since || 0} bars ago
          </Typography>
        </Box>
      </Box>
    );
  };

  const hasResistances = activeResistances && activeResistances.length > 0;
  const hasSupports = activeSupports && activeSupports.length > 0;

  if (!hasResistances && !hasSupports) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Active Pivot Levels
          </Typography>
          <Box
            p={3}
            textAlign="center"
            sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              No active pivots found
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Waiting for price to approach key levels...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            🎯 Active Pivot Levels
          </Typography>
          <Box display="flex" gap={1}>
            <Chip
              label={`${activeResistances.length} Res`}
              size="small"
              sx={{ backgroundColor: '#26a69a', color: 'white' }}
            />
            <Chip
              label={`${activeSupports.length} Sup`}
              size="small"
              sx={{ backgroundColor: '#ff5252', color: 'white' }}
            />
          </Box>
        </Box>

        <Box mb={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Price: <strong>${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
          </Typography>
        </Box>

        {/* Resistances */}
        {hasResistances && (
          <Box mb={2}>
            <Typography variant="body2" fontWeight="bold" color="#26a69a" gutterBottom>
              🔴 Resistances (Above)
            </Typography>
            {activeResistances.map((pivot, index) => (
              <PivotItem
                key={`resistance-${index}`}
                pivot={pivot}
                type="resistance"
              />
            ))}
          </Box>
        )}

        {/* Supports */}
        {hasSupports && (
          <Box>
            <Typography variant="body2" fontWeight="bold" color="#ff5252" gutterBottom>
              🟢 Supports (Below)
            </Typography>
            {activeSupports.map((pivot, index) => (
              <PivotItem
                key={`support-${index}`}
                pivot={pivot}
                type="support"
              />
            ))}
          </Box>
        )}

        <Box mt={2} p={1.5} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Active pivots are within range of current price. Strength indicates reliability (0-100).
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
