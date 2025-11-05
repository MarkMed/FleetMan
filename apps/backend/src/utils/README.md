# Utils

Este directorio contiene utilidades y funciones auxiliares reutilizables en toda la aplicación.

## Propósito
- Proporcionar funciones de utilidad comunes
- Abstraer operaciones repetitivas
- Centralizar helpers y formatters
- Facilitar testing y reutilización de código

## Archivos típicos
- `date.utils.ts` - Utilidades para manejo de fechas
- `string.utils.ts` - Utilidades para strings
- `crypto.utils.ts` - Utilidades de encriptación y hash
- `password.utils.ts` - Utilidades para passwords
- `file.utils.ts` - Utilidades para manejo de archivos
- `array.utils.ts` - Utilidades para arrays
- `object.utils.ts` - Utilidades para objetos
- `logger.utils.ts` - Utilidades de logging
- `response.utils.ts` - Utilidades para responses HTTP
- `pagination.utils.ts` - Utilidades de paginación
- `validation.utils.ts` - Utilidades de validación

## Tipos de utilidades
- **Formatters**: Formateo de datos
- **Converters**: Conversión entre tipos
- **Validators**: Validaciones personalizadas
- **Generators**: Generación de datos (UUIDs, tokens)
- **Parsers**: Parsing de datos complejos

## Características importantes
- Funciones puras (sin efectos secundarios)
- Bien tipadas
- Bien testeadas
- Documentadas
- Reutilizables

## Patrón recomendado
```typescript
export const formatDate = (date: Date, format: string): string => {
  // Implementación pura
};

export const generateHash = (data: string): string => {
  // Implementación pura
};
```