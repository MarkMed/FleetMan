# Backend Scripts

Scripts utilitarios para tareas de mantenimiento, seeds y operaciones de base de datos.

---

## 📋 Scripts Disponibles

### `seed-machine-types.ts`

**Propósito**: Poblar la base de datos con tipos de máquina predefinidos (datos iniciales).

#### Funcionamiento Automático (Startup del Servidor)

Este script se ejecuta **automáticamente** en cada inicio del servidor a través de `main.ts`:

```typescript
// main.ts - Secuencia de startup
(async () => {
  await connectDatabase();           // 1. Conectar a MongoDB
  await seedMachineTypesIfEmpty();   // 2. Seed automático (si DB vacía)
  app.listen(PORT, ...);             // 3. Iniciar servidor HTTP
})();
```

**Flujo de ejecución:**

1. **Consulta inicial**: Verifica si existen registros en la colección `MachineType`
2. **Decisión**:
   - ✅ **DB vacía (count === 0)**: Ejecuta seed completo → Crea 22 tipos de máquina con idiomas
   - ⏭️ **DB poblada (count > 0)**: Skipea toda la lógica → Logs discretos y continúa
3. **Non-blocking**: Errores en seed NO detienen el servidor (solo logs de error)

**Logs esperados:**

```bash
# Primera ejecución (DB vacía)
📦 Connected to MongoDB successfully
🌱 Seeding MachineTypes: DB is empty, populating with initial data...
✅ MachineTypes seed completed successfully (created: 22/22)
🚀 FleetMan Backend running on port 3001

# Reinicios posteriores (DB poblada)
📦 Connected to MongoDB successfully
⏭️  MachineTypes seed skipped: DB already populated (count: 22)
🚀 FleetMan Backend running on port 3001
```

---

#### Funcionamiento Manual (Script Standalone)

También puedes ejecutar el seed manualmente sin levantar el servidor:

```bash
# Desde la raíz del monorepo
pnpm tsx apps/backend/src/scripts/seed-machine-types.ts
```

**Uso manual recomendado para:**
- Testing del seed en desarrollo
- Re-población después de resetear la DB
- Debugging de problemas de seed

**NOTA**: El script standalone incluye su propia conexión/desconexión de MongoDB.

---

## 📊 Datos de Seed Incluidos

### Machine Types (22 tipos)

**Idiomas soportados**: `en` (Inglés), `es` (Español)

**Tipos incluidos:**
- Equipos de elevación: Forklift, Reach Truck, Order Picker, etc.
- Equipos de transporte: Pallet Jack, Tow Tractor, Walkie Stacker, etc.
- Equipos especializados: Side Loader, Telescopic Handler, Crane, etc.
- Tipos en español: Autoelevador, Transpaleta, Retráctil, Apilador, etc.

**Extensibilidad**:
- Los usuarios pueden agregar nuevos tipos via API `/api/v1/machine-types`
- Los usuarios pueden agregar idiomas a tipos existentes (ej: `'pt'` para portugués)
- El seed NO sobrescribe datos existentes (append-only en reinicios)

---

## 🔧 Configuración

### Variables de Entorno

El seed usa las mismas variables de MongoDB que el servidor:

```env
MONGODB_URI=mongodb://localhost:27017/fleetman
# o
MONGO_URI=mongodb://localhost:27017/fleetman
```

**Fallback por defecto**: `mongodb://127.0.0.1:27017/fleetman`

### Logging

- **Producción**: Logs solo de inicio/fin de seed (nivel `info`)
- **Desarrollo**: Logs detallados de cada tipo creado (nivel `debug`)

---

## 🚨 Troubleshooting

### Seed no se ejecuta

**Causa**: La DB ya tiene registros de MachineTypes.

**Solución**:
1. Verificar con MongoDB Compass o CLI: `db.machinetypes.countDocuments()`
2. Si querés forzar re-seed, dropea la colección y reinicia el servidor
3. O ejecuta el script manual para debugging

### Errores de conexión

**Causa**: MongoDB no está corriendo o URI incorrecta.

**Solución**:
1. Verificar que MongoDB esté corriendo: `mongosh --eval "db.version()"`
2. Revisar variable `MONGODB_URI` en `.env`
3. Logs del servidor mostrarán error de conexión antes del seed

### Seed parcial (algunos tipos fallan)

**Causa**: Validaciones del repositorio o duplicados inesperados.

**Solución**:
1. Revisar logs para identificar qué tipo falló
2. Verificar schema de MachineType en `packages/persistence/src/models`
3. Ejecutar script manual con logs detallados

---

## 🛠 Desarrollo

### Agregar nuevos tipos al seed

Editar el array `MACHINE_TYPES_SEED` en `seed-machine-types.ts`:

```typescript
const MACHINE_TYPES_SEED = [
  { name: 'Nuevo Tipo', languages: ['es', 'en'] },
  // ... tipos existentes
];
```

**IMPORTANTE**: Estos cambios solo afectan a DBs nuevas (vacías). DBs existentes mantendrán sus datos.

### Testing de cambios

```bash
# 1. Dropear DB de desarrollo
mongosh fleetman --eval "db.dropDatabase()"

# 2. Ejecutar seed manual
pnpm tsx apps/backend/src/scripts/seed-machine-types.ts

# 3. Verificar resultados
mongosh fleetman --eval "db.machinetypes.countDocuments()"
```

---

## 📝 Próximos Scripts (Roadmap)

- `seed-admin-users.ts` - Crear usuarios administradores iniciales
- `migrate-machine-events.ts` - Migración de esquema de eventos de máquinas
- `cleanup-old-notifications.ts` - Limpieza de notificaciones antiguas
- `backup-database.ts` - Backup completo de la DB
