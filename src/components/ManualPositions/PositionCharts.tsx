import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { ManualPosition, PositionAnalysis } from '../../types';

interface PositionChartsProps {
  position: ManualPosition;
  analysisData?: PositionAnalysis | null;
  loading?: boolean;
}

const PositionCharts: React.FC<PositionChartsProps> = ({
  position,
  analysisData,
  loading = false,
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!analysisData || !analysisData.priceHistory || analysisData.priceHistory.length === 0) {
    return (
      <Alert severity="warning">
        No chart data available for this position
      </Alert>
    );
  }

  // Prepare price chart data
  const priceChartData = analysisData.priceHistory.map((item, index) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    price: item.close || 0,
    volume: item.volume || 0,
    ma20: analysisData.technical?.movingAverages?.ma20 || 0,
    ma50: analysisData.technical?.movingAverages?.ma50 || 0,
    entryPrice: position.entryPrice || 0,
    stopLoss: analysisData.exitStrategies?.stopLoss?.price || 0,
    takeProfit: analysisData.exitStrategies?.takeProfit?.price || 0,
  }));

  // Prepare P&L timeline data (mock data based on price history)
  const pnlTimelineData = analysisData.priceHistory.map((item, index) => {
    const closePrice = item.close || 0;
    const entryPrice = position.entryPrice || 0;
    const quantity = position.quantity || 0;
    
    const dailyPnL = (closePrice - entryPrice) * quantity;
    const dailyPnLPercent = entryPrice > 0 ? ((closePrice - entryPrice) / entryPrice) * 100 : 0;
    
    return {
      date: new Date(item.timestamp).toLocaleDateString(),
      pnl: dailyPnL,
      pnlPercent: dailyPnLPercent,
      drawdown: Math.min(0, dailyPnLPercent), // Simple drawdown calculation
    };
  });

  // Risk visualization data
  const riskData = [
    { name: 'Current Position', value: 65, fill: '#8884d8' },
    { name: 'Available Capacity', value: 35, fill: '#82ca9d' },
  ];

  const volatilityData = [
    { name: 'Volatility Percentile', value: (analysisData.riskMetrics?.volatility || 0) * 100, fill: '#ff7300' },
  ];

  // Technical indicators data for subplot
  const technicalData = analysisData.priceHistory.map((item, index) => ({
    date: new Date(item.timestamp).toLocaleDateString(),
    rsi: (analysisData.technical?.rsi || 50) + (Math.random() - 0.5) * 10, // Mock variation
    macd: (analysisData.technical?.macd?.value || 0) + (Math.random() - 0.5) * 1,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card>
          <CardContent sx={{ p: 1 }}>
            <Typography variant="body2" fontWeight="bold">{label}</Typography>
            {payload.map((entry: any, index: number) => (
              <Typography key={index} variant="caption" style={{ color: entry.color }}>
                {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
              </Typography>
            ))}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* Price Chart with Technical Indicators */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Price Chart with Technical Analysis
          </Typography>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={priceChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="price" orientation="left" />
              <YAxis yAxisId="volume" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Price lines */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="price" 
                stroke="#2196f3" 
                strokeWidth={2}
                name="Price"
                dot={false}
              />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="ma20" 
                stroke="#ff9800" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="MA20"
                dot={false}
              />
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="ma50" 
                stroke="#9c27b0" 
                strokeWidth={1}
                strokeDasharray="5 5"
                name="MA50"
                dot={false}
              />
              
              {/* Reference lines */}
              <ReferenceLine 
                yAxisId="price"
                y={position.entryPrice} 
                stroke="#4caf50" 
                strokeWidth={2}
                strokeDasharray="10 5"
                label="Entry"
              />
              <ReferenceLine 
                yAxisId="price"
                y={analysisData.exitStrategies?.stopLoss?.price || 0} 
                stroke="#f44336" 
                strokeWidth={2}
                strokeDasharray="10 5"
                label="Stop Loss"
              />
              <ReferenceLine 
                yAxisId="price"
                y={analysisData.exitStrategies?.takeProfit?.price || 0} 
                stroke="#4caf50" 
                strokeWidth={2}
                strokeDasharray="10 5"
                label="Take Profit"
              />
              
              {/* Volume bars */}
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#e0e0e0" 
                opacity={0.3}
                name="Volume"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* P&L Timeline */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            P&L Performance Timeline
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={pnlTimelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="pnlPercent" 
                stroke="#2196f3" 
                strokeWidth={2}
                name="P&L %"
              />
              <Bar 
                dataKey="drawdown" 
                fill="#f44336" 
                opacity={0.3}
                name="Drawdown"
              />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Technical Indicators Subplot */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Technical Indicators
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* RSI Chart */}
            <Box>
              <Typography variant="subtitle2">RSI (14)</Typography>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={technicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="rsi" 
                    stroke="#ff5722" 
                    strokeWidth={2}
                    name="RSI"
                  />
                  <ReferenceLine y={70} stroke="#f44336" strokeDasharray="3 3" label="Overbought" />
                  <ReferenceLine y={30} stroke="#4caf50" strokeDasharray="3 3" label="Oversold" />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {/* MACD Chart */}
            <Box>
              <Typography variant="subtitle2">MACD</Typography>
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={technicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="macd" 
                    stroke="#3f51b5" 
                    strokeWidth={2}
                    name="MACD"
                  />
                  <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Risk Visualization */}
      <Box display="flex" gap={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk/Reward Ratio
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="center" height={200}>
              <Box textAlign="center">
                <Typography variant="h3" color="primary">
                  1:{((analysisData.exitStrategies?.takeProfit?.upside || 0) / Math.abs(analysisData.exitStrategies?.stopLoss?.distance || 1)).toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Risk/Reward Ratio
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Risk: {Math.abs(analysisData.exitStrategies?.stopLoss?.distance || 0).toFixed(1)}% | 
                  Reward: {(analysisData.exitStrategies?.takeProfit?.upside || 0).toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Position Size
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              65% of portfolio allocated
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Volatility Percentile
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                width={200}
                height={200}
                cx="50%"
                cy="50%"
                innerRadius="40%"
                outerRadius="80%"
                data={volatilityData}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#ff7300"
                />
                <text 
                  x="50%" 
                  y="50%" 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize="20"
                  fontWeight="bold"
                >
                  {((analysisData.riskMetrics?.volatility || 0) * 100).toFixed(0)}%
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
              Above average volatility
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PositionCharts;