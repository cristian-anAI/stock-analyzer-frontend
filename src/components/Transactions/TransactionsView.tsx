import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Snackbar,
  TextField,
  MenuItem,
  TablePagination,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  Info as InfoIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { Transaction } from '../../types';
import { portfolioService } from '../../services/api';
import { usePolling } from '../../hooks/usePolling';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TransactionsView: React.FC = () => {
  const [stockTransactions, setStockTransactions] = useState<Transaction[]>([]);
  const [cryptoTransactions, setCryptoTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'symbol' | 'amount' | 'score'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modal for transaction details
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both stock and crypto transactions
      const [stockData, cryptoData] = await Promise.all([
        portfolioService.getStockTransactions(),
        portfolioService.getCryptoTransactions()
      ]);
      
      setStockTransactions(stockData.transactions);
      setCryptoTransactions(cryptoData.transactions);
    } catch (err) {
      setError('Error al cargar las transacciones');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto refresh every 10 minutes
  usePolling(fetchTransactions, { 
    interval: 10 * 60 * 1000, 
    enabled: !loading && !refreshing 
  });

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await portfolioService.refreshPortfolio();
      await fetchTransactions();
      setSnackbarOpen(true);
    } catch (err) {
      setError('Error al actualizar las transacciones');
      console.error('Error refreshing transactions:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0); // Reset page when switching tabs
  };

  const getCurrentTransactions = () => {
    return tabValue === 0 ? stockTransactions : cryptoTransactions;
  };

  const getFilteredTransactions = () => {
    let transactions = getCurrentTransactions();

    // Apply filters
    if (searchTerm) {
      transactions = transactions.filter(t => 
        t.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      transactions = transactions.filter(t => t.action === actionFilter);
    }

    // Sort
    transactions.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'symbol':
          aValue = a.symbol;
          bValue = b.symbol;
          break;
        case 'amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'score':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        default: // timestamp
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return transactions;
  };

  const paginatedTransactions = () => {
    const filtered = getFilteredTransactions();
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    });
  };

  const getActionChipColor = (action: string): 'success' | 'error' => {
    return action === 'buy' ? 'success' : 'error';
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' | 'info' => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'info';
    if (score >= 4) return 'warning';
    return 'error';
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalOpen(true);
  };

  const getReasonSummary = (reason: string): string => {
    // Truncate long reasons for table display
    if (reason.length > 50) {
      return reason.substring(0, 50) + '...';
    }
    return reason;
  };

  const renderTransactionsTable = (transactions: Transaction[]) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Símbolo</TableCell>
            <TableCell align="center">Acción</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Precio</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell align="right">Comisiones</TableCell>
            <TableCell align="center">Score</TableCell>
            <TableCell>Razón</TableCell>
            <TableCell align="center">Fuente</TableCell>
            <TableCell align="center">Detalles</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow 
              key={`${transaction.symbol}-${transaction.timestamp}-${index}`} 
              hover
              sx={{ cursor: 'pointer' }}
              onClick={() => handleTransactionClick(transaction)}
            >
              <TableCell>
                <Typography variant="body2">
                  {formatDate(transaction.timestamp)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  {transaction.symbol}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={transaction.action.toUpperCase()}
                  color={getActionChipColor(transaction.action)}
                  size="small"
                  icon={transaction.action === 'buy' ? <TrendingUp /> : <TrendingDown />}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {transaction.quantity.toLocaleString('es-ES', { maximumFractionDigits: 6 })}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2">
                  {formatAmount(transaction.price)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  color={transaction.action === 'buy' ? 'error.main' : 'success.main'}
                >
                  {formatAmount(transaction.total_amount)}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" color="textSecondary">
                  {formatAmount(transaction.fees)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {transaction.score ? (
                  <Chip
                    label={transaction.score.toFixed(1)}
                    color={getScoreColor(transaction.score)}
                    size="small"
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    N/A
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Tooltip title={transaction.reason} arrow>
                  <Typography variant="body2" color="textSecondary">
                    {getReasonSummary(transaction.reason)}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={transaction.source}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" color="primary">
                  <InfoIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const filteredTransactions = getFilteredTransactions();
  const currentTransactions = getCurrentTransactions();

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Historial de Transacciones
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            disabled
          >
            Exportar
          </Button>
        </Box>
      </Box>

      {/* Estadísticas Resumen */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {currentTransactions.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Transacciones
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {currentTransactions.filter(t => t.action === 'buy').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Compras
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="error.main">
                {currentTransactions.filter(t => t.action === 'sell').length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Ventas
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {formatAmount(currentTransactions.reduce((sum, t) => sum + t.total_amount, 0))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Volumen Total
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Filtros */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Buscar por símbolo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Acción"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as any)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="buy">Compras</MenuItem>
          <MenuItem value="sell">Ventas</MenuItem>
        </TextField>
        <TextField
          select
          label="Ordenar por"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="timestamp">Fecha</MenuItem>
          <MenuItem value="symbol">Símbolo</MenuItem>
          <MenuItem value="amount">Monto</MenuItem>
          <MenuItem value="score">Score</MenuItem>
        </TextField>
        <TextField
          select
          label="Orden"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as any)}
          size="small"
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="desc">Desc</MenuItem>
          <MenuItem value="asc">Asc</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Stocks (${stockTransactions.length})`} />
          <Tab label={`Cryptos (${cryptoTransactions.length})`} />
        </Tabs>
      </Box>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
        Mostrando {paginatedTransactions().length} de {filteredTransactions.length} transacciones
        {searchTerm && ` (filtradas de ${currentTransactions.length} total)`}
      </Typography>

      <TabPanel value={tabValue} index={0}>
        {renderTransactionsTable(paginatedTransactions())}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderTransactionsTable(paginatedTransactions())}
      </TabPanel>

      {/* Paginación */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={filteredTransactions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
        }
      />

      {/* Modal de detalles de transacción */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de Transacción - {selectedTransaction?.symbol}
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Información General
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mb={3}>
                <Box display="flex" gap={4}>
                  <Typography><strong>Símbolo:</strong> {selectedTransaction.symbol}</Typography>
                  <Typography><strong>Acción:</strong> 
                    <Chip 
                      label={selectedTransaction.action.toUpperCase()} 
                      color={getActionChipColor(selectedTransaction.action)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Box display="flex" gap={4}>
                  <Typography><strong>Fecha:</strong> {formatDate(selectedTransaction.timestamp)}</Typography>
                  <Typography><strong>Fuente:</strong> {selectedTransaction.source}</Typography>
                </Box>
                <Box display="flex" gap={4}>
                  <Typography><strong>Cantidad:</strong> {selectedTransaction.quantity.toLocaleString('es-ES', { maximumFractionDigits: 6 })}</Typography>
                  <Typography><strong>Precio:</strong> {formatAmount(selectedTransaction.price)}</Typography>
                </Box>
                <Box display="flex" gap={4}>
                  <Typography><strong>Total:</strong> {formatAmount(selectedTransaction.total_amount)}</Typography>
                  <Typography><strong>Comisiones:</strong> {formatAmount(selectedTransaction.fees)}</Typography>
                </Box>
                {selectedTransaction.score && (
                  <Typography><strong>Score en el momento:</strong> 
                    <Chip 
                      label={selectedTransaction.score.toFixed(1)} 
                      color={getScoreColor(selectedTransaction.score)}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Razón de la Transacción
              </Typography>
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1">
                  {selectedTransaction.reason}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Transacciones actualizadas correctamente"
      />
    </Box>
  );
};

export default TransactionsView;