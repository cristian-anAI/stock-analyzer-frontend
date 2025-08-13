import React from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as StocksIcon,
  CurrencyBitcoin as CryptoIcon,
  AccountBalance as PositionsIcon,
  Edit as ManualIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import ApiStatus from '../Common/ApiStatus';
import ThemeToggle from '../Common/ThemeToggle';
import CacheIndicator from '../Common/CacheIndicator';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Stocks', path: '/stocks', icon: <StocksIcon /> },
  { text: 'Cryptos', path: '/cryptos', icon: <CryptoIcon /> },
  { text: 'Posiciones Autotrader', path: '/positions', icon: <PositionsIcon /> },
  { text: 'Posiciones Manuales', path: '/manual-positions', icon: <ManualIcon /> },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Stock Analyzer
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <CacheIndicator />
            <ThemeToggle />
            <ApiStatus />
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;