import React from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, Divider } from '@mui/material';
import { TradeSignal, getConfidenceColorPupupu, getDirectionIcon, formatPriceUSD, calculateRiskReward } from '../../types';

interface SignalAlertBoxProps {
  signal: TradeSignal;
  onDismiss?: () => void;
  onExecute?: () => void;
}

export const SignalAlertBox: React.FC<SignalAlertBoxProps> = ({
  signal,
  onDismiss,
  onExecute,
}) => {
  const confidenceColor = getConfidenceColorPupupu(signal.confidence);
  const directionColor = signal.direction === 'LONG' ? 'success.main' : 'error.main';
  const directionBg = signal.direction === 'LONG' ? 'success.light' : 'error.light';

  const riskReward = calculateRiskReward(
    signal.entry_price,
    signal.stop_loss,
    signal.take_profit,
    signal.direction
  );

  const stopLossDiff = Math.abs(signal.entry_price - signal.stop_loss);
  const takeProfitDiff = Math.abs(signal.take_profit - signal.entry_price);

  return (
    <Card
      sx={{
        border: 2,
        borderColor: directionColor,
        bgcolor: `${directionBg}08`,
        height: '100%'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: directionColor, fontWeight: 'bold' }}>
            🚨 ACTIVE TRADE SIGNAL
          </Typography>
          <Chip
            label={`${signal.confidence.toFixed(1)}%`}
            color={confidenceColor}
            size="medium"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Box mb={3}>
          <Typography variant="h4" sx={{ color: directionColor, fontWeight: 'bold' }}>
            {getDirectionIcon(signal.direction)} {signal.direction} @ {formatPriceUSD(signal.entry_price)}
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Entry:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatPriceUSD(signal.entry_price)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Stop Loss:
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="error.main">
              {formatPriceUSD(signal.stop_loss)} ({signal.direction === 'LONG' ? '-' : '+'}{formatPriceUSD(stopLossDiff)})
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Take Profit:
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="success.main">
              {formatPriceUSD(signal.take_profit)} ({signal.direction === 'LONG' ? '+' : '-'}{formatPriceUSD(takeProfitDiff)})
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Risk:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatPriceUSD(signal.risk_usd)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Reward:
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatPriceUSD(takeProfitDiff)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Risk:Reward:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              1:{riskReward.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box mb={3}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Reason:
          </Typography>
          <Typography variant="body1">
            {signal.reason}
          </Typography>
        </Box>

        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              bgcolor: directionColor,
              '&:hover': { bgcolor: directionColor, opacity: 0.9 }
            }}
            onClick={onExecute}
          >
            EXECUTE MANUALLY
          </Button>
          <Button
            variant="outlined"
            fullWidth
            color="inherit"
            onClick={onDismiss}
          >
            DISMISS
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
