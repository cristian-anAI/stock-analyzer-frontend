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
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PupupuV3SignalHistory, getPupupuV3DirectionColor } from '../../types';

interface RecentSignalsTableProps {
  signals: PupupuV3SignalHistory[];
}

export const RecentSignalsTable: React.FC<RecentSignalsTableProps> = ({ signals }) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'active'>('all');

  const filteredSignals = signals.filter((signal) => {
    if (filter === 'all') return true;
    if (filter === 'wins') return signal.outcome === 'win';
    if (filter === 'losses') return signal.outcome === 'loss';
    if (filter === 'active') return signal.status === 'active';
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📜 Recent Signals ({filteredSignals.length})
          </Typography>
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, newFilter) => newFilter && setFilter(newFilter)}
            size="small"
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="wins">Wins</ToggleButton>
            <ToggleButton value="losses">Losses</ToggleButton>
            <ToggleButton value="active">Active</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Entry</TableCell>
                <TableCell align="right">SL</TableCell>
                <TableCell align="right">TP1</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">P&L</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSignals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      No signals found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSignals.map((signal, index) => {
                  const directionColor = getPupupuV3DirectionColor(signal.type);
                  const pnlColor = signal.pnl && signal.pnl >= 0 ? 'success.main' : 'error.main';

                  return (
                    <TableRow key={signal.id || index} hover>
                      <TableCell>
                        <Typography variant="caption">{signal.timestamp ? formatDate(signal.timestamp) : '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {signal.symbol || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={signal.type === 'LONG' ? <TrendingUpIcon /> : <TrendingDownIcon />}
                          label={signal.type}
                          color={directionColor}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${(signal.entry || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${(signal.stop_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${(signal.tp1 || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={(signal.status || 'unknown').toUpperCase()}
                          size="small"
                          color={signal.status === 'closed' ? 'default' : signal.status === 'active' ? 'primary' : 'error'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {signal.pnl !== undefined ? (
                          <Typography variant="body2" fontWeight="bold" sx={{ color: pnlColor }}>
                            ${signal.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
