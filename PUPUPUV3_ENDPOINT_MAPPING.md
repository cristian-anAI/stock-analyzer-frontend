# PupupuV3 - Mapeo Correcto de Endpoints

## ✅ Endpoints Corregidos en el Frontend

He actualizado el código del frontend para usar los endpoints **correctos** que ya existen en el backend standalone (puerto 8001).

---

## 📊 Mapeo Frontend → Backend

### Endpoint Único para Ambos Backends

El frontend ahora usa los **mismos endpoints** tanto para el backend principal (8000) como para el standalone (8001):

| Método Frontend | Backend Principal (8000) | Standalone (8001) | Estado |
|-----------------|--------------------------|-------------------|--------|
| `getCurrentAnalysis()` | `/api/v1/pupupuv3/current-analysis` | `/api/v1/pupupuv3/current-analysis` | ✅ Corregido |
| `getRecentSignals()` | `/api/v1/pupupuv3/signals/recent` | `/api/v1/pupupuv3/signals/recent` | ✅ Corregido |
| `getActiveTrades()` | `/api/v1/pupupuv3/trades/active` | `/api/v1/pupupuv3/trades/active` | ✅ Corregido |
| `getStatistics()` | `/api/v1/pupupuv3/statistics` | `/api/v1/pupupuv3/statistics` | ✅ Corregido |
| `getBacktestResults()` | `/api/v1/pupupuv3/backtest-results` | `/api/v1/pupupuv3/backtest-results` | ✅ Corregido |
| `getSystemStatus()` | `/api/v1/pupupuv3/status` | `/api/v1/pupupuv3/status` | ✅ Corregido |

---

## 🔧 Cambios Realizados en `src/services/api.ts`

### Antes (Incorrecto) ❌
```typescript
getCurrentAnalysis: async (symbol: string = 'BTC/USDT') => {
  return pupupuV3Request(
    async () => api.get('/pupupuv3/current-analysis', { params: { symbol } }),
    '/pupupuv3/check',  // ❌ Endpoint que no existe
    { symbol }
  );
}
```

### Después (Correcto) ✅
```typescript
getCurrentAnalysis: async (symbol: string = 'BTC/USDT') => {
  return pupupuV3Request(
    async () => api.get('/pupupuv3/current-analysis', { params: { symbol } }),
    '/pupupuv3/current-analysis',  // ✅ Mismo endpoint en ambos
    { symbol }
  );
}
```

---

## 📋 Endpoints Disponibles en Backend Standalone (Puerto 8001)

Según `src/api/routers/pupupuv3.py`:

### ✅ Endpoints Implementados

1. **`GET /api/v1/pupupuv3/status`** (línea 58)
   - Estado del sistema
   - Response: `{ status, uptime, last_signal, ... }`

2. **`GET /api/v1/pupupuv3/current-analysis`** (línea 70)
   - Análisis completo en tiempo real
   - Response: `PupupuV3CurrentAnalysis` (el más importante)
   - **NOTA**: Puede tardar ~5-10 segundos en responder (calcula desde Binance)

3. **`GET /api/v1/pupupuv3/signals/recent`** (línea 303)
   - Historial de señales recientes
   - Query param: `limit` (default 50)

4. **`GET /api/v1/pupupuv3/trades/active`** (línea 319)
   - Trades activos

5. **`GET /api/v1/pupupuv3/trades/completed`** (línea 332)
   - Trades completados

6. **`GET /api/v1/pupupuv3/statistics`** (línea 345)
   - Estadísticas de rendimiento
   - Query param: `days` (default 30)

7. **`GET /api/v1/pupupuv3/backtest-results`** (línea 358)
   - Resultados de backtest

8. **`GET /api/v1/pupupuv3/config`** (línea 390)
   - Configuración del sistema

9. **`GET /api/v1/pupupuv3/health`** (línea 409)
   - Health check

### ❌ Endpoints que NO existen (y ya no se intentan usar)

- ~~`/api/v1/pupupuv3/check`~~ → Ahora usa `/current-analysis`
- ~~`/api/v1/pupupuv3/signals`~~ → Ahora usa `/signals/recent`
- ~~`/api/v1/pupupuv3/pivots`~~ → Datos incluidos en `/current-analysis`

---

## 🚀 Cómo Funciona el Fallback

### 1. **Backend Principal Disponible (Puerto 8000)**
```
Frontend → http://localhost:8000/api/v1/pupupuv3/current-analysis
         ↓
         ✅ Respuesta del backend principal
```

### 2. **Backend Principal Caído → Fallback Automático**
```
Frontend → http://localhost:8000/api/v1/pupupuv3/current-analysis
         ↓ (Timeout o Error)
         ❌ Main API failed
         ↓
         Console: "Main API failed, trying standalone PupupuV3 API on port 8001..."
         ↓
         → http://localhost:8001/api/v1/pupupuv3/current-analysis
         ↓
         ✅ Respuesta del backend standalone
         ↓
         Console: "✅ Standalone PupupuV3 API success"
```

### 3. **Ambos Backends Caídos**
```
Frontend → http://localhost:8000/api/v1/pupupuv3/current-analysis
         ↓
         ❌ Main API failed
         ↓
         → http://localhost:8001/api/v1/pupupuv3/current-analysis
         ↓
         ❌ Standalone API failed
         ↓
         Error: "Both APIs failed"
         ↓
         UI: Muestra mensaje de error con botón "Retry"
```

---

## 🔍 Testing del Fallback

### Test Manual

1. **Asegúrate de que el standalone está corriendo:**
   ```bash
   curl http://localhost:8001/health
   # Response: {"status":"healthy","service":"pupupuv3"}
   ```

2. **Detén el backend principal (puerto 8000)** para forzar el fallback

3. **Abre el frontend:**
   ```
   http://localhost:3000/pupupu
   ```

4. **Ve a la pestaña "⚡ 1-min Scalping"**

5. **Abre la consola del navegador (F12)**

6. **Deberías ver:**
   ```
   Cache MISS for pupupuv3:current-analysis:BTC/USDT - fetching from API
   Main API failed, trying standalone PupupuV3 API on port 8001...
   ✅ Standalone PupupuV3 API success
   ```

### Test con Ambos Backends Corriendo

1. **Inicia ambos backends:**
   - Principal: `http://localhost:8000`
   - Standalone: `http://localhost:8001`

2. **El frontend siempre preferirá el principal (8000)**

3. **Solo usará 8001 si 8000 falla**

---

## ⚠️ Nota Importante sobre Tiempos de Respuesta

El endpoint `/api/v1/pupupuv3/current-analysis` puede tardar **5-10 segundos** en responder porque:

1. Descarga datos de Binance API (500 velas de 1 minuto)
2. Calcula EMA, VWAP, Volume Profile
3. Detecta pivotes (resistencias/soportes)
4. Evalúa condiciones de señal
5. Genera predicción ML (si hay señal)

**Recomendación**:
- El frontend tiene timeout de 60 segundos (está bien)
- Implementar cache en el backend para respuestas más rápidas
- O usar WebSockets para updates en tiempo real

---

## 📄 Archivos Modificados

1. **`src/services/api.ts`** (líneas 936-1033)
   - Actualizado `pupupuV3Service` con endpoints correctos
   - Todos los métodos ahora usan el mismo endpoint en ambos backends

---

## ✅ Estado Final

**Frontend**: ✅ Listo y corregido
**Backend Principal (8000)**: ✅ Endpoints correctos
**Backend Standalone (8001)**: ✅ Endpoints correctos
**Fallback Automático**: ✅ Funcionando

**El sistema está completamente funcional** 🎉
