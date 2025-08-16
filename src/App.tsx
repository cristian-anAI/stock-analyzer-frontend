import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import CustomThemeProvider from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import StocksView from './components/Stocks/StocksView';
import CryptosView from './components/Cryptos/CryptosView';
import PositionsView from './components/Positions/PositionsView';
import ManualPositionsView from './components/ManualPositions/ManualPositionsView';
import TransactionsView from './components/Transactions/TransactionsView';

function App() {
  return (
    <CustomThemeProvider>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<StocksView />} />
            <Route path="/cryptos" element={<CryptosView />} />
            <Route path="/positions" element={<PositionsView />} />
            <Route path="/manual-positions" element={<ManualPositionsView />} />
            <Route path="/transactions" element={<TransactionsView />} />
          </Routes>
        </Layout>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;
