/**
 * Utility para convertir objetos nested a dot notation para Mongoose $set
 * 
 * Esto previene que Mongoose reemplace objetos nested completos,
 * permitiendo updates parciales sin pérdida de datos.
 * 
 * @example
 * Input:  { specs: { operatingHours: 500 } }
 * Output: { 'specs.operatingHours': 500 }
 * 
 * @example
 * Input:  { location: { city: 'NY', coordinates: { lat: 40.7 } } }
 * Output: { 'location.city': 'NY', 'location.coordinates.lat': 40.7 }
 */
export function flattenToDotNotation(
  obj: Record<string, any>,
  prefix: string = ''
): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    // Si el valor es null o undefined, asignarlo directamente
    if (value === null || value === undefined) {
      result[newKey] = value;
      continue;
    }

    // Si es un array, asignarlo directamente (no flatten)
    if (Array.isArray(value)) {
      result[newKey] = value;
      continue;
    }

    // Si es un Date, asignarlo directamente
    if (value instanceof Date) {
      result[newKey] = value;
      continue;
    }

    // Si es un objeto plain (no Date, no Array), hacer recursión
    if (typeof value === 'object' && value.constructor === Object) {
      // Flatten recursivamente
      const nested = flattenToDotNotation(value, newKey);
      Object.assign(result, nested);
    } else {
      // Primitivos (string, number, boolean) - asignar directamente
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Ejemplos de uso:
 * 
 * flattenToDotNotation({ brand: 'CAT', specs: { operatingHours: 500 } })
 * // → { brand: 'CAT', 'specs.operatingHours': 500 }
 * 
 * flattenToDotNotation({ 
 *   location: { 
 *     city: 'NY', 
 *     coordinates: { latitude: 40.7, longitude: -74.0 } 
 *   } 
 * })
 * // → { 
 * //     'location.city': 'NY', 
 * //     'location.coordinates.latitude': 40.7,
 * //     'location.coordinates.longitude': -74.0
 * //   }
 */
