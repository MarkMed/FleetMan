# Machine Types API - Endpoints

Este documento describe los endpoints CRUD para la gestión de tipos de máquina.

## 🎯 Descripción

Los tipos de máquina permiten a los usuarios categorizar sus equipos de forma flexible y extensible. En lugar de usar un enum fijo, los usuarios pueden:

- Listar tipos precargados en la base de datos
- Crear nuevos tipos personalizados según su terminología preferida
- Agregar traducciones/sinónimos (ej: "Forklift" y "Autoelevador" para el mismo concepto)

## 📋 Endpoints

### 1. Listar tipos de máquina

```http
GET /api/v1/machine-types
```

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Query params opcionales:**
```
language: string (ISO 639-1, ej: 'en', 'es')
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Machine types retrieved successfully",
  "data": [
    {
      "id": "673abc123def456789012345",
      "name": "Forklift",
      "languages": ["en", "es"]
    },
    {
      "id": "673abc123def456789012346",
      "name": "Autoelevador",
      "languages": ["es"]
    }
  ],
  "count": 2
}
```

**Ejemplo de uso:**
```bash
# Listar todos los tipos
curl -X GET http://localhost:3001/api/v1/machine-types \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filtrar por idioma
curl -X GET "http://localhost:3001/api/v1/machine-types?language=es" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Crear tipo de máquina

```http
POST /api/v1/machine-types
```

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Reach Truck",
  "language": "en"  // Opcional, default: "en"
}
```

**Lógica inteligente:**
- Si el tipo ya existe (case-insensitive), agrega el idioma si no está presente
- Si no existe, crea un nuevo registro

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Machine type created successfully",
  "data": {
    "id": "673abc123def456789012347",
    "name": "Reach Truck",
    "languages": ["en"]
  }
}
```

**Errores posibles:**
- `400` - Validación fallida (nombre muy corto/largo, idioma inválido)
- `401` - No autenticado
- `409` - Conflicto (caso edge, muy raro con la lógica inteligente)
- `500` - Error del servidor

**Ejemplo de uso:**
```bash
curl -X POST http://localhost:3001/api/v1/machine-types \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Trilateral", "language": "es"}'
```

---

### 3. Actualizar tipo de máquina

```http
PUT /api/v1/machine-types/:id
```

**⚠️ TODO:** Este endpoint debería estar restringido solo a usuarios ADMIN en el futuro.

**Headers requeridos:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Nuevo nombre del tipo"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Machine type updated successfully",
  "data": {
    "id": "673abc123def456789012347",
    "name": "Nuevo nombre del tipo",
    "languages": ["en", "es"]
  }
}
```

**Errores posibles:**
- `400` - Validación fallida
- `401` - No autenticado
- `404` - Tipo de máquina no encontrado
- `500` - Error del servidor

**Ejemplo de uso:**
```bash
curl -X PUT http://localhost:3001/api/v1/machine-types/673abc123def456789012347 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Autoelevador clásico"}'
```

---

### 4. Eliminar tipo de máquina

```http
DELETE /api/v1/machine-types/:id
```

**⚠️ TODO:** 
- Este endpoint debería estar restringido solo a usuarios ADMIN
- Debería verificar que no haya máquinas usando este tipo antes de eliminar
- Considerar soft delete en lugar de hard delete

**Headers requeridos:**
```
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Machine type deleted successfully"
}
```

**Errores posibles:**
- `401` - No autenticado
- `404` - Tipo de máquina no encontrado
- `409` - Tipo en uso por máquinas existentes (cuando se implemente)
- `500` - Error del servidor

**Ejemplo de uso:**
```bash
curl -X DELETE http://localhost:3001/api/v1/machine-types/673abc123def456789012347 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌍 Multi-idioma

El sistema soporta múltiples idiomas para el mismo tipo de máquina:

1. **Creación inicial:** Un usuario crea "Forklift" con idioma "en"
2. **Agregar idioma:** Otro usuario crea "Forklift" con idioma "es" → Se agrega "es" a la lista de idiomas
3. **Resultado:** El tipo "Forklift" tiene `languages: ["en", "es"]`

Esto permite que usuarios de diferentes regiones usen su terminología preferida mientras comparten la misma categoría subyacente.

---

## 🔒 Seguridad y Permisos

**Estado actual (MVP):**
- Todos los usuarios autenticados pueden listar tipos
- Todos los usuarios autenticados pueden crear tipos
- Todos los usuarios autenticados pueden editar/eliminar tipos

**TODO - Implementación futura:**
```typescript
// Agregar en las rutas PUT y DELETE:
router.put('/:id',
  authMiddleware,
  requireRole(['ADMIN']), // ← Agregar este middleware
  validateRequest({ body: UpdateMachineTypeRequestSchema }),
  machineTypeController.update.bind(machineTypeController)
);
```

---

## 📦 Seed de datos

Para precargar tipos comunes de máquinas:

```bash
# Desde la raíz del proyecto backend
pnpm seed:machine-types
```

Esto cargará ~20 tipos comunes en inglés y español como:
- Forklift / Autoelevador
- Reach Truck / Retráctil
- Pallet Jack / Transpaleta
- Trilateral
- Crane / Grúa
- etc.

---

## 🧪 Testing

### Probar con curl:

```bash
# 1. Login para obtener token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.data.token')

# 2. Listar tipos
curl -X GET http://localhost:3001/api/v1/machine-types \
  -H "Authorization: Bearer $TOKEN"

# 3. Crear tipo
curl -X POST http://localhost:3001/api/v1/machine-types \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mi tipo personalizado", "language": "es"}'

# 4. Filtrar por idioma
curl -X GET "http://localhost:3001/api/v1/machine-types?language=es" \
  -H "Authorization: Bearer $TOKEN"
```

### Probar con Postman/Insomnia:

1. Importar la colección desde Swagger: `http://localhost:3001/api-docs`
2. Configurar el token en la autorización
3. Ejecutar las requests desde la interfaz

---

## 📝 Validaciones

### Crear/Actualizar tipo:

- **Nombre:**
  - Mínimo: 2 caracteres
  - Máximo: 50 caracteres
  - Se eliminan espacios al inicio/fin automáticamente

- **Idioma (solo al crear):**
  - Debe ser código ISO 639-1 (2 letras)
  - Debe estar en minúsculas (ej: `"en"`, `"es"`, `"pt"`)
  - Default: `"en"` si no se especifica

### Ejemplos de validación:

```json
// ✅ VÁLIDO
{"name": "Forklift", "language": "en"}
{"name": "Autoelevador clásico", "language": "es"}
{"name": "AB", "language": "pt"}  // Mínimo 2 caracteres

// ❌ INVÁLIDO
{"name": "A", "language": "en"}  // Muy corto
{"name": "Este nombre es demasiado largo para ser un tipo de máquina válido según nuestras reglas", "language": "en"}  // >50 caracteres
{"name": "Forklift", "language": "ENG"}  // Idioma no ISO 639-1
{"name": "Forklift", "language": "EN"}  // Idioma en mayúsculas
```

---

## 🏗️ Arquitectura

```
Request
   ↓
Routes (machine-type.routes.ts)
   ↓
Middleware (auth, validation)
   ↓
Controller (machine-type.controller.ts)
   ↓
Use Case (create-machine-type.use-case.ts, etc.)
   ↓
Repository (MachineTypeRepository)
   ↓
Model (MachineTypeModel - Mongoose)
   ↓
MongoDB
```

**Separación de responsabilidades:**
- **Routes:** Define endpoints y aplica middlewares
- **Controller:** Maneja HTTP (status codes, headers, errores)
- **Use Case:** Orquesta lógica de negocio
- **Repository:** Abstrae acceso a datos
- **Model:** Define esquema de MongoDB

---

## 🔮 Mejoras futuras

1. **Soft delete:** Marcar como inactivo en lugar de eliminar
2. **Verificación de uso:** Prevenir eliminación si hay máquinas asociadas
3. **Permisos granulares:** Solo ADMIN puede editar/eliminar
4. **Búsqueda:** Endpoint para buscar tipos por texto
5. **Estadísticas:** Endpoint para ver cuántas máquinas usan cada tipo
6. **Sinónimos explícitos:** Relacionar tipos equivalentes en diferentes idiomas
7. **Imágenes/iconos:** Asociar iconos visuales a cada tipo
8. **Categorías:** Agrupar tipos en categorías más amplias

---

Para más información, revisar:
- Swagger docs: `http://localhost:3001/api-docs`
- Código fuente: `apps/backend/src/routes/machine-type.routes.ts`
- Use cases: `apps/backend/src/application/inventory/`
