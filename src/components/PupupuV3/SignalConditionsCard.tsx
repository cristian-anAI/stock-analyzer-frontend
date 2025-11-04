import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Divider, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import { PupupuV3SignalConditions } from '../../types';

interface SignalConditionsCardProps {
  conditions: PupupuV3SignalConditions | null;
  hasSignal: boolean;
}

export const SignalConditionsCard: React.FC<SignalConditionsCardProps> = ({ conditions, hasSignal }) => {
  if (!conditions) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔍 Signal Conditions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading conditions...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const ConditionRow = ({ label, met, detail }: { label: string; met: boolean; detail?: string }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
      <Box display="flex" alignItems="center" gap={1}>
        {met ? (
          <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
        ) : (
          <CancelIcon sx={{ fontSize: 18, color: 'error.main' }} />
        )}
        <Typography variant="body2" fontWeight="medium">
          {label}
        </Typography>
      </Box>
      {detail && (
        <Typography variant="caption" color="text.secondary">
          {detail}
        </Typography>
      )}
    </Box>
  );

  const allConditionsMet =
    (conditions.price_near_resistance || conditions.price_near_support) &&
    conditions.ema_above_price !== undefined &&
    conditions.vwap_above_price !== undefined &&
    (conditions.in_value_area || conditions.near_hvn);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            🔍 Signal Conditions
          </Typography>
          <Chip
            label={hasSignal ? 'SIGNAL ACTIVE' : 'NO SIGNAL'}
            color={hasSignal ? 'success' : 'default'}
            variant={hasSignal ? 'filled' : 'outlined'}
          />
        </Box>

        {!hasSignal && (
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              Waiting for all conditions to align for a valid signal
            </Typography>
          </Alert>
        )}

        {/* Pivot Conditions */}
        <Typography variant="body2" fontWeight="bold" color="primary" mb={1}>
          Pivot Touch
        </Typography>
        <ConditionRow
          label="Near Resistance"
          met={conditions.price_near_resistance}
          detail={conditions.closest_resistance_price
            ? `$${conditions.closest_resistance_price.toLocaleString()} (${conditions.closest_resistance_distance.toFixed(2)}%)`
            : 'N/A'
          }
        />
        <ConditionRow
          label="Near Support"
          met={conditions.price_near_support}
          detail={conditions.closest_support_price
            ? `$${conditions.closest_support_price.toLocaleString()} (${conditions.closest_support_distance.toFixed(2)}%)`
            : 'N/A'
          }
        />

        <Divider sx={{ my: 2 }} />

        {/* EMA Conditions */}
        <Typography variant="body2" fontWeight="bold" color="primary" mb={1}>
          EMA(15) Alignment
        </Typography>
        <ConditionRow
          label={conditions.ema_above_price ? 'EMA Above Price' : 'EMA Below Price'}
          met={true}
          detail={`${Math.abs(conditions.ema_distance_pct).toFixed(2)}% (${Math.abs(conditions.ema_distance).toFixed(2)})`}
        />

        <Divider sx={{ my: 2 }} />

        {/* VWAP Conditions */}
        <Typography variant="body2" fontWeight="bold" color="primary" mb={1}>
          VWAP Alignment
        </Typography>
        <ConditionRow
          label={conditions.vwap_above_price ? 'VWAP Above Price' : 'VWAP Below Price'}
          met={true}
          detail={`${Math.abs(conditions.vwap_distance_pct).toFixed(2)}% (${Math.abs(conditions.vwap_distance).toFixed(2)})`}
        />

        <Divider sx={{ my: 2 }} />

        {/* Volume Profile Conditions */}
        <Typography variant="body2" fontWeight="bold" color="primary" mb={1}>
          Volume Profile Support
        </Typography>
        <ConditionRow
          label="In Value Area"
          met={conditions.in_value_area}
        />
        <ConditionRow
          label="Near High Volume Node"
          met={conditions.near_hvn}
        />

        <Divider sx={{ my: 2 }} />

        {/* Summary */}
        <Box p={1.5} sx={{ backgroundColor: allConditionsMet ? 'success.dark' : 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Summary
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {hasSignal
              ? '✅ All conditions aligned - Signal generated'
              : '⏳ Waiting for optimal entry conditions'
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
