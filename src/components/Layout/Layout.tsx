import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as StocksIcon,
  CurrencyBitcoin as CryptoIcon,
  AccountBalance as PositionsIcon,
  Edit as ManualIcon,
  History as TransactionsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiStatus from '../Common/ApiStatus';
import ThemeToggle from '../Common/ThemeToggle';
import CacheIndicator from '../Common/CacheIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Stocks', path: '/stocks', icon: <StocksIcon /> },
  { text: 'Cryptos', path: '/cryptos', icon: <CryptoIcon /> },
  { text: 'Posiciones Autotrader', path: '/positions', icon: <PositionsIcon /> },
  { text: 'Posiciones Manuales', path: '/manual-positions', icon: <ManualIcon /> },
  { text: 'Historial Transacciones', path: '/transactions', icon: <TransactionsIcon /> },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4 }}>
            Stock Analyzer
          </Typography>
          
          {/* Navigation Icons */}
          <Box display="flex" alignItems="center" gap={1} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <Tooltip key={item.text} title={item.text} arrow>
                <IconButton
                  color="inherit"
                  onClick={() => navigate(item.path)}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>

          {/* Status indicators */}
          <Box display="flex" alignItems="center" gap={1}>
            <CacheIndicator />
            <ThemeToggle />
            <ApiStatus />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content taking full width */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          p: 3,
          mt: 8, // Account for AppBar height
          width: '100%'
        }}
      >
        <Container maxWidth={false} sx={{ px: 2 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;