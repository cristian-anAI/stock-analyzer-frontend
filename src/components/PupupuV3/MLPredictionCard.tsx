import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Divider } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { PupupuV3MLPrediction, getPupupuV3ProbabilityColor } from '../../types';

interface MLPredictionCardProps {
  prediction: PupupuV3MLPrediction | null;
}

export const MLPredictionCard: React.FC<MLPredictionCardProps> = ({ prediction }) => {
  if (!prediction) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <SmartToyIcon />
            <Typography variant="h6">ML Dynamic Take Profits</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            No ML prediction available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const TPPrediction = ({ label, ratio, price, probability, timeframe, emphasize }: {
    label: string;
    ratio: number;
    price: number;
    probability: number;
    timeframe: string;
    emphasize?: boolean;
  }) => {
    const probColor = getPupupuV3ProbabilityColor(probability || 0);

    return (
      <Box mb={2}>
        <Typography variant="body2" fontWeight={emphasize ? 'bold' : 'medium'} mb={0.5}>
          {label}
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="body2" color="text.secondary">
            Ratio: {ratio || 0}:1
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ${(price || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="caption" color="text.secondary">
            Probability
          </Typography>
          <Typography variant="caption" fontWeight="bold" sx={{ color: `${probColor}.main` }}>
            {((probability || 0) * 100).toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(probability || 0) * 100}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              backgroundColor: `${probColor}.main`,
            },
          }}
        />
        <Box display="flex" justifyContent="flex-end" mt={0.5}>
          <Typography variant="caption" color="text.secondary">
            Timeframe: {timeframe || 'N/A'}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6">ML Dynamic Take Profits</Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="medium">
              Overall Confidence
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ color: 'primary.main' }}>
              {((prediction.confidence_score || 0) * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <TPPrediction
          label="TP2 Prediction"
          ratio={prediction.tp2_ratio}
          price={prediction.tp2_price}
          probability={prediction.tp2_probability}
          timeframe={prediction.tp2_timeframe}
          emphasize
        />
        <TPPrediction
          label="TP3 Prediction"
          ratio={prediction.tp3_ratio}
          price={prediction.tp3_price}
          probability={prediction.tp3_probability}
          timeframe={prediction.tp3_timeframe}
        />
      </CardContent>
    </Card>
  );
};
