# Stock Analyzer Frontend

Este es el frontend de la aplicación Stock Analyzer desarrollado en React con TypeScript y Material-UI.

## Estructura del Proyecto

```
src/
├── components/
│   ├── Autotrader/          # Componentes del autotrader
│   ├── Common/              # Componentes reutilizables
│   ├── Cryptos/             # Vista de criptomonedas
│   ├── Dashboard/           # Dashboard principal con portfolio overview
│   ├── Layout/              # Layout principal de la aplicación
│   ├── ManualPositions/     # Gestión de posiciones manuales
│   ├── Portfolio/           # Componentes del portfolio (NUEVO)
│   ├── Positions/           # Vista de posiciones
│   └── Stocks/              # Vista de stocks
├── services/                # Servicios API
├── types/                   # Definiciones de tipos TypeScript
└── hooks/                   # Custom hooks
```

## Funcionalidades Implementadas

### ✅ Dashboard con Portfolio Overview
- **Componente**: `Dashboard.tsx`
- **Servicio API**: `portfolioService.getOverview()`
- **Endpoint**: `GET /api/v1/portfolio/overview`
- **Características**:
  - Resumen total del capital y P&L
  - Comparación entre portfolios de stocks y crypto
  - Indicadores visuales con colores para ganancias/pérdidas
  - Auto-refresh cada 5 minutos

### ✅ Análisis de Stocks y Cryptos
- **Componentes**: `StocksView.tsx`, `CryptosView.tsx`
- **Características**:
  - Tabla con scores, precios y cambios
  - Ordenamiento por score
  - Indicadores de tendencia
  - Auto-refresh

### ✅ Gestión de Posiciones Manuales
- **Componente**: `ManualPositionsView.tsx`
- **Características**:
  - CRUD completo de posiciones manuales
  - Cálculo automático de P&L
  - Validación de datos

### ✅ Servicios API Portfolio
- **Archivo**: `services/api.ts`
- **Endpoints implementados**:
  - `GET /api/v1/portfolio/overview` - Overview general
  - `GET /api/v1/portfolio/stocks/positions` - Posiciones stocks
  - `GET /api/v1/portfolio/crypto/positions` - Posiciones crypto
  - `GET /api/v1/portfolio/stocks/transactions` - Transacciones stocks
  - `GET /api/v1/portfolio/crypto/transactions` - Transacciones crypto
  - `GET /api/v1/portfolio/stocks/performance` - Performance stocks
  - `GET /api/v1/portfolio/crypto/performance` - Performance crypto
  - `GET /api/v1/portfolio/analytics/comparison` - Comparación de carteras

## Tipos de Datos Portfolio

### PortfolioOverview
```typescript
{
  portfolios: {
    stocks: PortfolioData;
    crypto: PortfolioData;
  };
  summary: {
    total_initial_capital: number;
    total_current_capital: number;
    total_pnl: number;
    total_roi_percent: number;
  };
}
```

### PortfolioData
```typescript
{
  initial_capital: number;
  current_capital: number;
  available_cash: number;
  invested_amount: number;
  total_pnl: number;
  roi_percent: number;
  total_trades: number;
}
```

## Pendientes por Implementar

### 🔄 Componentes de Posiciones por Cartera
- **Objetivo**: Crear vistas detalladas de posiciones para stocks y crypto
- **Componentes a crear**:
  - `StockPositionsView.tsx`
  - `CryptoPositionsView.tsx`
  - `PositionsTable.tsx` (reutilizable)

### 🔄 Historial de Transacciones
- **Objetivo**: Vista completa del historial de transacciones
- **Componentes a crear**:
  - `TransactionsView.tsx`
  - `TransactionFilters.tsx`
  - `TransactionsList.tsx`

### 🔄 Gráficos de Performance
- **Objetivo**: Visualización de métricas de performance
- **Componentes a crear**:
  - `CapitalEvolutionChart.tsx`
  - `WinRateChart.tsx`
  - `VolumeChart.tsx`

## Problemas Conocidos y Soluciones

### ❌ Error de toFixed() en undefined
- **Problema**: Propiedades numéricas llegaban como `undefined` desde el API
- **Solución**: Agregado fallback `(value || 0)` en todas las llamadas a `.toFixed()`
- **Archivos afectados**: `ManualPositionsView.tsx`, `CryptosView.tsx`

### ❌ Precios en cero en Cryptos
- **Problema**: `currentPrice` llegaba como 0, pero `change` tenía el precio real
- **Solución**: Lógica condicional para usar `change` como precio si `currentPrice` es 0
- **Archivo**: `CryptosView.tsx:158`

### ❌ Error de Grid en Material-UI
- **Problema**: Incompatibilidad con versión de Material-UI
- **Solución**: Reemplazado Grid con Box y flexbox
- **Archivo**: `PortfolioSummaryCards.tsx`

### ❌ Error 500 en API de Cryptos
- **Problema**: Backend error "1 validation error for C…int_from_float"
- **Causa**: Problema de validación Pydantic en el backend al convertir float a int
- **Estado**: PROBLEMA DEL BACKEND - No del frontend
- **Endpoint afectado**: `GET /api/v1/cryptos?sort=score`
- **Error**: `Request failed with status code 500`

### ❌ Error de Grid en Material-UI (RECURRENTE)
- **Problema**: `Property 'item' does not exist on type` en componentes con Grid
- **Causa**: Incompatibilidad entre versión de Material-UI instalada y sintaxis de Grid
- **Solución**: Reemplazar todos los `<Grid container>` y `<Grid item>` con `<Box>` y flexbox
- **Archivos afectados**: 
  - `StocksView.tsx` (corregido)
  - `CryptosView.tsx` (corregido)
  - `PortfolioSummaryCards.tsx` (corregido)
- **Patrón de corrección**:
  ```typescript
  // ❌ Antes (Error)
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <Card>...</Card>
    </Grid>
  </Grid>
  
  // ✅ Después (Funciona)
  <Box display="flex" gap={2} flexWrap="wrap">
    <Box flex="1" minWidth="200px">
      <Card>...</Card>
    </Box>
  </Box>
  ```

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm build` - Construye la aplicación para producción
- `npm test` - Ejecuta las pruebas

## Variables de Entorno

```env
REACT_APP_API_URL=http://localhost:8000
```

## Notas de Desarrollo

1. **Cache**: Implementado sistema de cache con TTL para optimizar requests
2. **Auto-refresh**: Componentes se actualizan automáticamente usando `usePolling`
3. **Error Handling**: Manejo consistente de errores con alertas
4. **Responsive**: Layout adaptable usando flexbox
5. **TypeScript**: Tipado estricto para mejor desarrollo

## Próximos Pasos

1. Completar componentes de posiciones por cartera
2. Implementar historial de transacciones con filtros
3. Agregar gráficos de performance
4. Implementar notificaciones push
5. Optimizar rendimiento con React.memo y useCallback

## API Backend Requerido

El frontend espera que el backend implemente los siguientes endpoints con la estructura de datos definida en `types/index.ts`. Ver documentación de endpoints en el código fuente para detalles completos.