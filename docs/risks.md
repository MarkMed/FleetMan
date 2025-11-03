- **R01** - Amenaza - Gestión - **Alteración del alcance vs MVP**
  - incorporación de "nice-to-have" compromete entregables del hito
  - **Probabilidad**: Alta
  - **Impacto**: Alto
  - **Exposición**: 9
  - **Mitigación**: Acordar una lista de "imprescindibles / importantes / deseables"; congelar cambios cerca del hito; pedir una nota corta para cada cambio con impacto y fecha.
  - **Contingencia**: Quitar lo no esencial; entregar una versión básica o marcador de posición; mover nuevas ideas a una fase posterior.

- **R02** - Amenaza - Gestión - **Riesgo de cronograma**
  subestimación, bloqueos o deuda técnica afectan la fecha académica
  - **Probabilidad**: Alta
  - **Impacto**: Alto
  - **Exposición**: 9
  - **Mitigación**: Plan por sprints con margen; revisar a diario el avance vs plan; mantener tareas pequeñas y claras.
  - **Contingencia**: Reordenar prioridades; dividir tareas grandes; posponer lo no crítico para proteger la fecha.

- **R03** - Amenaza - Gestión - **Documentación insuficiente**
  - reaparecen debates, se revierten decisiones y se reimplementa; no encuentran criterios claros; se pide re-trabajo
  - **Probabilidad**: Media
  - **Impacto**: Alto
  - **Exposición**: 6
  - **Mitigación**: Escribir "registro de decisiones", actualizar README y diagramas mientras se desarrolla; cada historia con criterios de aceptación y evidencias.
  - **Contingencia**: Reservar un bloque corto para documentación; crear un resumen técnico y guía de uso; grabar mini-videos de prueba.

- **R04** - Amenaza - Gestión - **Control de cambios débil**
  - solicitudes internas sin solicitudes de cambio formal generan retrabajo
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Exigir nota simple por cambio (motivo, impacto, cómo deshacer); vincular cambios a su tarea; mantener historial por versión.
  - **Contingencia**: Pausar cambios; volver a la versión anterior; corregir lo mínimo y documentar lo ocurrido.

- **R05** - Oportunidad - Gestión - **Eficiencia de desarrollo inesperada**
  - mayor eficiencia en desarrollo obliga a replaneo del cronograma
  - **Probabilidad**: Alta
  - **Impacto**: Medio
  - **Exposición**: 6
  - **Mitigación**: Adelantar historias importantes; asegurar que pruebas y validación acompañen el ritmo; limitar trabajo en paralelo.
  - **Contingencia**: Si pruebas no alcanzan, frenar nuevas funciones y anotar ideas para retomarlas luego.

- **R06** - Amenaza - Técnico - **Refinamientos no considerados**
  - ajustes de diseño amenazan con retrabajo en módulos clave
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Mini-revisión de diseño antes de programar; investigar 2–4 h si hay dudas; anotar la decisión.
  - **Contingencia**: Aplicar el cambio de forma acotada y fácil de apagar/encender; migrar en pasos cortos.

- **R07** - Amenaza - Técnico - **Patrones/entidades mal implementados**
  - necesidad de replanteo de Domain/Use Cases eleva tiempos
  - **Probabilidad**: Media
  - **Impacto**: Alto
  - **Exposición**: 6
  - **Mitigación**: Revisiones entre pares en partes de negocio; avanzar en vertical (funciones pequeñas completas); usar ejemplos de referencia.
  - **Contingencia**: Rehacer sólo la parte afectada; proteger el resto; agregar pruebas para no repetir el error.

- **R08** - Amenaza - Técnico - **Regresiones en el espacio de trabajo**
  - cambios en un paquete rompen otro sin detectarse a tiempo
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Ejecutar pruebas automáticas por módulo; verificar que piezas compartidas compilen y funcionen para todos.
  - **Contingencia**: Volver a la versión estable; desactivar temporalmente el módulo nuevo; aplicar arreglo puntual.

- **R09** - Amenaza - Técnico - **Contratos entre UI y API cambiantes**
  - desalineación de DTOs/validaciones Zod provoca fallos de integración e inconsistencias
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Acordar modelos de datos antes de programar y compartirlos; pruebas que confirmen el acuerdo; permitir dos versiones en cambios mayores.
  - **Contingencia**: Añadir "puente" temporal que convierta datos; mantener formato viejo y nuevo hasta completar la actualización.

- **R10** - Amenaza - Técnico - **Cobertura de pruebas insuficiente**
  - tests unitarios/integración/E2E insuficientes permiten defectos críticos
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Definir pruebas unitarias por funcionalidad; crear datos de ejemplo en la DB.
  - **Contingencia**: Jornada intensiva de pruebas; pausar nuevas funciones hasta corregir fallas graves en funcionalidades clave.

- **R11** - Amenaza - Técnico - **Fallas en recordatorios**
  - lógica de scheduler/alertas se comporta de forma inconsistente
  - **Probabilidad**: Media
  - **Impacto**: Alto
  - **Exposición**: 6
  - **Mitigación**: Programar con reintentos y códigos únicos; respetar zona horaria; probar bien fechas y horarios.
  - **Contingencia**: Enviar resumen diario; permitir re-enviar manualmente; mostrar alertas dentro de la app.

- **R12** - Oportunidad - Técnico - **Reutilización subestimada**
  - estrategia modular habilita alta reutilización de paquetes/componentes acelerando entregas
  - **Probabilidad**: Alta
  - **Impacto**: Medio
  - **Exposición**: 6
  - **Mitigación**: Mantener biblioteca interna de componentes y plantillas; documentar su uso.
  - **Contingencia**: Si no se puede reutilizar, partir de plantilla base y planear limpieza posterior.

- **R13** - Amenaza - Externo - **Cambios de alcance del cliente**
  - nuevas necesidades en medio del MVP impactan planificación
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Revisión constante con el cliente sobre funcionalidades principales; revisar alineación antes de cada sprint.
  - **Contingencia**: Proponer entrega posterior; intercambiar alcance por otro de esfuerzo similar; entregar prototipo si no da el tiempo.

- **R14** - Amenaza - Externo - **Baja disponibilidad para validar**
  - demoras en feedback/aceptación bloquean cierre de tareas
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Acordar demos periódicas; aceptar feedback por video/capturas; dejar claros los criterios de aceptación.
  - **Contingencia**: Nombrar representante de validación; fijar plazo máximo de respuesta; vencido el plazo, aceptar provisionalmente salvo observación crítica.

- **R15** - Amenaza - Humano - **Ambigüedad puntual de requerimientos**
  - frases imprecisas dejan dudas sobre reglas, datos, permisos o flujos
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Exigir "preparación mínima" de cada historia: reglas, datos, permisos, casos límite y zona horaria.
  - **Contingencia**: Pasar la historia al siguiente sprint o implementar un comportamiento por defecto, fácil de cambiar luego.

- **R16** - Amenaza - Técnico - **Resultados diferentes por plataforma**
  - diferencias iOS/Android/desktop duplican esfuerzo por funcionalidad
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Definir qué plataformas se soportan; pruebas rápidas por navegador clave.
  - **Contingencia**: Usar flujo web estándar cuando falte soporte; evaluar seguir con funciones específicas y documentar la decisión.

- **R17** - Amenaza - Técnico - **Ajustes mínimos de seguridad/privacidad descubiertos tarde**
  - aparición de requisitos básicos (rate limiting, bloqueo por intentos, avisos de privacidad, etc.) que exigen cambios y retrabajo
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Incluir desde el inicio controles básicos (límite de intentos, bloqueo, verificación de permisos, no guardar datos sensibles en errores).
  - **Contingencia**: Corregir con prioridad; si es necesario, dejar sólo lectura temporalmente; aplicar plan rápido de refuerzo.

- **R18** - Amenaza - Técnico - **Incongruencias de datos**
  - detección de datos inconsistentes dispara debugging y retrasa entregas
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Validar datos al entrar y al guardar; usar listas y reglas claras; evitar duplicados con controles únicos.
  - **Contingencia**: Preparar scripts para detectar/arreglar datos; permitir edición masiva supervisada; dejar registro de correcciones.

- **R19** - Amenaza - Externo - **Cambios solicitados por el área académica**
  - ediciones/rediseños o nuevos apartados fuera de plan desembocan en re-trabajo
  - **Probabilidad**: Alta
  - **Impacto**: Medio
  - **Exposición**: 6
  - **Mitigación**: Revisar temprano con docente guía; usar la plantilla y requisitos formales de la institución.
  - **Contingencia**: Negociar alcance; mover material nuevo a anexos; dedicar bloque corto a edición y formato.

- **R20** - Oportunidad - Externo - **Revisión académica superior**
  - revisión temprana con tutora con observaciones y ajustes menores que optimizan y agilizan el proceso de manera no planeada
  - **Probabilidad**: Media
  - **Impacto**: Medio
  - **Exposición**: 4
  - **Mitigación**: Ensayar la defensa antes; usar la rúbrica de evaluación; aplicar las observaciones cuanto antes.
  - **Contingencia**: Planear actualización rápida de documentos y evidencias; ajustar hitos intermedios.

- **R21** - Amenaza - Técnico - **Dependencias emergentes no previstas**
  - hallazgos de nuevas necesidades como dependencias para cumplir funcionalidades, agregando carga extra y demoras
  - **Probabilidad**: Alta
  - **Impacto**: Alto
  - **Exposición**: 9
  - **Mitigación**: Comprobar viabilidad antes de comprometerse; aislar el uso de terceros para poder cambiar; tener alternativa identificada.
  - **Contingencia**: Quitar temporalmente el alcance afectado o reemplazarlo por paso manual; usar reemplazo temporal; cambiar de proveedor si conviene.
