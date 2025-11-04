import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { PupupuV3PendingTrade } from '../../types';

interface PendingOrdersPanelProps {
  pendingTrades: PupupuV3PendingTrade[];
  currentPrice: number;
}

export const PendingOrdersPanel: React.FC<PendingOrdersPanelProps> = ({
  pendingTrades,
  currentPrice,
}) => {
  if (!pendingTrades || pendingTrades.length === 0) {
    return null; // Don't show if no pending orders
  }

  const PendingOrderCard = ({ trade }: { trade: PupupuV3PendingTrade }) => {
    const isLong = trade.direction === 'LONG';
    const distance = Math.abs(trade.entry_price - currentPrice);
    const distancePct = (distance / currentPrice) * 100;
    const borderColor = isLong ? '#ffa726' : '#ef5350'; // Orange for LONG, Red for SHORT

    return (
      <Box
        mb={2}
        p={2}
        sx={{
          backgroundColor: 'action.hover',
          borderRadius: 1,
          borderLeft: 4,
          borderColor,
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <AccessTimeIcon sx={{ color: borderColor, fontSize: 20 }} />
            <Typography variant="body2" fontWeight="bold" sx={{ color: borderColor }}>
              LIMIT ORDER {trade.direction}
            </Typography>
          </Box>
          <Chip
            label="PENDING"
            size="small"
            sx={{
              backgroundColor: borderColor,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* Entry Price */}
        <Box mb={1.5}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Entry Price (Limit Order)
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            ${trade.entry_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Distance: ${distance.toFixed(2)} ({distancePct.toFixed(3)}%)
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Stop Loss & TP1 */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Stop Loss
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: 'error.main' }}>
              ${trade.stop_loss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">
              TP1
            </Typography>
            <Typography variant="body2" fontWeight="bold" sx={{ color: 'success.main' }}>
              ${trade.take_profit_1.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
        </Box>

        {/* ML Dynamic TPs */}
        {(trade.take_profit_2 || trade.take_profit_3) && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              ML Dynamic Targets:
            </Typography>
            <Box display="flex" gap={1}>
              {trade.take_profit_2 && (
                <Chip
                  label={`TP2: $${trade.take_profit_2.toLocaleString()}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              {trade.take_profit_3 && (
                <Chip
                  label={`TP3: $${trade.take_profit_3.toLocaleString()}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Box>
          </Box>
        )}

        {/* Timestamp */}
        {trade.created_at && (
          <Box mt={1.5}>
            <Typography variant="caption" color="text.secondary">
              Created: {new Date(trade.created_at).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            🟡 Pending Limit Orders
          </Typography>
          <Chip
            label={`${pendingTrades.length} waiting`}
            size="small"
            color="warning"
            variant="filled"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Current Price: <strong>${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </Typography>

        {pendingTrades.map((trade, index) => (
          <PendingOrderCard key={trade.trade_id || index} trade={trade} />
        ))}

        <Box mt={2} p={1.5} sx={{ backgroundColor: 'action.selected', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ⏳ These orders will activate when price touches the entry level
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
