/**
 * Test para la entidad MachineType
 * Verifica la creación, validaciones y operaciones básicas
 */
import { MachineType } from './machine-type.entity';

console.log('=== Tests MachineType Entity ===\n');

// =============================================================================
// Test 1: Creación básica
// =============================================================================
console.log('🧪 Test 1: Creación básica con un idioma');

try {
  const excavator = MachineType.create('Excavadora', 'es');
  console.log('✅ MachineType creada exitosamente');
  console.log('  📝 Nombre:', excavator.name);
  console.log('  🌍 Idiomas:', excavator.languages);
  console.log('  🆔 ID:', excavator.id || '(sin ID - nuevo)');
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

// =============================================================================
// Test 2: Reconstitución con múltiples idiomas
// =============================================================================
console.log('\n🧪 Test 2: Reconstitución con múltiples idiomas');

try {
  const bulldozer = MachineType.create(
    'Bulldozer', 
    'en', 
    'machine-type-123',
    ['en', 'es', 'fr']
  );
  console.log('✅ MachineType reconstituida con múltiples idiomas');
  console.log('  📝 Nombre:', bulldozer.name);
  console.log('  🌍 Idiomas:', bulldozer.languages);
  console.log('  🆔 ID:', bulldozer.id);
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

// =============================================================================
// Test 3: Agregar idioma
// =============================================================================
console.log('\n🧪 Test 3: Agregar idioma a un tipo existente');

try {
  const crane = MachineType.create('Grúa', 'es');
  console.log('  Idiomas iniciales:', crane.languages);
  
  crane.addLanguage('en');
  console.log('  ✅ Idioma "en" agregado');
  console.log('  Idiomas actuales:', crane.languages);
  
  crane.addLanguage('es'); // Duplicado
  console.log('  ✅ Idioma "es" duplicado (no se agrega)');
  console.log('  Idiomas actuales:', crane.languages);
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

// =============================================================================
// Test 4: Actualizar nombre
// =============================================================================
console.log('\n🧪 Test 4: Actualizar nombre');

try {
  const loader = MachineType.create('Cargadora', 'es');
  console.log('  Nombre inicial:', loader.name);
  
  loader.updateName('Cargador Frontal');
  console.log('  ✅ Nombre actualizado:', loader.name);
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

// =============================================================================
// Test 5: Validaciones de nombre
// =============================================================================
console.log('\n🧪 Test 5: Validaciones de nombre');

try {
  const invalid1 = MachineType.create('A', 'es'); // Muy corto
  console.log('❌ Debería haber fallado con nombre muy corto');
} catch (error: any) {
  console.log('✅ Validación correcta - nombre muy corto:', error.message);
}

try {
  const invalid2 = MachineType.create('A'.repeat(51), 'es'); // Muy largo
  console.log('❌ Debería haber fallado con nombre muy largo');
} catch (error: any) {
  console.log('✅ Validación correcta - nombre muy largo:', error.message);
}

try {
  const invalid3 = MachineType.create('', 'es'); // Vacío
  console.log('❌ Debería haber fallado con nombre vacío');
} catch (error: any) {
  console.log('✅ Validación correcta - nombre vacío:', error.message);
}

// =============================================================================
// Test 6: Validaciones de idioma
// =============================================================================
console.log('\n🧪 Test 6: Validaciones de idioma');

try {
  const invalid4 = MachineType.create('Excavadora', 'esp'); // No es ISO 639-1
  console.log('❌ Debería haber fallado con código de idioma inválido');
} catch (error: any) {
  console.log('✅ Validación correcta - código de idioma inválido:', error.message);
}

try {
  const invalid5 = MachineType.create('Excavadora', ''); // Vacío
  console.log('❌ Debería haber fallado con idioma vacío');
} catch (error: any) {
  console.log('✅ Validación correcta - idioma vacío:', error.message);
}

// =============================================================================
// Test 7: Comparación de nombres (case-insensitive)
// =============================================================================
console.log('\n🧪 Test 7: Comparación de nombres');

try {
  const mixer = MachineType.create('Mixer', 'en');
  
  console.log('  ¿Tiene nombre "Mixer"?:', mixer.hasName('Mixer') ? '✅ Sí' : '❌ No');
  console.log('  ¿Tiene nombre "mixer"?:', mixer.hasName('mixer') ? '✅ Sí' : '❌ No');
  console.log('  ¿Tiene nombre "MIXER"?:', mixer.hasName('MIXER') ? '✅ Sí' : '❌ No');
  console.log('  ¿Tiene nombre "Grúa"?:', mixer.hasName('Grúa') ? '❌ Sí' : '✅ No');
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

// =============================================================================
// Test 8: Serialización JSON
// =============================================================================
console.log('\n🧪 Test 8: Serialización JSON');

try {
  const compactor = MachineType.create('Compactadora', 'es', 'mt-456', ['es', 'en']);
  const json = compactor.toJSON();
  
  console.log('✅ JSON serializado correctamente:');
  console.log('  ', JSON.stringify(json, null, 2));
} catch (error: any) {
  console.log('❌ Error inesperado:', error.message);
}

console.log('\n🎉 Tests completados para MachineType Entity');
console.log('✅ Cobertura: Creación, validaciones, idiomas, comparación, serialización');

export {};
