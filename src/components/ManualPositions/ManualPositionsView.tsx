import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Position } from '../../types';
import { positionService } from '../../services/api';
import ManualPositionDialog from './ManualPositionDialog';

const ManualPositionsView: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const data = await positionService.getManualPositions();
      setPositions(data);
    } catch (err) {
      setError('Error al cargar las posiciones manuales');
      console.error('Error fetching manual positions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setDialogOpen(true);
  };

  const handleEdit = (position: Position) => {
    setEditingPosition(position);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta posición?')) {
      try {
        await positionService.deleteManualPosition(id);
        await fetchPositions();
      } catch (err) {
        setError('Error al eliminar la posición');
        console.error('Error deleting position:', err);
      }
    }
  };

  const handleDialogClose = async (shouldRefresh: boolean = false) => {
    setDialogOpen(false);
    setEditingPosition(null);
    if (shouldRefresh) {
      await fetchPositions();
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Posiciones Manuales
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Posición
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        {positions.length} posiciones manuales
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Símbolo</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">Tipo</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Precio Entrada</TableCell>
              <TableCell align="right">Precio Actual</TableCell>
              <TableCell align="right">Valor Total</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell align="center">P&L %</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {position.symbol}
                  </Typography>
                </TableCell>
                <TableCell>{position.name}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={position.type === 'stock' ? 'Stock' : 'Crypto'}
                    color={position.type === 'stock' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">{position.quantity || 0}</TableCell>
                <TableCell align="right">${(position.entryPrice || 0).toFixed(2)}</TableCell>
                <TableCell align="right">${(position.currentPrice || 0).toFixed(2)}</TableCell>
                <TableCell align="right">${(position.value || 0).toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Typography
                    color={(position.pnl || 0) >= 0 ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    ${(position.pnl || 0).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${(position.pnlPercent || 0).toFixed(2)}%`}
                    color={(position.pnlPercent || 0) >= 0 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(position)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(position.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ManualPositionDialog
        open={dialogOpen}
        position={editingPosition}
        onClose={handleDialogClose}
      />
    </Box>
  );
};

export default ManualPositionsView;