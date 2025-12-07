# Guía de Manejo de Respuestas API - FleetMan

## 📌 Problema Común: Estructura de Respuestas del Backend

### El Error Típico

Al consumir APIs del backend, es fácil asumir que la respuesta directamente contiene los datos que esperamos. **Esto es incorrecto.**

### ❌ Lo que asumimos (INCORRECTO)

```typescript
// Asumimos que data es directamente el payload
const data = await quickCheckService.getHistory(machineId);
console.log(data.quickChecks); // ✗ Error!
```

Respuesta esperada (incorrecta):
```json
{
  "machineId": "machine_123",
  "quickChecks": [...],
  "total": 2
}
```

### ✅ La Realidad: Estructura del Backend

**TODAS las respuestas del backend FleetMan siguen este formato:**

```json
{
  "success": true,
  "message": "QuickChecks retrieved successfully",
  "data": {
    "machineId": "machine_123",
    "quickChecks": [...],
    "total": 2
  }
}
```

## 🔧 Solución: Usar las Herramientas Correctas

### 1. ApiClient ya maneja el wrapper automáticamente

El `apiClient` devuelve:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;      // ← Aquí está response.data del fetch
  error?: string;
}
```

Cuando hacemos `fetch()`, obtenemos:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

Y el apiClient lo convierte en:
```typescript
{
  success: true,
  data: {
    success: true,    // ← Del backend
    message: "...",   // ← Del backend
    data: { ... }     // ← LO QUE REALMENTE QUEREMOS
  }
}
```

### 2. Helper Functions: Dos Tipos

#### `handleApiResponse<T>` - Para APIs externas o que NO usan el wrapper

```typescript
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || "API request failed");
  }
  return response.data!; // Devuelve response.data directamente
}
```

**Usar cuando:**
- Consumimos APIs de terceros
- Endpoints que devuelven data directamente sin wrapper

#### `handleBackendApiResponse<T>` - Para APIs de FleetMan Backend (USAR SIEMPRE)

```typescript
export function handleBackendApiResponse<T>(
  response: ApiResponse<{ success: boolean; message: string; data: T }>
): T {
  if (!response.success) {
    throw new Error(response.error || "API request failed");
  }
  // response.data = { success, message, data: T }
  // Queremos devolver solo T (que es response.data.data)
  return response.data!.data;
}
```

**Usar cuando:**
- Consumimos CUALQUIER endpoint del backend FleetMan
- El backend siempre devuelve `{ success, message, data }`

### 3. Ejemplo Completo: QuickCheckService

#### ❌ INCORRECTO (no desenvuelve correctamente)

```typescript
async getHistory(machineId: string): Promise<GetQuickCheckHistoryResponse> {
  const response = await apiClient.get<GetQuickCheckHistoryResponse>(
    API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId)
  );
  return handleApiResponse(response); // ✗ Devuelve { success, message, data }
}

// En el componente:
const data = await quickCheckService.getHistory(machineId);
console.log(data.quickChecks); // ✗ undefined! Porque data es { success, message, data }
console.log(data.data.quickChecks); // ✓ Funciona pero es feo y confuso
```

#### ✅ CORRECTO (usa handleBackendApiResponse)

```typescript
async getHistory(machineId: string): Promise<GetQuickCheckHistoryResponse> {
  const response = await apiClient.get<{ 
    success: boolean; 
    message: string; 
    data: GetQuickCheckHistoryResponse 
  }>(
    API_ENDPOINTS.MACHINE_QUICKCHECKS(machineId)
  );
  return handleBackendApiResponse(response); // ✓ Desenvuelve y devuelve solo data
}

// En el componente:
const data = await quickCheckService.getHistory(machineId);
console.log(data.quickChecks); // ✓ Funciona perfectamente!
console.log(data.total);       // ✓ Acceso directo a las propiedades
```

## 📋 Checklist para Nuevos Endpoints

Cuando crees un nuevo servicio API:

1. ✅ **Tipar correctamente el `apiClient` call:**
   ```typescript
   const response = await apiClient.post<{
     success: boolean;
     message: string;
     data: MiTipoDeRespuesta
   }>(...);
   ```

2. ✅ **Usar `handleBackendApiResponse`:**
   ```typescript
   return handleBackendApiResponse(response);
   ```

3. ✅ **El tipo de retorno debe ser directo (sin wrapper):**
   ```typescript
   async miMetodo(): Promise<MiTipoDeRespuesta> { // ← No Promise<{ success, data }>
     // ...
   }
   ```

4. ✅ **En el componente, acceso directo:**
   ```typescript
   const data = await miServicio.miMetodo();
   data.miPropiedad; // ← Acceso directo, sin .data.data
   ```

## 🚨 Señales de que Algo Está Mal

Si ves esto en tu código:

```typescript
// 🚨 RED FLAG: Doble acceso a .data
data.data.quickChecks

// 🚨 RED FLAG: Tipo con wrapper en interfaz de servicio
Promise<{ success: boolean; data: T }>

// 🚨 RED FLAG: Acceso a .success en componente
if (data.success) { ... }
```

**Solución:** Revisa que estés usando `handleBackendApiResponse` correctamente.

## 📊 Diagrama de Flujo

```
Backend Response          ApiClient.fetch()         handleBackendApiResponse()      Service Return
─────────────────         ─────────────────         ──────────────────────────      ──────────────
{                         {                         Extrae response.data.data       {
  success: true,            success: true,                    ↓                       machineId: "...",
  message: "...",   →       data: {           →     Valida success        →         quickChecks: [...],
  data: {                     success: true,        Retorna solo data               total: 2
    machineId: "...",         message: "...",                                     }
    quickChecks: [...],       data: {
    total: 2                    machineId: "...",
  }                             quickChecks: [...],
}                               total: 2
                              }
                            }
                          }
```

## 🎯 TL;DR (Resumen Ejecutivo)

1. **Backend siempre devuelve:** `{ success, message, data }`
2. **apiClient convierte a:** `{ success, data: { success, message, data } }`
3. **handleBackendApiResponse desenvuelve:** devuelve solo `data.data`
4. **Servicios deben usar:** `handleBackendApiResponse` para todos los endpoints FleetMan
5. **Componentes acceden:** directamente a propiedades sin `.data.data`

---

**Última actualización:** Diciembre 7, 2025  
**Mantenido por:** Equipo FleetMan  
**Aplica a:** Todos los servicios API que consumen backend FleetMan

## ⚠️ Estado de Migración

### ✅ Servicios Corregidos
- `quickCheckService.ts` - Usa `handleBackendApiResponse` correctamente

### 🔄 Servicios Pendientes de Corrección
- `machineService.ts` - Actualmente usa `handleApiResponse` (necesita migración)
- Otros servicios por revisar...

**Nota:** Al crear nuevos servicios, siempre seguir el patrón correcto documentado aquí.
