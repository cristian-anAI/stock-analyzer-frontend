import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  PupupuV3CurrentAnalysis,
  getPupupuV3DirectionColor,
  getPupupuV3DirectionEmoji,
  getPupupuV3ConfidenceColor,
} from '../../types';

interface CurrentSignalCardProps {
  analysis: PupupuV3CurrentAnalysis | null;
}

export const CurrentSignalCard: React.FC<CurrentSignalCardProps> = ({ analysis }) => {
  if (!analysis?.signal) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            ⚪ No Active Signal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            Waiting for setup conditions to align...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { signal, ml_prediction, current_price, symbol } = analysis;
  const directionColor = getPupupuV3DirectionColor(signal.direction);
  const directionEmoji = getPupupuV3DirectionEmoji(signal.direction);

  const PriceLevel = ({ label, price, color, subtitle }: {
    label: string;
    price: number;
    color: string;
    subtitle?: string;
  }) => (
    <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
      <Typography variant="body2" fontWeight="medium">
        {label}:
      </Typography>
      <Box textAlign="right">
        <Typography variant="body2" fontWeight="bold" sx={{ color }}>
          ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const ConditionCheck = ({ label, met }: { label: string; met: boolean }) => (
    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
      {met ? (
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
      ) : (
        <CancelIcon sx={{ color: 'text.disabled', fontSize: 16 }} />
      )}
      <Typography variant="body2" color={met ? 'text.primary' : 'text.disabled'}>
        {label}
      </Typography>
    </Box>
  );

  return (
    <Card sx={{ borderLeft: 6, borderColor: `${directionColor}.main` }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {directionEmoji} {signal.direction} SIGNAL
          </Typography>
          <Chip label={symbol} variant="outlined" size="small" />
        </Box>

        {/* Current Price */}
        <Typography variant="h4" fontWeight="bold" mb={3} sx={{ color: `${directionColor}.main` }}>
          ${current_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>

        {/* Price Levels */}
        <Box mb={2}>
          <PriceLevel label="Entry" price={signal.entry_price} color="info.main" />
          <PriceLevel label="Stop Loss" price={signal.stop_loss} color="error.main" />
          <PriceLevel
            label="TP1"
            price={signal.tp1}
            color="success.main"
            subtitle="50% exit + move to BE"
          />

          {ml_prediction && (
            <>
              <PriceLevel
                label="TP2"
                price={ml_prediction.tp2_price}
                color="warning.main"
                subtitle={`R:R ${ml_prediction.tp2_ratio}:1 | ${(ml_prediction.tp2_probability * 100).toFixed(0)}% prob | ${ml_prediction.tp2_timeframe}`}
              />
              <PriceLevel
                label="TP3"
                price={ml_prediction.tp3_price}
                color="info.main"
                subtitle={`R:R ${ml_prediction.tp3_ratio}:1 | ${(ml_prediction.tp3_probability * 100).toFixed(0)}% prob | ${ml_prediction.tp3_timeframe}`}
              />
            </>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Risk & Position Size */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2" color="text.secondary">
            Risk: <span style={{ fontWeight: 'bold' }}>${signal.risk_amount}</span>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Size: <span style={{ fontWeight: 'bold' }}>{signal.position_size.toFixed(4)} BTC</span>
          </Typography>
        </Box>

        {/* ML Confidence */}
        {ml_prediction && (
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                ML Confidence
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {(ml_prediction.confidence_score * 100).toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={ml_prediction.confidence_score * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: `${getPupupuV3ConfidenceColor(ml_prediction.confidence_score)}.main`,
                },
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Conditions */}
        <Box>
          <Typography variant="body2" fontWeight="medium" mb={1}>
            Setup Conditions:
          </Typography>
          <ConditionCheck label={`Pivot: ${signal.pivot_touch}`} met={signal.pivot_touch !== 'None'} />
          <ConditionCheck label={`EMA: ${signal.ema_test}`} met={signal.ema_test !== 'None'} />
          <ConditionCheck label={`VWAP: ${signal.vwap_aligned}`} met={signal.vwap_aligned !== 'None'} />
          <ConditionCheck label={`Volume: ${signal.volume_profile_support}`} met={signal.volume_profile_support !== 'None'} />
        </Box>
      </CardContent>
    </Card>
  );
};
