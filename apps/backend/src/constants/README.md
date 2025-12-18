# Constants

Este directorio contiene todas las constantes utilizadas a lo largo de la aplicación.

## Propósito
- Centralizar valores constantes
- Evitar "magic numbers" y "magic strings"
- Facilitar mantenimiento y modificaciones
- Garantizar consistencia en toda la aplicación

## Archivos típicos
- `http-status.constants.ts` - Códigos de estado HTTP
- `error-messages.constants.ts` - Mensajes de error estandarizados
- `roles.constants.ts` - Roles de usuario del sistema
- `permissions.constants.ts` - Permisos y acciones
- `regex.constants.ts` - Expresiones regulares comunes
- `time.constants.ts` - Constantes de tiempo (timeouts, intervals)
- `pagination.constants.ts` - Valores por defecto para paginación
- `validation.constants.ts` - Constantes para validaciones
- `api-routes.constants.ts` - Rutas de API estandarizadas
- `database.constants.ts` - Nombres de tablas, índices, etc.
- **`notification-messages.constants.ts`** - Keys i18n para mensajes de notificaciones (Sprint 9)

## Ejemplo de estructura
```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  // ...
} as const;
```

## Uso de i18n Keys (Sprint 9)

Las constantes de mensajes de notificaciones utilizan **keys de internacionalización** en lugar de texto traducido:

```typescript
// ✅ CORRECTO: Backend guarda la key
import { NOTIFICATION_MESSAGE_KEYS } from './constants';

await addNotification(userId, {
  message: NOTIFICATION_MESSAGE_KEYS.quickcheck.completed.approved,
  notificationType: 'success'
});
// Guarda en DB: "notification.quickcheck.completed.approved"

// ✅ Frontend traduce con i18n
function NotificationCard({ notification }) {
  const { t } = useTranslation();
  return <p>{t(notification.message)}</p>;
  // Renderiza: "QuickCheck completado: Aprobado ✓" (es)
  // Renderiza: "QuickCheck completed: Approved ✓" (en)
}
```

**Ventajas:**
- ✅ SSOT: Una sola fuente de verdad para las keys
- ✅ Type-safe: TypeScript valida que las keys existan
- ✅ Multi-idioma: Frontend maneja traducciones sin cambiar backend
- ✅ Consistencia: Todas las notificaciones usan el mismo patrón