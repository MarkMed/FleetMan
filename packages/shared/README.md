# Shared Package - Utilidades Comunes

## 📋 Propósito

El paquete `shared` contiene **utilidades puras y helpers** que son utilizados por todos los demás paquetes del mono-repo. No contiene lógica de negocio específica, solo herramientas genéricas que facilitan el desarrollo y mantienen consistencia en el manejo de errores, tipos funcionales y operaciones comunes.

## 🎯 Principios Arquitectónicos

- **Pure Functions**: Solo funciones puras sin efectos secundarios
- **Framework Agnostic**: No depende de ningún framework específico
- **Type Safety**: Helpers que mejoran la seguridad de tipos
- **Functional Programming**: Patrones funcionales como Result/Either
- **Zero Business Logic**: No contiene reglas de negocio

## 📁 Estructura de Archivos

### `either.ts`
Implementa el tipo **Either<L, R>** para manejo funcional de errores:

```typescript
// Union type que representa éxito (Right) o fallo (Left)
export type Either<L, R> = Left<L, R> | Right<L, R>;

// Constructores
export const left = <L, R = never>(l: L): Either<L, R> => 
  ({ _tag: "Left", left: l });

export const right = <R, L = never>(r: R): Either<L, R> => 
  ({ _tag: "Right", right: r });

// Type guards
export const isLeft = <L, R>(e: Either<L, R>): e is Left<L, R> => 
  e._tag === "Left";

export const isRight = <L, R>(e: Either<L, R>): e is Right<L, R> => 
  e._tag === "Right";

// Functional operations
export const map = <L, A, B>(e: Either<L, A>, f: (a: A) => B): Either<L, B> =>
  isRight(e) ? right(f(e.right)) : e;

export const flatMap = <L, A, B>(e: Either<L, A>, f: (a: A) => Either<L, B>): Either<L, B> =>
  isRight(e) ? f(e.right) : e;
```

**Uso típico:**
```typescript
const divide = (a: number, b: number): Either<string, number> =>
  b === 0 ? left("Division by zero") : right(a / b);

const result = pipe(
  divide(10, 2),
  map(x => x * 2),
  map(x => x.toString())
);
```

### `result.ts`
Implementa **Result<T, E>** como alias especializado de Either para operaciones que pueden fallar:

```typescript
// Alias para Either con semántica de Result
export type Result<T, E = AppError> = Either<E, T>;

// Constructores semánticamente claros
export const ok = <T>(value: T): Result<T> => right(value);
export const err = <E = AppError, T = never>(error: E): Result<T, E> => left(error);

// Type guards semánticamente claros
export const isOk = <T, E>(r: Result<T, E>): r is Right<E, T> => isRight(r);
export const isErr = <T, E>(r: Result<T, E>): r is Left<E, T> => isLeft(r);

// Unwrapping con manejo de errores
export const unwrap = <T, E extends Error>(r: Result<T, E>): T => {
  if (isOk(r)) return r.right;
  throw r.left;
};

export const unwrapOr = <T, E>(r: Result<T, E>, fallback: T): T =>
  isOk(r) ? r.right : fallback;
```

**Uso típico:**
```typescript
const parseNumber = (str: string): Result<number, ParseError> => {
  const num = Number(str);
  return isNaN(num) 
    ? err(new ParseError("Invalid number")) 
    : ok(num);
};

// Chaining operations
const result = pipe(
  parseNumber("42"),
  map(n => n * 2),
  map(n => `Result: ${n}`)
);
```

### `errors.ts`
Sistema de errores tipados y estandarizados:

```typescript
// Códigos de error estandarizados
export type AppErrorCode =
  | "VALIDATION"      // Errores de validación de entrada
  | "NOT_FOUND"       // Recurso no encontrado
  | "CONFLICT"        // Conflicto de estado/unicidad
  | "UNAUTHORIZED"    // No autenticado
  | "FORBIDDEN"       // No autorizado
  | "DOMAIN_RULE"     // Violación de regla de negocio
  | "INFRA"          // Error de infraestructura
  | "UNKNOWN";       // Error no categorizado

// Clase base para errores de aplicación
export class AppError<D = unknown> extends Error {
  readonly code: AppErrorCode;
  readonly details?: D;
  readonly cause?: unknown;
  readonly timestamp: Date;

  constructor(props: AppErrorProps<D>) {
    super(props.message);
    this.code = props.code;
    this.details = props.details;
    this.cause = props.cause;
    this.timestamp = new Date();
    this.name = 'AppError';
  }
}

// Factory functions para errores comunes
export const validationError = <D = unknown>(
  message: string, 
  details?: D, 
  cause?: unknown
) => new AppError<D>({ code: "VALIDATION", message, details, cause });

export const notFound = <D = unknown>(
  message: string, 
  details?: D, 
  cause?: unknown
) => new AppError<D>({ code: "NOT_FOUND", message, details, cause });

export const domainRuleError = <D = unknown>(
  message: string, 
  details?: D, 
  cause?: unknown
) => new AppError<D>({ code: "DOMAIN_RULE", message, details, cause });
```

### `feature-flags.ts`
Sistema de feature flags para desarrollo y despliegue:

```typescript
// Runtime overrides para testing
let runtimeOverrides: Record<string, Primitive> = {};

export const setFeatureFlags = (overrides: Record<string, Primitive>): void => {
  runtimeOverrides = { ...runtimeOverrides, ...overrides };
};

// Lectura de flags desde diferentes fuentes
export const getFlagRaw = (name: string): string | undefined => {
  // 1. Overrides en memoria (testing)
  const override = runtimeOverrides[name];
  if (override !== undefined) return String(override);

  // 2. Variables de entorno Node.js
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }

  // 3. Variables de entorno Vite (frontend)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
      return String(import.meta.env[name]);
    }
  } catch {
    // Ignore en entornos que no soportan import.meta
  }

  return undefined;
};

// Helpers tipados para diferentes tipos de flags
export const getFlagBool = (name: string, defaultValue = false): boolean => {
  const raw = getFlagRaw(name);
  if (raw === undefined) return defaultValue;
  
  const val = String(raw).toLowerCase().trim();
  return ["1", "true", "on", "yes"].includes(val);
};

export const getFlagNumber = (name: string, defaultValue: number): number => {
  const raw = getFlagRaw(name);
  if (raw === undefined) return defaultValue;
  
  const n = Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
};
```

### `/utils/index.ts`
Utilidades generales y helpers:

```typescript
// Función identidad para pipelines
export const identity = <T>(x: T): T => x;

// Exhaustiveness checking para unions
export const assertNever = (x: never, msg = "Unexpected value"): never => {
  throw new Error(`${msg}: ${JSON.stringify(x)}`);
};

// Delay asíncrono
export const sleep = (ms: number) => 
  new Promise<void>(res => setTimeout(res, ms));

// Clamp numérico
export const clamp = (n: number, min: number, max: number) => 
  Math.min(Math.max(n, min), max);

// UUID simple (crypto-aware)
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback manual para entornos sin crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// JSON parsing seguro
export const safeParseJSON = <T = unknown>(s: string, fallback: T): T => {
  try {
    return JSON.parse(s);
  } catch {
    return fallback;
  }
};

// Try/catch funcional
export const tryCatch = <T>(fn: () => T): Result<T, AppError> => {
  try {
    return ok(fn());
  } catch (error) {
    return err(unknownError("Operation failed", { originalError: error }));
  }
};

// Try/catch asíncrono
export const tryCatchAsync = async <T>(
  fn: () => Promise<T>
): Promise<Result<T, AppError>> => {
  try {
    const result = await fn();
    return ok(result);
  } catch (error) {
    return err(unknownError("Async operation failed", { originalError: error }));
  }
};
```

## 🛠 Patterns Útiles

### Pipe Function
```typescript
// Para composición funcional
export const pipe = <T, R>(
  value: T,
  ...fns: Array<(arg: any) => any>
): R => fns.reduce((acc, fn) => fn(acc), value);

// Uso:
const result = pipe(
  "  hello world  ",
  (s: string) => s.trim(),
  (s: string) => s.toUpperCase(),
  (s: string) => s.split(" "),
  (arr: string[]) => arr.join("-")
); // "HELLO-WORLD"
```

### Option Type
```typescript
export type Option<T> = Some<T> | None;

export interface Some<T> {
  readonly _tag: 'Some';
  readonly value: T;
}

export interface None {
  readonly _tag: 'None';
}

export const some = <T>(value: T): Option<T> => ({ _tag: 'Some', value });
export const none: Option<never> = { _tag: 'None' };

export const isSome = <T>(opt: Option<T>): opt is Some<T> => opt._tag === 'Some';
export const isNone = <T>(opt: Option<T>): opt is None => opt._tag === 'None';
```

## 🚫 Qué NO va en este paquete

- ❌ Lógica de negocio específica de FleetMan
- ❌ Validaciones de dominio
- ❌ Configuración de aplicación
- ❌ Dependencias de frameworks externos
- ❌ Servicios o repositorios

## 📚 Uso en Otros Paquetes

```typescript
// En domain
import { Result, ok, err, DomainError } from '@packages/shared';

// En persistence  
import { Result, tryCatchAsync } from '@packages/shared';

// En infra
import { Result, ok, err, AppError } from '@packages/shared';

// En contracts
import { Result } from '@packages/shared'; // Para tipos de respuesta
```

## 🔍 Testing

```typescript
// Helpers para testing
export const expectOk = <T, E>(result: Result<T, E>): T => {
  if (isErr(result)) {
    throw new Error(`Expected Ok but got Err: ${result.left}`);
  }
  return result.right;
};

export const expectErr = <T, E>(result: Result<T, E>): E => {
  if (isOk(result)) {
    throw new Error(`Expected Err but got Ok: ${result.right}`);
  }
  return result.left;
};
```