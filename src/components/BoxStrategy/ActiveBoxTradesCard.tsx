import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  ActiveBoxTrade,
  getMLConfidenceColor,
  getMLConfidenceEmoji,
  getTradeDirectionEmoji,
} from '../../types';

interface ActiveBoxTradesCardProps {
  trades: ActiveBoxTrade[];
  lastUpdate?: Date | null;
}

export const ActiveBoxTradesCard: React.FC<ActiveBoxTradesCardProps> = ({
  trades,
  lastUpdate,
}) => {
  if (trades.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📦 Active Box Trades (0)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No active trades at the moment
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📦 Active Box Trades ({trades.length})
          </Typography>
          {lastUpdate && (
            <Typography variant="caption" color="text.secondary">
              Updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          {trades.map((trade) => (
            <Card
              key={trade.breakout_key}
              variant="outlined"
              sx={{
                border: trade.tp1_hit ? 3 : 1,
                borderColor: trade.tp1_hit ? 'success.main' : 'divider',
                bgcolor: trade.tp1_hit ? 'success.light' + '08' : 'background.paper',
              }}
            >
              <CardContent>
                {/* Header: Market & Direction */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {getTradeDirectionEmoji(trade.direction as any)} {trade.market} - {trade.direction}
                  </Typography>
                  <Chip
                    label={`${getMLConfidenceEmoji(trade.ml_confidence as any)} ${trade.ml_confidence} ${trade.ml_win_probability.toFixed(1)}%`}
                    color={getMLConfidenceColor(trade.ml_confidence as any)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                {/* Entry & Stop Loss */}
                <Box display="flex" gap={3} mb={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Entry
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      ${trade.entry_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Stop Loss
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="medium">
                        ${trade.stop_loss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                      {trade.stop_moved_to_breakeven && (
                        <Chip
                          label="BE"
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Take Profits */}
                <Box display="flex" gap={2} mb={2}>
                  <Box flex="1">
                    <Typography variant="caption" color="text.secondary" display="block">
                      TP1 (50%)
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {trade.tp1_hit && (
                        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                      )}
                      <Typography variant="body2" fontWeight={trade.tp1_hit ? 'bold' : 'medium'}>
                        ${trade.tp1.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box flex="1">
                    <Typography variant="caption" color="text.secondary" display="block">
                      TP2 (25%)
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${trade.tp2.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box flex="1">
                    <Typography variant="caption" color="text.secondary" display="block">
                      TP3 (25%)
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      ${trade.tp3.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Additional Info */}
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Risk: <span style={{ fontWeight: 'bold' }}>{trade.risk_points.toFixed(1)} pts</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entered: <span style={{ fontWeight: 'bold' }}>{new Date(trade.entry_time).toLocaleTimeString()}</span>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
