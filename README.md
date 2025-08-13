# 📊 Stock Analyzer Frontend

Frontend React para el sistema de análisis de stocks y trading automático.

## 🚀 Funcionalidades

### 📈 Dashboard Principal
- **Vista general** del portfolio con estadísticas clave
- **Top 5** stocks y cryptos por score
- **Resumen** de posiciones y performance
- **Auto-refresh** cada 10 minutos

### 💰 Análisis de Stocks
- **Lista completa** de todas las acciones
- **Información detallada**: precio, cambio, volumen, market cap, sector
- **Sistema de scoring** con colores visuales
- **Ordenamiento automático** por score (mayor a menor)
- **Refresh manual** y automático (cada 5 minutos)

### 🪙 Análisis de Cryptos
- **Lista completa** de criptomonedas
- **Información detallada** optimizada para cryptos
- **Sistema de scoring** con colores visuales
- **Precision mejorada** para precios de cryptos
- **Refresh manual** y automático (cada 5 minutos)

### 🤖 Posiciones del Autotrader
- **Separación por tabs**: Stocks y Cryptos
- **Vista de solo lectura** de posiciones automáticas
- **Botón para ejecutar** ciclos del autotrader
- **Resumen completo** del portfolio
- **Auto-refresh** cada 3 minutos

### ✋ Gestión Manual de Posiciones (CRUD)
- ➕ **Crear** nuevas posiciones manualmente
- 📝 **Editar** posiciones existentes
- 🗑️ **Eliminar** posiciones
- 📝 **Campo de notas** para cada posición
- 🔄 **Actualización automática** de precios

## 🎨 Sistema de Colores por Score

| Score | Color | Significado | Acción Recomendada |
|-------|-------|-------------|-------------------|
| 8.0+ | 🟢 Verde | Excelente | Strong Buy |
| 6.0-7.9 | 🔵 Azul | Bueno | Buy |
| 4.0-5.9 | 🟡 Amarillo | Neutro | Hold |
| <4.0 | 🔴 Rojo | Malo | Sell |

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- npm o yarn
- Backend API corriendo en http://localhost:8000

### Pasos de Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
# Editar .env con tu configuración
REACT_APP_API_URL=http://localhost:8000
REACT_APP_USE_MOCK=false
```

3. **Iniciar en desarrollo**
```bash
npm start
```

La aplicación estará disponible en http://localhost:3000

## 🌐 Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|------------------|
| `REACT_APP_API_URL` | URL del backend API | `http://localhost:8000` |
| `REACT_APP_USE_MOCK` | Usar datos mock (true/false) | `false` |

## 📱 Uso de la Aplicación

### Navegación
- **Dashboard**: Vista principal con resumen
- **Stocks**: Análisis completo de acciones
- **Cryptos**: Análisis completo de criptomonedas  
- **Posiciones Autotrader**: Posiciones automáticas
- **Posiciones Manuales**: Gestión CRUD de posiciones

### Funciones Principales

#### 🔄 Actualización de Datos
- **Manual**: Botón "Actualizar" en cada vista
- **Automática**: Polling en background
  - Dashboard: cada 10 minutos
  - Stocks/Cryptos: cada 5 minutos
  - Posiciones: cada 3 minutos

#### 🤖 Autotrader
- **Ejecutar**: Botón verde "Ejecutar Autotrader"
- **Feedback**: Notificaciones de resultado
- **Auto-refresh**: Actualiza posiciones después de ejecutar

#### 📝 Posiciones Manuales
- **Crear**: Botón "Nueva Posición" → Formulario completo
- **Editar**: Icono de lápiz → Modificar datos existentes
- **Eliminar**: Icono de papelera → Confirmar eliminación
- **Notas**: Campo opcional para cada posición

## 🏗️ Arquitectura

### Estructura de Carpetas
```
src/
├── components/          # Componentes React
│   ├── Dashboard/       # Dashboard principal
│   ├── Stocks/          # Vista de stocks
│   ├── Cryptos/         # Vista de cryptos
│   ├── Positions/       # Posiciones autotrader
│   ├── ManualPositions/ # CRUD posiciones manuales
│   └── Layout/          # Layout y navegación
├── services/            # API y servicios
├── types/               # TypeScript interfaces
├── hooks/               # Custom hooks
└── utils/               # Utilidades
```

### Tecnologías Utilizadas
- **React 18** con TypeScript
- **Material-UI (MUI)** para componentes UI
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **Custom Hooks** para polling automático

## 🔌 API Integration

### Endpoints Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/stocks?sort=score` | Stocks ordenados por score |
| GET | `/api/v1/cryptos?sort=score` | Cryptos ordenados por score |
| GET | `/api/v1/positions/autotrader` | Posiciones automáticas |
| GET | `/api/v1/positions/manual` | Posiciones manuales |
| POST | `/api/v1/positions/manual` | Crear posición manual |
| PUT | `/api/v1/positions/manual/:id` | Actualizar posición |
| DELETE | `/api/v1/positions/manual/:id` | Eliminar posición |
| POST | `/api/v1/autotrader/run` | Ejecutar autotrader |
| POST | `/api/v1/stocks/refresh` | Actualizar stocks |
| POST | `/api/v1/cryptos/refresh` | Actualizar cryptos |

## 🧪 Scripts Disponibles

### `npm start`
Inicia el servidor de desarrollo en http://localhost:3000

### `npm run build`
Crea build optimizado para producción

### `npm test`
Ejecuta los tests en modo interactivo

### `npm run eject`
⚠️ **Operación irreversible** - Expone configuración de webpack

## 🐛 Solución de Problemas

### Errores Comunes

#### API No Disponible
```
Error: API is not available
```
**Solución**: Verificar que el backend esté corriendo en http://localhost:8000

#### CORS Errors
```
Access-Control-Allow-Origin error
```
**Solución**: El backend debe permitir requests desde localhost:3000

#### Puerto 3000 Ocupado
```
Something is already running on port 3000
```
**Solución**: Usar otro puerto o terminar el proceso existente

## 🚀 Deploy a Producción

### Build de Producción
```bash
npm run build
```

### Variables de Producción
```bash
REACT_APP_API_URL=https://tu-api-produccion.com
REACT_APP_USE_MOCK=false
```

---

🚀 **¡Tu Stock Analyzer está listo para conectarse con la API real!**
