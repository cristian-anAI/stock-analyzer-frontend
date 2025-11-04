# Market Wake Scheduler Setup

Sistema automático para despertar tu PC 1 hora antes de la apertura del mercado americano y asegurar que el backend esté funcionando.

## 📋 Qué hace

1. **Despierta el PC** a las **14:30 CET** (2:30 PM) todos los días
2. **Verifica** que el backend esté corriendo
3. **Inicia el backend** automáticamente si no está corriendo
4. **Refresca los datos** de stocks y cryptos
5. **Registra todo** en logs para debugging

> **Horario del mercado americano:**
> - Apertura: 9:30 AM EST = 3:30 PM CET
> - Wake time: 8:30 AM EST = 2:30 PM CET (1 hora antes)

## 🚀 Instalación Rápida

### Paso 1: Ejecutar el instalador

```cmd
cd c:\repos\stock-analyzer-frontend\scripts
setup-market-wake.bat
```

**⚠️ IMPORTANTE:** Debes ejecutar el `.bat` como **Administrador**:
- Click derecho → "Ejecutar como administrador"

### Paso 2: Verificar configuración del backend

Edita `scripts/backend-health-check.ps1` si tu backend está en otra ubicación:

```powershell
param(
    [string]$BackendPath = "c:\repos\stock-analyzer-backend",  # ← Cambiar si es necesario
    [string]$ApiUrl = "http://localhost:8000",
    ...
)
```

### Paso 3: Habilitar Wake Timers

Ejecuta en PowerShell como Administrador:

```powershell
# Verificar estado actual
powercfg /query SCHEME_CURRENT SUB_SLEEP RTCWAKE

# Si wake timers están deshabilitados, habilitar:
powercfg /change standby-timeout-ac 0
powercfg /setacvalueindex SCHEME_CURRENT SUB_SLEEP RTCWAKE 1
powercfg /setactive SCHEME_CURRENT
```

### Paso 4: Verificar en BIOS

Tu BIOS debe soportar **Wake on RTC** o **Wake Timers**:

1. Reinicia y entra al BIOS (F2, DEL, F12 según tu PC)
2. Busca en "Power Management" o "ACPI"
3. Habilita:
   - **Wake on RTC** o **RTC Alarm**
   - **Wake on Timer**
   - **Resume by Alarm**

## 📊 Verificar Estado

```powershell
cd c:\repos\stock-analyzer-frontend\scripts
.\market-wake-scheduler.ps1 -Status
```

Esto muestra:
- Si la tarea está instalada
- Próxima ejecución programada
- Última ejecución
- Estado de wake timers

## 📝 Logs

Los logs se guardan en:

```
c:\repos\stock-analyzer-frontend\scripts\backend-health.log
```

Ver últimas líneas:

```powershell
Get-Content .\scripts\backend-health.log -Tail 50
```

## 🔧 Comandos Útiles

### Ver estado detallado
```powershell
.\scripts\market-wake-scheduler.ps1 -Status
```

### Probar manualmente el health check
```powershell
.\scripts\backend-health-check.ps1
```

### Ver dispositivos que pueden despertar el PC
```powershell
powercfg /devicequery wake_armed
```

### Ver historial de wake events
```powershell
powercfg /waketimers
```

### Desinstalar
```powershell
.\scripts\market-wake-scheduler.ps1 -Uninstall
```

## 🏗️ Arquitectura

```
Scheduled Task (2:30 PM CET diario)
    ↓
backend-health-check.ps1
    ├─→ Test-BackendHealth
    │   └─→ HTTP GET /health
    │
    ├─→ Test-BackendProcess
    │   └─→ Busca proceso python/uvicorn
    │
    ├─→ Start-Backend (si no está corriendo)
    │   └─→ python main.py (ventana minimizada)
    │
    └─→ Invoke-InitialDataRefresh
        ├─→ POST /api/v1/stocks/refresh
        └─→ POST /api/v1/cryptos/refresh
```

## 🐛 Troubleshooting

### El PC no despierta

1. **Verificar wake timers:**
   ```powershell
   powercfg /query SCHEME_CURRENT SUB_SLEEP RTCWAKE
   ```
   Debe mostrar `Current AC Power Setting Index: 0x00000001`

2. **Verificar BIOS:** Wake on RTC debe estar habilitado

3. **Verificar la tarea:**
   ```powershell
   .\scripts\market-wake-scheduler.ps1 -Status
   ```

4. **Modo Hibernación vs Suspensión:**
   - ✅ Funciona con Suspensión (Sleep)
   - ❌ NO funciona con Hibernación (Hibernate)
   - ❌ NO funciona con apagado completo

### El backend no inicia

1. **Verificar path del backend:**
   Edita `BackendPath` en `backend-health-check.ps1`

2. **Verificar logs:**
   ```powershell
   Get-Content .\scripts\backend-health.log -Tail 50
   ```

3. **Probar manualmente:**
   ```powershell
   cd c:\repos\stock-analyzer-backend
   python main.py
   ```

4. **Verificar dependencias:**
   ```powershell
   cd c:\repos\stock-analyzer-backend
   pip install -r requirements.txt
   ```

### El backend inicia pero no responde

- **Timeout aumentado:** El script espera 15s después de iniciar + 60s de health checks
- **Puerto ocupado:** Verifica que el puerto 8000 no esté en uso
- **Firewall:** Permite conexiones localhost:8000

### Ver qué pasa en tiempo real

Ejecuta manualmente con verbose:

```powershell
$VerbosePreference = "Continue"
.\scripts\backend-health-check.ps1 -Verbose
```

## 🔄 Flujo de Ejecución Normal

**14:30 CET - PC despierta**
```
[14:30:00] [INFO] === Stock Analyzer Backend Health Check Started ===
[14:30:00] [INFO] Checking backend health...
[14:30:01] [INFO] Backend is already running and healthy ✓
[14:30:01] [INFO] Triggering initial data refresh...
[14:30:03] [INFO] Stocks refreshed: 200
[14:30:06] [INFO] Cryptos refreshed: 200
[14:30:06] [SUCCESS] === Health Check Completed Successfully ===
```

**Si el backend no está corriendo:**
```
[14:30:00] [INFO] Backend is not running. Attempting to start...
[14:30:01] [INFO] Starting backend at c:\repos\stock-analyzer-backend...
[14:30:02] [INFO] Backend process started with PID: 12345
[14:30:17] [INFO] Health check 1/6...
[14:30:27] [INFO] Health check 2/6...
[14:30:37] [SUCCESS] Backend is now healthy ✓
```

## ⚙️ Configuración Avanzada

### Cambiar hora de despertar

Edita `market-wake-scheduler.ps1`:

```powershell
$WakeTime = "14:30"  # Cambiar a la hora deseada (formato 24h)
```

Reinstala:
```powershell
.\market-wake-scheduler.ps1 -Uninstall
.\market-wake-scheduler.ps1 -Install
```

### Cambiar reintentos

Edita `backend-health-check.ps1`:

```powershell
param(
    [int]$MaxRetries = 5,           # Número de intentos
    [int]$RetryDelaySeconds = 10    # Segundos entre reintentos
)
```

### Solo días laborables

Edita `market-wake-scheduler.ps1` en la función `Install-WakeTask`:

```powershell
# Cambiar de:
$trigger = New-ScheduledTaskTrigger -Daily -At $WakeTime

# A:
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At $WakeTime
```

## 📌 Notas Importantes

- ⚠️ El PC debe estar en **Suspensión**, no apagado ni hibernando
- ⚠️ Los portátiles deben estar **conectados a corriente** (no funciona con batería en muchos equipos)
- ⚠️ Algunos BIOS no soportan wake timers - verifica la documentación de tu placa
- ✅ El script se auto-reinicia hasta 3 veces si falla
- ✅ Logs automáticos para debugging
- ✅ El backend se inicia minimizado para no molestar

## 🎯 Resultado Esperado

Cuando estés en el trabajo a las 3:30 PM CET (apertura del mercado americano), tu sistema:

- ✅ Estará despierto desde las 2:30 PM
- ✅ Backend corriendo y saludable
- ✅ Datos de stocks actualizados
- ✅ Datos de cryptos actualizados
- ✅ Listo para monitorear la apertura del mercado en tiempo real

---

**¿Problemas?** Revisa los logs en `scripts/backend-health.log` o ejecuta el health check manualmente para ver qué falla.
