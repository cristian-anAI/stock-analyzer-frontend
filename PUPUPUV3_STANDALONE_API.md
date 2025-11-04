# PupupuV3 Standalone API - Especificación para Backend

## Estado Actual

✅ **Backend corriendo**: http://localhost:8001
✅ **Health check**: http://localhost:8001/health
✅ **Swagger docs**: http://localhost:8001/docs
✅ **Frontend configurado**: Fallback automático al puerto 8001

⏳ **Pendiente**: Implementar endpoints de datos

---

## Endpoints que Necesita el Frontend

El frontend intentará **automáticamente** estos endpoints cuando el API principal (puerto 8000) falle:

### 1. `GET /api/v1/pupupuv3/check`

**Propósito**: Análisis en tiempo real con señales, pivotes e indicadores

**Query Parameters**:
- `symbol` (string, opcional): Par de trading, default "BTC/USDT"

**Response**: Ver `PupupuV3CurrentAnalysis` en TypeScript

```json
{
  "symbol": "BTC/USDT",
  "timestamp": 1730280000000,
  "datetime": "2025-10-30T10:00:00",
  "current_price": 110500.50,

  "indicators": {
    "ema_15": 110450.25,
    "ema_distance_pct": 0.045,
    "ema_above_price": false,
    "vwap": 110600.75,
    "vwap_distance_pct": 0.091,
    "vwap_above_price": true
  },

  "active_resistances": [
    {
      "price": 111000.00,
      "strength": 75.5,
      "touches": 15,
      "bars_since": 45
    }
  ],

  "active_supports": [
    {
      "price": 110000.00,
      "strength": 80.2,
      "touches": 20,
      "bars_since": 30
    }
  ],

  "all_pivots": {
    "all_resistances": [
      {
        "price": 111000.00,
        "strength": 75.5,
        "touches": 15,
        "bars_since": 45,
        "is_active": true
      }
    ],
    "all_supports": [
      {
        "price": 110000.00,
        "strength": 80.2,
        "touches": 20,
        "bars_since": 30,
        "is_active": true
      }
    ]
  },

  "volume_profile": {
    "poc": 110300.00,
    "vah": 111500.00,
    "val": 109000.00,
    "in_value_area": true,
    "near_hvn": true
  },

  "signal": null,

  "signal_conditions": {
    "price_near_resistance": false,
    "closest_resistance_distance": 499.50,
    "closest_resistance_price": 111000.00,
    "price_near_support": false,
    "closest_support_distance": 500.50,
    "closest_support_price": 110000.00,
    "ema_above_price": false,
    "ema_distance": 50.25,
    "ema_distance_pct": 0.045,
    "vwap_above_price": true,
    "vwap_distance": 100.25,
    "vwap_distance_pct": 0.091,
    "in_value_area": true,
    "near_hvn": true
  },

  "ml_prediction": null,
  "ml_model_active": true
}
```

---

### 2. `GET /api/v1/pupupuv3/signals`

**Propósito**: Historial de señales recientes

**Query Parameters**:
- `limit` (int, opcional): Número de señales a retornar, default 50

**Response**:
```json
{
  "signals": [
    {
      "id": 123,
      "timestamp": "2025-10-30T10:00:00",
      "symbol": "BTC/USDT",
      "type": "LONG",
      "entry": 110000.00,
      "stop_loss": 109800.00,
      "tp1": 110100.00,
      "tp2": 110300.00,
      "tp3": 110600.00,
      "exit_price": 110300.00,
      "pnl": 300.00,
      "status": "CLOSED",
      "result": "WIN"
    }
  ],
  "total": 150,
  "page": 1
}
```

---

### 3. `GET /api/v1/pupupuv3/pivots`

**Propósito**: Solo pivotes (sin análisis completo)

**Response**:
```json
{
  "active_resistances": [...],
  "active_supports": [...],
  "all_pivots": {
    "all_resistances": [...],
    "all_supports": [...]
  }
}
```

---

## Mapeo de Llamadas Frontend → Backend Standalone

| Frontend llama a                      | Fallback en 8001              | Notas                                |
|---------------------------------------|-------------------------------|--------------------------------------|
| `/pupupuv3/current-analysis`          | `/pupupuv3/check`             | Análisis completo en tiempo real     |
| `/pupupuv3/signals/recent`            | `/pupupuv3/signals`           | Historial de señales                 |
| `/pupupuv3/trades/active`             | `/pupupuv3/signals`           | Puede devolver vacío si no hay       |
| `/pupupuv3/statistics`                | `/pupupuv3/signals`           | Calcular desde historial             |
| `/pupupuv3/backtest-results`          | `/pupupuv3/signals`           | Puede devolver datos mock            |
| `/pupupuv3/status`                    | `/pupupuv3/check`             | Estado del sistema                   |

---

## Implementación Recomendada en FastAPI

```python
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List, Optional
import ccxt
import pandas as pd
from datetime import datetime

app = FastAPI(title="PupupuV3 API")

class Indicators(BaseModel):
    ema_15: float
    ema_distance_pct: float
    ema_above_price: bool
    vwap: float
    vwap_distance_pct: float
    vwap_above_price: bool

class PivotLevel(BaseModel):
    price: float
    strength: float
    touches: int
    bars_since: int
    is_active: Optional[bool] = None

class AllPivots(BaseModel):
    all_resistances: List[PivotLevel]
    all_supports: List[PivotLevel]

class VolumeProfile(BaseModel):
    poc: float
    vah: float
    val: float
    in_value_area: bool
    near_hvn: bool

class SignalConditions(BaseModel):
    price_near_resistance: bool
    closest_resistance_distance: float
    closest_resistance_price: Optional[float]
    price_near_support: bool
    closest_support_distance: float
    closest_support_price: Optional[float]
    ema_above_price: bool
    ema_distance: float
    ema_distance_pct: float
    vwap_above_price: bool
    vwap_distance: float
    vwap_distance_pct: float
    in_value_area: bool
    near_hvn: bool

class Signal(BaseModel):
    direction: str
    entry_price: float
    stop_loss: float
    tp1: float
    tp2: float
    tp3: float
    position_size: float
    risk_amount: float
    timestamp: int
    datetime: str
    pivot_touch: str
    ema_test: str
    vwap_aligned: str
    volume_profile_support: str

class MLPrediction(BaseModel):
    tp2_ratio: float
    tp2_price: float
    tp2_probability: float
    tp2_timeframe: str
    tp3_ratio: float
    tp3_price: float
    tp3_probability: float
    tp3_timeframe: str
    confidence_score: float

class CurrentAnalysis(BaseModel):
    symbol: str
    timestamp: int
    datetime: str
    current_price: float
    indicators: Optional[Indicators]
    active_resistances: List[PivotLevel]
    active_supports: List[PivotLevel]
    all_pivots: Optional[AllPivots]
    volume_profile: VolumeProfile
    signal: Optional[Signal]
    signal_conditions: Optional[SignalConditions]
    ml_prediction: Optional[MLPrediction]
    ml_model_active: bool


@app.get("/")
async def root():
    return {
        "service": "PupupuV3 API",
        "version": "3.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "signals": "/api/v1/pupupuv3/signals",
            "pivots": "/api/v1/pupupuv3/pivots",
            "check": "/api/v1/pupupuv3/check"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pupupuv3"}


@app.get("/api/v1/pupupuv3/check", response_model=CurrentAnalysis)
async def check_analysis(symbol: str = Query(default="BTC/USDT")):
    """
    Endpoint principal: Análisis en tiempo real con señales
    """
    # 1. Obtener datos de Binance
    exchange = ccxt.binance({'enableRateLimit': True})
    ohlcv = exchange.fetch_ohlcv(symbol, '1m', limit=500)

    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])

    # 2. Calcular indicadores
    df['ema_15'] = df['close'].ewm(span=15, adjust=False).mean()
    # ... (calcular VWAP, pivotes, etc.)

    current_price = float(df.iloc[-1]['close'])
    ema_15 = float(df.iloc[-1]['ema_15'])

    # 3. Construir respuesta
    return CurrentAnalysis(
        symbol=symbol,
        timestamp=int(datetime.now().timestamp() * 1000),
        datetime=datetime.now().isoformat(),
        current_price=current_price,
        indicators=Indicators(
            ema_15=ema_15,
            ema_distance_pct=abs(current_price - ema_15) / current_price * 100,
            ema_above_price=ema_15 > current_price,
            vwap=0.0,  # Calcular
            vwap_distance_pct=0.0,
            vwap_above_price=False
        ),
        active_resistances=[],  # Calcular
        active_supports=[],
        all_pivots=None,  # Opcional
        volume_profile=VolumeProfile(
            poc=0.0,
            vah=0.0,
            val=0.0,
            in_value_area=False,
            near_hvn=False
        ),
        signal=None,
        signal_conditions=None,
        ml_prediction=None,
        ml_model_active=True
    )


@app.get("/api/v1/pupupuv3/signals")
async def get_signals(limit: int = Query(default=50)):
    """
    Historial de señales
    """
    return {
        "signals": [],
        "total": 0,
        "page": 1
    }


@app.get("/api/v1/pupupuv3/pivots")
async def get_pivots():
    """
    Solo pivotes
    """
    return {
        "active_resistances": [],
        "active_supports": [],
        "all_pivots": {
            "all_resistances": [],
            "all_supports": []
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

## Cómo Probar el Fallback

### 1. Sin backend principal (solo standalone):

```bash
# Asegúrate de que el backend principal NO esté corriendo en 8000
# El standalone debe estar en 8001

# El frontend automáticamente hará fallback a 8001
```

**En el navegador:**
- Abre http://localhost:3000/pupupu
- Ve a la pestaña "⚡ 1-min Scalping"
- Abre la consola del navegador (F12)
- Verás: "Main API failed, trying standalone PupupuV3 API on port 8001..."
- Luego: "✅ Standalone PupupuV3 API success"

### 2. Con ambos backends corriendo:

```bash
# Backend principal en 8000
# Standalone en 8001

# El frontend usará el de 8000 (principal)
# Solo usa 8001 si 8000 falla
```

---

## Variables de Entorno

Puedes configurar las URLs en `.env.local`:

```bash
# Frontend .env.local
REACT_APP_API_URL=http://localhost:8000
REACT_APP_PUPUPUV3_URL=http://localhost:8001
```

---

## Endpoints Actuales del Standalone

Según el root endpoint, el backend declara tener:

```json
{
  "health": "/health",  ✅ Funciona
  "signals": "/api/v1/pupupuv3/signals",  ⏳ Pendiente implementar
  "pivots": "/api/v1/pupupuv3/pivots",  ⏳ Pendiente implementar
  "check": "/api/v1/pupupuv3/check"  ⏳ Pendiente implementar
}
```

**El frontend ya está configurado para usarlos automáticamente cuando estén listos** ✅

---

## Resumen

✅ **Frontend**: Listo con fallback automático
⏳ **Backend**: Necesita implementar los 3 endpoints principales:
   1. `/api/v1/pupupuv3/check` - Análisis en tiempo real
   2. `/api/v1/pupupuv3/signals` - Historial
   3. `/api/v1/pupupuv3/pivots` - Solo pivotes

**Cuando el backend implemente estos endpoints, el frontend funcionará automáticamente sin cambios.**
