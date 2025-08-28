import React from 'react';
import {
  Chip,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import { getScoreColor, getScoreLabel, getScoreDescription } from '../../types';

interface ScoreChipProps {
  score: number;
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

const ScoreChip: React.FC<ScoreChipProps> = ({ 
  score, 
  size = 'small', 
  showLabel = false 
}) => {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const description = getScoreDescription(score);


  const tooltipContent = (
    <Box>
      <Typography variant="body2" fontWeight="bold">
        {label} ({score.toFixed(1)}/10)
      </Typography>
      <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
        {description}
      </Typography>
    </Box>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <Chip
        label={showLabel ? `${score.toFixed(1)} - ${label}` : score.toFixed(1)}
        color={color}
        size={size}
        sx={{ 
          fontWeight: 'bold', 
          minWidth: showLabel ? 'auto' : 60,
          cursor: 'help',
        }}
      />
    </Tooltip>
  );
};

export default ScoreChip;