import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PupupuV3AllPivots, PupupuV3PivotLevel } from '../../types';

interface PivotsDebugCardProps {
  allPivots: PupupuV3AllPivots | null;
  activeResistances: PupupuV3PivotLevel[];
  activeSupports: PupupuV3PivotLevel[];
}

export const PivotsDebugCard: React.FC<PivotsDebugCardProps> = ({
  allPivots,
  activeResistances,
  activeSupports,
}) => {
  if (!allPivots) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Pivot Levels Debug
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading pivot levels...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const PivotRow = ({ pivot, isActive }: { pivot: PupupuV3PivotLevel; isActive: boolean }) => {
    const strengthColor =
      (pivot.strength || 0) >= 3 ? 'success.main' :
      (pivot.strength || 0) >= 2 ? 'warning.main' :
      'error.main';

    return (
      <Box
        mb={1}
        p={1.5}
        sx={{
          backgroundColor: isActive ? 'action.selected' : 'action.hover',
          borderRadius: 1,
          borderLeft: 4,
          borderColor: isActive ? 'primary.main' : 'divider',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Box display="flex" alignItems="center" gap={1}>
            {isActive ? (
              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <CancelIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
            )}
            <Typography variant="body2" fontWeight="bold">
              ${pivot.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Chip
            label={isActive ? 'ACTIVE' : 'INACTIVE'}
            size="small"
            color={isActive ? 'success' : 'default'}
            variant={isActive ? 'filled' : 'outlined'}
          />
        </Box>

        <Box display="flex" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Strength: <span style={{ color: strengthColor, fontWeight: 'bold' }}>{pivot.strength || 0}</span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Touches: {pivot.touches || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Bars ago: {pivot.bars_since || 0}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎯 Pivot Levels Debug
        </Typography>

        {/* Active Summary */}
        <Box display="flex" gap={2} mb={2}>
          <Chip
            label={`${activeResistances.length} Active Resistances`}
            color="error"
            variant="outlined"
          />
          <Chip
            label={`${activeSupports.length} Active Supports`}
            color="success"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* All Resistances */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight="bold">
              🔴 All Resistances ({allPivots.all_resistances?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {allPivots.all_resistances && allPivots.all_resistances.length > 0 ? (
              <Box>
                {allPivots.all_resistances.map((pivot, index) => (
                  <PivotRow
                    key={`resistance-${index}`}
                    pivot={pivot}
                    isActive={pivot.is_active || false}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No resistances found
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* All Supports */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight="bold">
              🟢 All Supports ({allPivots.all_supports?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {allPivots.all_supports && allPivots.all_supports.length > 0 ? (
              <Box>
                {allPivots.all_supports.map((pivot, index) => (
                  <PivotRow
                    key={`support-${index}`}
                    pivot={pivot}
                    isActive={pivot.is_active || false}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No supports found
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        <Box mt={2} p={1.5} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Active pivots are within 0.5% of current price. Strength indicates pivot reliability (1-5).
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
