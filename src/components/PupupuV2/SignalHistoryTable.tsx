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
  Select,
  MenuItem,
  FormControl,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { SignalHistoryItem, TradeDirection, getConfidenceColorPupupu, getDirectionIcon, formatPriceUSD } from '../../types';

interface SignalHistoryTableProps {
  signals: SignalHistoryItem[];
}

const SignalRow: React.FC<{ signal: SignalHistoryItem }> = ({ signal }) => {
  const [open, setOpen] = useState(false);
  const confidenceColor = getConfidenceColorPupupu(signal.confidence);
  const directionColor = signal.direction === 'LONG' ? 'success.main' : 'error.main';

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(signal.timestamp).toLocaleTimeString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={`${getDirectionIcon(signal.direction)} ${signal.direction}`}
            size="small"
            sx={{ color: directionColor, borderColor: directionColor }}
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {formatPriceUSD(signal.entry_price)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={`${signal.confidence.toFixed(1)}%`}
            color={confidenceColor}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" color="text.secondary">
            {signal.pivot_touch_price ? formatPriceUSD(signal.pivot_touch_price) : '-'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="body2" gutterBottom fontWeight="medium">
                Signal Details
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Entry:</Typography>
                  <Typography variant="caption">{formatPriceUSD(signal.entry_price)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Stop Loss:</Typography>
                  <Typography variant="caption" color="error.main">{formatPriceUSD(signal.stop_loss)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Take Profit:</Typography>
                  <Typography variant="caption" color="success.main">{formatPriceUSD(signal.take_profit)}</Typography>
                </Box>
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">Reason:</Typography>
                  <Typography variant="caption" display="block">
                    {signal.reason}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const SignalHistoryTable: React.FC<SignalHistoryTableProps> = ({
  signals,
}) => {
  const [filter, setFilter] = useState<'all' | 'LONG' | 'SHORT'>('all');

  const filteredSignals = filter === 'all'
    ? signals
    : signals.filter(s => s.direction === filter);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📜 Signal History
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="LONG">LONG</MenuItem>
                <MenuItem value="SHORT">SHORT</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Latest {signals.length}
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={50} />
                <TableCell>Time</TableCell>
                <TableCell>Direction</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Pivot Touch</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSignals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No signals found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSignals.map((signal, idx) => (
                  <SignalRow key={idx} signal={signal} />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
