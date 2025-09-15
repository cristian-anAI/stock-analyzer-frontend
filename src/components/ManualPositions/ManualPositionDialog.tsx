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
  Autocomplete,
  Chip,
} from '@mui/material';
import { Position, ManualPosition, Stock, Crypto } from '../../types';
import { positionService, stockService, cryptoService } from '../../services/api';

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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Stock | Crypto | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  // Load stocks and cryptos data when modal opens
  useEffect(() => {
    if (open) {
      loadAssetsData();
    }
  }, [open]);

  const loadAssetsData = async () => {
    try {
      setDataLoading(true);
      const [stocksData, cryptosData] = await Promise.all([
        stockService.getStocksByScore(),
        cryptoService.getCryptosByScore()
      ]);
      setStocks(stocksData);
      setCryptos(cryptosData);
    } catch (err) {
      console.error('Error loading assets data:', err);
    } finally {
      setDataLoading(false);
    }
  };

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
      // Find the asset in our lists to pre-select it
      const allAssets = [...stocks, ...cryptos];
      const foundAsset = allAssets.find(asset => asset.symbol === position.symbol);
      setSelectedAsset(foundAsset || null);
    } else {
      setFormData({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: 1, // Default to 1 instead of 0
        entryPrice: 0,
        notes: '',
      });
      setSelectedAsset(null);
    }
    setError(null);
    setShowWarning(false);
  }, [position, open, stocks, cryptos]);

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

  const handleAssetSelect = (asset: Stock | Crypto | null) => {
    setSelectedAsset(asset);
    setShowWarning(false);
    
    if (asset) {
      // Determine asset type based on the lists it belongs to
      const isStock = stocks.some(s => s.symbol === asset.symbol);
      const assetType = isStock ? 'stock' : 'crypto';
      
      setFormData(prev => ({
        ...prev,
        symbol: asset.symbol,
        name: asset.name,
        type: assetType,
        entryPrice: Number(asset.currentPrice.toFixed(2)), // Auto-fill with current price (max 2 decimals)
      }));
    }
  };

  const handleSymbolInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, symbol: value }));
    
    // Clear any previous selection when user types
    if (selectedAsset && selectedAsset.symbol !== value) {
      setSelectedAsset(null);
      setFormData(prev => ({ 
        ...prev, 
        name: '',
        type: 'stock',
        entryPrice: 0
      }));
    }
    
    if (value && !selectedAsset) {
      // Only auto-complete on EXACT symbol match (case insensitive)
      const allAssets = [...stocks, ...cryptos];
      const exactMatch = allAssets.find(asset => 
        asset.symbol.toLowerCase() === value.toLowerCase()
      );
      
      if (!exactMatch) {
        // Show warning only if user has typed more than 2 characters
        if (value.length > 2) {
          setShowWarning(true);
        }
      } else {
        setShowWarning(false);
        // Auto-select only on exact match, not on partial matches
        handleAssetSelect(exactMatch);
      }
    } else if (!value) {
      // Clear warning and selection when input is empty
      setShowWarning(false);
      setSelectedAsset(null);
    }
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

            <Autocomplete
              options={[...stocks, ...cryptos]}
              getOptionLabel={(option) => 
                typeof option === 'string' ? option : `${option.symbol} - ${option.name}`
              }
              value={selectedAsset || undefined}
              inputValue={formData.symbol}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  // Don't auto-complete while typing
                  return;
                } else if (newValue) {
                  // Only auto-select when user clicks on an option from dropdown
                  handleAssetSelect(newValue as Stock | Crypto);
                }
              }}
              onInputChange={(event, newInputValue, reason) => {
                // Only update on user input, not on option selection
                if (reason === 'input') {
                  handleSymbolInputChange(newInputValue);
                }
              }}
              filterOptions={(options, { inputValue }) => {
                if (!inputValue) return options;
                
                // Filter options that contain the input value, prioritizing exact matches
                const filtered = options.filter(option =>
                  option.symbol.toLowerCase().includes(inputValue.toLowerCase()) ||
                  option.name.toLowerCase().includes(inputValue.toLowerCase())
                );
                
                // Sort to put exact symbol matches first
                return filtered.sort((a, b) => {
                  const aSymbolMatch = a.symbol.toLowerCase() === inputValue.toLowerCase();
                  const bSymbolMatch = b.symbol.toLowerCase() === inputValue.toLowerCase();
                  
                  if (aSymbolMatch && !bSymbolMatch) return -1;
                  if (!aSymbolMatch && bSymbolMatch) return 1;
                  
                  // Then sort by symbol startsWith
                  const aStartsWith = a.symbol.toLowerCase().startsWith(inputValue.toLowerCase());
                  const bStartsWith = b.symbol.toLowerCase().startsWith(inputValue.toLowerCase());
                  
                  if (aStartsWith && !bStartsWith) return -1;
                  if (!aStartsWith && bStartsWith) return 1;
                  
                  // Finally alphabetical
                  return a.symbol.localeCompare(b.symbol);
                });
              }}
              loading={dataLoading}
              freeSolo
              disableClearable
              autoHighlight={true}
              autoSelect={false}
              blurOnSelect={true}
              clearOnBlur={false}
              includeInputInList={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Símbolo *"
                  placeholder="Busca o escribe: AAPL, BTC..."
                  required
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    autoComplete: 'off',
                  }}
                />
              )}
              renderOption={(props, option) => {
                if (typeof option === 'string') return null;
                return (
                  <Box component="li" {...props} display="flex" justifyContent="space-between">
                    <Box>
                      <strong>{option.symbol}</strong> - {option.name}
                    </Box>
                    <Box>
                      <Chip 
                        label={stocks.some(s => s.symbol === option.symbol) ? 'Stock' : 'Crypto'} 
                        size="small" 
                        color={stocks.some(s => s.symbol === option.symbol) ? 'primary' : 'secondary'}
                      />
                      <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
                        ${option.currentPrice.toFixed(2)}
                      </span>
                    </Box>
                  </Box>
                );
              }}
            />

            {showWarning && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                No se encontró información para este símbolo. Los datos de precios y análisis pueden no estar disponibles.
              </Alert>
            )}

            <TextField
              label="Nombre *"
              value={formData.name}
              onChange={handleChange('name')}
              placeholder="ej: Apple Inc., Bitcoin"
              fullWidth
              required
              disabled={!!selectedAsset} // Disable if asset is auto-selected
            />

            <FormControl fullWidth>
              <InputLabel>Tipo *</InputLabel>
              <Select
                value={formData.type}
                onChange={handleChange('type')}
                label="Tipo *"
                required
                disabled={!!selectedAsset} // Disable when asset is selected
              >
                <MenuItem value="stock">Stock</MenuItem>
                <MenuItem value="crypto">Crypto</MenuItem>
              </Select>
            </FormControl>
            {selectedAsset && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Tipo detectado automáticamente: {formData.type === 'stock' ? 'Stock' : 'Crypto'}
              </Alert>
            )}

            <TextField
              label="Cantidad *"
              type="number"
              value={formData.quantity}
              onChange={handleChange('quantity')}
              inputProps={{ 
                min: 0, 
                step: formData.type === 'crypto' ? 0.001 : 1,
                'aria-label': 'Cantidad a comprar'
              }}
              placeholder={formData.type === 'crypto' ? '0.001' : '1'}
              helperText={formData.type === 'crypto' ? 
                'Puedes usar decimales para crypto (ej: 0.5)' : 
                'Número de acciones (entero)'
              }
              fullWidth
              required
            />

            <Box>
              <TextField
                label="Precio de Entrada *"
                type="number"
                value={formData.entryPrice}
                onChange={handleChange('entryPrice')}
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
                required
                helperText={selectedAsset ? 
                  `Precio actual: $${selectedAsset.currentPrice.toFixed(2)}` : 
                  'Introduce el precio de compra'
                }
              />
              {selectedAsset && formData.entryPrice !== selectedAsset.currentPrice && formData.entryPrice > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => setFormData(prev => ({ ...prev, entryPrice: Number(selectedAsset.currentPrice.toFixed(2)) }))}
                    variant="outlined"
                  >
                    Usar precio actual (${selectedAsset.currentPrice.toFixed(2)})
                  </Button>
                </Box>
              )}
            </Box>

            {/* Investment summary */}
            {formData.quantity > 0 && formData.entryPrice > 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Box>
                  <strong>Resumen de la inversión:</strong>
                  <br />
                  Cantidad: {formData.quantity} {formData.type === 'stock' ? 'acciones' : 'unidades'}
                  <br />
                  Precio por unidad: ${formData.entryPrice.toFixed(formData.type === 'crypto' ? 4 : 2)}
                  <br />
                  <strong>Valor total: ${(formData.quantity * formData.entryPrice).toFixed(2)}</strong>
                </Box>
              </Alert>
            )}

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