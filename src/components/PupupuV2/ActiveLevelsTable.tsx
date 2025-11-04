import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip
} from '@mui/material';
import { PivotLevel, getPivotStrengthColor, formatPriceUSD } from '../../types';

interface ActiveLevelsTableProps {
  resistances: PivotLevel[];
  supports: PivotLevel[];
}

export const ActiveLevelsTable: React.FC<ActiveLevelsTableProps> = ({
  resistances,
  supports,
}) => {
  const [showAllResistances, setShowAllResistances] = useState(false);
  const [showAllSupports, setShowAllSupports] = useState(false);

  const displayedResistances = showAllResistances ? resistances : resistances.slice(0, 5);
  const displayedSupports = showAllSupports ? supports : supports.slice(0, 5);

  const getStrengthChip = (strength: number) => {
    const color = getPivotStrengthColor(strength);
    return (
      <Chip
        label={strength.toFixed(2)}
        color={color}
        size="small"
      />
    );
  };

  const getRowColor = (strength: number): string => {
    if (strength > 0.8) return 'rgba(76, 175, 80, 0.08)'; // green
    if (strength >= 0.6) return 'rgba(255, 193, 7, 0.08)'; // yellow
    return 'rgba(158, 158, 158, 0.04)'; // gray
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* Resistances Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="error.main">
              🔴 Resistances ({resistances.length})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sort: Strength ▼
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Strength</TableCell>
                  <TableCell align="center">Touches</TableCell>
                  <TableCell align="right">Distance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedResistances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No active resistances
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedResistances.map((level, idx) => (
                    <TableRow
                      key={idx}
                      sx={{ bgcolor: getRowColor(level.strength) }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPriceUSD(level.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStrengthChip(level.strength)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {level.touches}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main" fontWeight="medium">
                          +{level.distance_pct.toFixed(2)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {resistances.length > 5 && (
            <Box mt={2} textAlign="center">
              <Button
                size="small"
                onClick={() => setShowAllResistances(!showAllResistances)}
              >
                {showAllResistances ? 'Show Less' : `Show All (${resistances.length})`}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Supports Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="success.main">
              🟢 Supports ({supports.length})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sort: Strength ▼
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Strength</TableCell>
                  <TableCell align="center">Touches</TableCell>
                  <TableCell align="right">Distance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedSupports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No active supports
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedSupports.map((level, idx) => (
                    <TableRow
                      key={idx}
                      sx={{ bgcolor: getRowColor(level.strength) }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatPriceUSD(level.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStrengthChip(level.strength)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {level.touches}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                          {level.distance_pct.toFixed(2)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {supports.length > 5 && (
            <Box mt={2} textAlign="center">
              <Button
                size="small"
                onClick={() => setShowAllSupports(!showAllSupports)}
              >
                {showAllSupports ? 'Show Less' : `Show All (${supports.length})`}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
