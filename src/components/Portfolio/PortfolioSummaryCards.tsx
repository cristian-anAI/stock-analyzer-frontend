import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CurrencyBitcoin,
  Timeline,
  AttachMoney,
} from '@mui/icons-material';
import { PortfolioOverview } from '../../types';

interface PortfolioSummaryCardsProps {
  overview: PortfolioOverview;
}

const PortfolioSummaryCards: React.FC<PortfolioSummaryCardsProps> = ({ overview }) => {
  const { portfolios, summary } = overview;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    const formatted = percent.toFixed(2);
    return `${percent >= 0 ? '+' : ''}${formatted}%`;
  };

  return (
    <Box>
      {/* Summary Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} mb={4}>
        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Timeline color="primary" />
                <Typography variant="h6" color="textSecondary">
                  Capital Total
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(summary.total_current_capital)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de {formatCurrency(summary.total_initial_capital)} inicial
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AttachMoney color={summary.total_pnl >= 0 ? 'success' : 'error'} />
                <Typography variant="h6" color="textSecondary">
                  P&L Total
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                fontWeight="bold"
                color={summary.total_pnl >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(summary.total_pnl)}
              </Typography>
              <Chip
                label={formatPercent(summary.total_roi_percent)}
                color={summary.total_roi_percent >= 0 ? 'success' : 'error'}
                size="small"
              />
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccountBalance color="info" />
                <Typography variant="h6" color="textSecondary">
                  Stocks Portfolio
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(portfolios.stocks.current_capital)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {portfolios.stocks.roi_percent >= 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2"
                  color={portfolios.stocks.roi_percent >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatPercent(portfolios.stocks.roi_percent)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • {portfolios.stocks.total_trades} trades
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="250px">
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CurrencyBitcoin color="warning" />
                <Typography variant="h6" color="textSecondary">
                  Crypto Portfolio
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(portfolios.crypto.current_capital)}
              </Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                {portfolios.crypto.roi_percent >= 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography 
                  variant="body2"
                  color={portfolios.crypto.roi_percent >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatPercent(portfolios.crypto.roi_percent)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  • {portfolios.crypto.total_trades} trades
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Detailed Portfolio Cards */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="1" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Stocks Portfolio
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Capital Inicial:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.stocks.initial_capital)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Capital Actual:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.stocks.current_capital)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Cash Disponible:</Typography>
                <Typography 
                  fontWeight="medium"
                  color={portfolios.stocks.available_cash >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(portfolios.stocks.available_cash)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Cantidad Invertida:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.stocks.invested_amount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Total Trades:</Typography>
                <Typography fontWeight="medium">
                  {portfolios.stocks.total_trades}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1" minWidth="400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ₿ Crypto Portfolio
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Capital Inicial:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.crypto.initial_capital)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Capital Actual:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.crypto.current_capital)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Cash Disponible:</Typography>
                <Typography 
                  fontWeight="medium"
                  color={portfolios.crypto.available_cash >= 0 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(portfolios.crypto.available_cash)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography color="textSecondary">Cantidad Invertida:</Typography>
                <Typography fontWeight="medium">
                  {formatCurrency(portfolios.crypto.invested_amount)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Total Trades:</Typography>
                <Typography fontWeight="medium">
                  {portfolios.crypto.total_trades}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioSummaryCards;