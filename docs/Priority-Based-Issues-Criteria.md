# Priority-Based Issues

Para garantizar un correcto enfoque en la corrección de incidentes, se definió un esquema de manejo basado en un **criterio de priorización**.  
El objetivo principal de este enfoque es concentrar los esfuerzos en los incidentes más críticos para el funcionamiento del sistema, optimizando los tiempos de resolución y evitando fugas de trabajo en tareas de bajo impacto.

El criterio definido consta de **tres niveles de prioridad**, los cuales representan una simplificación intencional con el fin de mantener un enfoque centralizado, claro y fácilmente aplicable durante el proceso de análisis y corrección.

---

## Niveles de Prioridad

### 🔵 Prioridad Baja (Low)
Los incidentes de prioridad baja corresponden a detalles menores que no afectan el funcionamiento correcto de la aplicación.  

Incluyen, entre otros:
- Errores ortográficos
- Problemas de formato visual
- Ajustes de estilo
- Scrolls innecesarios
- Inconsistencias estéticas

La persistencia de este tipo de incidentes **no genera impacto funcional**, por lo que su corrección puede postergarse o incluso ser ignorada sin comprometer la operatividad del sistema.

---

### 🟡 Prioridad Media (Medium)
Los incidentes de prioridad media requieren un análisis técnico, ya que pueden limitar parcialmente el funcionamiento de la aplicación o afectar flujos secundarios.

Ejemplos de este nivel incluyen:
- Validaciones incompletas
- Comportamientos inesperados en casos específicos
- Funcionalidades que no responden como se espera en determinados escenarios
- Problemas que afectan pasos no críticos del flujo principal

Si bien no representan una falla crítica, estos incidentes pueden generar fricción en la experiencia del usuario y deben ser revisados para evaluar la necesidad de corrección.

---

### 🔴 Prioridad Alta (High)
Los incidentes de prioridad alta son aquellos que afectan directamente el correcto funcionamiento de la aplicación.

Este nivel incluye:
- Bloqueo de funcionalidades clave
- Errores críticos del sistema
- Fallas que impiden el uso normal de la aplicación
- Problemas que comprometen la integridad de los datos

Los incidentes clasificados en este nivel **deben ser corregidos obligatoriamente**, y no se considera aceptable la existencia de incidentes activos de prioridad alta.

---

## Objetivo de la Metodología

La adopción de este enfoque permite ordenar el trabajo de forma eficiente, mejorar la toma de decisiones técnicas y asegurar que los recursos disponibles se destinen a los puntos de mayor impacto.

Se espera que esta metodología contribuya a:
- Mayor estabilidad del sistema
- Reducción de reprocesos
- Optimización de tiempos de corrección
- Mejora continua en la calidad general de la aplicación
