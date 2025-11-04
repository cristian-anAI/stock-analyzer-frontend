import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PupupuV3ActiveTrade } from '../../types';

interface ActiveTradesPanelProps {
  trades: PupupuV3ActiveTrade[];
}

const getStateEmoji = (state: string): string => {
  switch (state) {
    case 'ACTIVE':
      return '🟢';
    case 'TP1_HIT':
      return '🎯';
    case 'RUNNER':
      return '🏃';
    default:
      return '📊';
  }
};

const getStateColor = (state: string): 'success' | 'warning' | 'primary' | 'default' => {
  switch (state) {
    case 'ACTIVE':
      return 'success';
    case 'TP1_HIT':
      return 'warning';
    case 'RUNNER':
      return 'primary';
    default:
      return 'default';
  }
};

export const ActiveTradesPanel: React.FC<ActiveTradesPanelProps> = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🎯 Active Positions (0)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            No active positions at the moment
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🎯 Active Positions ({trades.length})
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} mt={2}>
          {trades.map((trade, index) => {
            const isLong = trade.direction === 'LONG';
            const borderColor = isLong ? 'success.main' : 'error.main';
            const pnlColor = (trade.unrealized_pnl || 0) >= 0 ? 'success.main' : 'error.main';

            return (
              <Card key={trade.trade_id || index} variant="outlined" sx={{ borderLeft: 4, borderColor }}>
                <CardContent>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {isLong ? <TrendingUpIcon sx={{ color: 'success.main' }} /> : <TrendingDownIcon sx={{ color: 'error.main' }} />}
                      <Typography variant="body1" fontWeight="bold">
                        {trade.symbol} - {trade.direction}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${getStateEmoji(trade.state)} ${trade.state.replace(/_/g, ' ')}`}
                      size="small"
                      color={getStateColor(trade.state)}
                    />
                  </Box>

                  {/* Special message for TP1_HIT */}
                  {trade.state === 'TP1_HIT' && (
                    <Box mb={2} p={1} sx={{ backgroundColor: 'warning.dark', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: 'warning.contrastText', fontWeight: 'bold' }}>
                        ✅ TP1 Hit - Stop Loss moved to BREAKEVEN
                      </Typography>
                    </Box>
                  )}

                  {/* Prices */}
                  <Box display="flex" gap={3} mb={2} flexWrap="wrap">
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Entry
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        ${(trade.entry_price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    {trade.current_price && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Current
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          ${trade.current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Stop Loss {trade.state === 'TP1_HIT' ? '(@ BE)' : ''}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ color: 'error.main' }}>
                        ${(trade.current_stop_loss || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Take Profits */}
                  <Box display="flex" gap={2} mb={2}>
                    <Box flex="1">
                      <Typography variant="caption" color="text.secondary" display="block">
                        TP1
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        {(trade.state === 'TP1_HIT' || trade.state === 'RUNNER') && (
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 14 }} />
                        )}
                        <Typography variant="body2" fontSize="0.85rem">
                          ${(trade.take_profit_1 || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    </Box>
                    {trade.take_profit_2 && (
                      <Box flex="1">
                        <Typography variant="caption" color="text.secondary" display="block">
                          TP2 (ML)
                        </Typography>
                        <Typography variant="body2" fontSize="0.85rem">
                          ${trade.take_profit_2.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    )}
                    {trade.take_profit_3 && (
                      <Box flex="1">
                        <Typography variant="caption" color="text.secondary" display="block">
                          TP3 (ML)
                        </Typography>
                        <Typography variant="body2" fontSize="0.85rem">
                          ${trade.take_profit_3.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Unrealized PnL & Position Remaining */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    {trade.unrealized_pnl !== undefined ? (
                      <Typography variant="body2" fontWeight="bold" sx={{ color: pnlColor }}>
                        P&L: ${trade.unrealized_pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        P&L: Calculating...
                      </Typography>
                    )}
                    {trade.position_remaining !== undefined && (
                      <Typography variant="body2" color="text.secondary">
                        Position: {trade.position_remaining}%
                      </Typography>
                    )}
                  </Box>

                  {/* Position Progress Bar */}
                  {trade.position_remaining !== undefined && (
                    <LinearProgress
                      variant="determinate"
                      value={trade.position_remaining}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: pnlColor,
                        },
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};
