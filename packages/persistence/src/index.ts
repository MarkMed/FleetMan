// /packages/persistence/src/index.ts
// Punto de entrada del paquete de persistencia

// Repositorios concretos
export * from "./repositories";

// Mappers Document ↔ Domain
export * from "./mappers";

// Modelos Mongoose (internos)
// Los modelos NO se exportan para mantener encapsulación

export function initPersistence() {
  // TODO: Configurar conexión MongoDB y migraciones
  return { ok: true };
}