import React from 'react';
import { TimerButton } from '../components/ui';

/**
 * Ejemplos de uso del TimerButton
 * Este archivo muestra los diferentes casos de uso
 */
export const TimerButtonExamples: React.FC = () => {
  const handleAction = (action: string) => {
    console.log(`Ejecutando acción: ${action}`);
    alert(`¡Acción ejecutada: ${action}!`);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Ejemplos de TimerButton</h1>

      {/* Ejemplo 1: startOnRender=true (DEFAULT) - Timer automático */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. startOnRender=true (DEFAULT) - Timer Automático</h2>
        <p className="text-gray-600">
          Timer inicia automáticamente, botón deshabilitado → al terminar se habilita para que el usuario confirme.
        </p>
        <TimerButton
          startOnRender={true}
          duration={5}
          onAction={() => handleAction('Acción con timer automático')}
          label="Confirmar Acción"
          timerLabel={(remaining: number) => `Esperando... (${remaining}s)`}
          variant="filled"
          showProgress={true}
        />
        <div className="pt-2">
          <span className="text-xs text-gray-500">(Con resetOnAction: reutilizable)</span>
          <TimerButton
            startOnRender={true}
            duration={3}
            onAction={() => handleAction('Acción reutilizable')}
            label="Reutilizable"
            timerLabel={(remaining: number) => `(${remaining})`}
            variant="success"
            showProgress={true}
            resetOnAction={true}
          />
        </div>
      </div>

      {/* Ejemplo 2: startOnRender=false - Timer cancelable */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. startOnRender=false - Timer Cancelable</h2>
        <p className="text-gray-600">
          Botón habilitado → click inicia timer (sigue habilitado para cancelar) → si no se cancela, ejecuta automáticamente.
        </p>
        <TimerButton
          startOnRender={false}
          duration={5}
          onAction={() => handleAction('Acción cancelable')}
          label="Iniciar Proceso"
          timerLabel={(remaining: number) => `Procesando... ${remaining} (click para cancelar)`}
          variant="secondary"
          showProgress={true}
        />
        <div className="pt-2">
          <span className="text-xs text-gray-500">(Con resetOnAction: reutilizable)</span>
          <TimerButton
            startOnRender={false}
            duration={3}
            onAction={() => handleAction('Proceso reutilizable')}
            label="Reutilizable"
            timerLabel={(remaining: number) => `(${remaining})`}
            variant="success"
            showProgress={true}
            resetOnAction={true}
          />
        </div>
      </div>

      {/* Ejemplo 3: doubleConfirmation=true - Modo mixto (máxima seguridad) */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. doubleConfirmation=true - Máxima Seguridad</h2>
        <p className="text-gray-600">
          <strong>Doble protección:</strong> Timer automático + timer cancelable → máxima seguridad para acciones críticas.
        </p>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-red-700 text-sm mb-3">
            <strong>Flujo:</strong> Timer automático (botón deshabilitado) → Click de confirmación → Timer cancelable → Ejecución
          </p>
          <TimerButton
            doubleConfirmation={true}
            duration={4}
            onAction={() => handleAction('ELIMINACIÓN CRÍTICA')}
            label="Eliminar Permanentemente"
            timerLabel={(remaining: number) => `${remaining}s`}
            variant="destructive"
            showProgress={true}
          />
          <div className="pt-2">
            <span className="text-xs text-gray-500">(Con resetOnAction: reutilizable)</span>
            <TimerButton
              doubleConfirmation={true}
              duration={2}
              onAction={() => handleAction('Double reutilizable')}
              label="Double Reutilizable"
              timerLabel={(remaining: number) => `(${remaining})`}
              variant="success"
              showProgress={true}
              resetOnAction={true}
            />
          </div>
        </div>
      </div>

      {/* Ejemplo 3: Sin progreso visual */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. Sin Progreso Visual</h2>
        <p className="text-gray-600">
          Solo texto de countdown, sin círculo de progreso.
        </p>
        <TimerButton
          startOnRender={false}
          duration={3}
          onAction={() => handleAction('Enviar reporte')}
          label="Enviar Reporte"
          timerLabel={(remaining: number) => `Enviando en ${remaining}...`}
          variant="secondary"
          showProgress={false}
        />
      </div>

      {/* Ejemplo 4: Timer personalizado */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">4. Timer Personalizado</h2>
        <p className="text-gray-600">
          Timer de 10 segundos con texto personalizado.
        </p>
        <TimerButton
          startOnRender={false}
          duration={10}
          onAction={() => handleAction('Proceso crítico')}
          label="Iniciar Proceso Crítico"
          timerLabel={(remaining: number) => `⏳ Procesando... ${remaining}s restantes`}
          variant="warning"
          showProgress={true}
        />
      </div>

      {/* Ejemplo 5: Botón deshabilitado externamente */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">5. Con Validación Externa</h2>
        <p className="text-gray-600">
          Botón deshabilitado hasta que se cumpla una condición externa.
        </p>
        <TimerButton
          startOnRender={false}
          duration={3}
          onAction={() => handleAction('Guardar cambios')}
          label="Guardar Cambios"
          timerLabel={(remaining: number) => `Guardando... ${remaining}`}
          variant="success"
          disabled={false} // Cambiar a true para ver el efecto
          showProgress={true}
        />
      </div>

      {/* Tips de uso */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Guía de Uso</h3>
        <ul className="space-y-2 text-blue-800">
          <li><strong>startOnRender=true:</strong> Timer automático, requiere confirmación del usuario</li>
          <li><strong>startOnRender=false:</strong> Timer cancelable, ideal para wizard/formularios</li>
          <li><strong>doubleConfirmation=true:</strong> Máxima seguridad, combina ambos modos</li>
        </ul>
        
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <div className="p-3 bg-green-100 rounded">
            <h4 className="font-semibold text-green-900">🔄 Modo 1: Auto</h4>
            <p className="text-green-800 text-sm">Timer → Confirmación manual</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded">
            <h4 className="font-semibold text-yellow-900">⚡ Modo 2: Cancelable</h4>
            <p className="text-yellow-800 text-sm">Click → Timer cancelable</p>
          </div>
          <div className="p-3 bg-red-100 rounded">
            <h4 className="font-semibold text-red-900">🛡️ Modo 3: Double</h4>
            <p className="text-red-800 text-sm">Auto + Cancelable</p>
          </div>
        </div>
      </div>
    </div>
  );
};