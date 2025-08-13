import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Position, ManualPosition } from '../../types';
import { positionService } from '../../services/api';

interface ManualPositionDialogProps {
  open: boolean;
  position: Position | null;
  onClose: (shouldRefresh?: boolean) => void;
}

const ManualPositionDialog: React.FC<ManualPositionDialogProps> = ({
  open,
  position,
  onClose,
}) => {
  const [formData, setFormData] = useState<ManualPosition>({
    symbol: '',
    name: '',
    type: 'stock',
    quantity: 0,
    entryPrice: 0,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (position) {
      setFormData({
        symbol: position.symbol,
        name: position.name,
        type: position.type,
        quantity: position.quantity,
        entryPrice: position.entryPrice,
        notes: '',
      });
    } else {
      setFormData({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: 0,
        entryPrice: 0,
        notes: '',
      });
    }
    setError(null);
  }, [position, open]);

  const handleChange = (field: keyof ManualPosition) => (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'quantity' || field === 'entryPrice' 
        ? parseFloat(value as string) || 0 
        : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.symbol || !formData.name || formData.quantity <= 0 || formData.entryPrice <= 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (position) {
        await positionService.updateManualPosition(position.id, formData);
      } else {
        await positionService.createManualPosition(formData);
      }

      onClose(true);
    } catch (err) {
      setError(position ? 'Error al actualizar la posición' : 'Error al crear la posición');
      console.error('Error saving position:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {position ? 'Editar Posición' : 'Nueva Posición'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label="Símbolo *"
              value={formData.symbol}
              onChange={handleChange('symbol')}
              placeholder="ej: AAPL, BTC"
              fullWidth
              required
            />

            <TextField
              label="Nombre *"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="ej: Apple Inc., Bitcoin"
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Tipo *</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Tipo *"
                required
              >
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="crypto">Crypto</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Cantidad *"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              inputProps={{ min: 0, step: 0.001 }}
              fullWidth
              required
            />

            <TextField
              label="Precio de Entrada *"
              type="number"
              value={formData.entryPrice}
              onChange={handleChange('entryPrice')}
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth
              required
            />

            <TextField
              label="Notas"
              value={formData.notes || ''}
              onChange={handleChange('notes')}
              multiline
              rows={3}
              placeholder="Notas opcionales sobre la posición..."
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : (position ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ManualPositionDialog;