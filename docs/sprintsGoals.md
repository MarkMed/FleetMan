# Objetivos por Sprint - FleetMan

## Vista Panorámica de Evolución del Proyecto

---

- **Sprint #0**: Finalizar y entregar documento de Anteproyecto
   - Completar la documentación académica inicial que sienta las bases teóricas del proyecto. Incluye diagramación de arquitectura, modelo conceptual de dominio, y planificación detallada de tareas. Este sprint es retrospectivo y establece el marco de referencia para el desarrollo posterior.

- **Sprint #1**: Configurar entornos y herramientas de desarrollo (dependencias, monorepo, editor online)
   - Establecer la infraestructura técnica fundamental para el desarrollo colaborativo. La configuración del monorepo y entornos remotos es crítica para mantener consistencia entre desarrolladores y facilitar el trabajo distribuido. Reduce friction técnico en sprints posteriores.

- **Sprint #2**: Lograr un User Journey refinado y aprobado por el cliente. Crear entidades (clases) básicas
   - Alinear la visión del producto con el cliente mediante un User Journey detallado, asegurando que el desarrollo se enfoque en valor real. Simultáneamente, crear las estructuras de datos fundamentales (DTOs, esquemas) que servirán como columna vertebral de toda la aplicación.

- **Sprint #3**: Establecer la infraestructura básica de backend y frontend necesaria para el desarrollo posterior de funcionalidades de dominio
   - Construir los cimientos técnicos que permitirán el desarrollo ágil de características de negocio. Incluye setup básico de ambas capas de la aplicación y refinamiento de contratos compartidos. Este sprint desbloquea el desarrollo paralelo de funcionalidades complejas.

- **Sprint #4**: 🎯 **Auth Básico Funcional** - Registro, login, autologin, session JWT y logout
   - **🎯 FOCO PRINCIPAL**: Sistema de autenticación simple pero completo. Registro con formularios básicos + login con autologin + gestión sesiones JWT + logout + feedback plano (mostrar datos usuario al loguear). Si hay tiempo: wizard form para registro. Backend: endpoints seguros + validaciones Zod + hash contraseñas + autorización básica. **ENTREGABLE**: Auth operativo para desarrollo posterior máquinas.

- **Sprint #5**: 🏭 **Navegación + Inicio Máquinas** - Pulir navigation y empezar registro de máquinas
   - **🏭 FOCO PRINCIPAL**: Construir sobre auth Sprint #4 refinando navegación y comenzando core del negocio. Pulir navigation flows + mejorar UX auth + implementar alta de máquinas con validaciones básicas. Frontend: navegación optimizada + formulario registro máquina + validación tiempo real. Backend: modelo máquina + endpoints básicos + middleware autorización. **CONSTRUYE HACIA**: CRUD completo Sprint #6.

- **Sprint #6**: 🚀 **Deploy Azure + Máquinas Completas** - Focus deploys Azure y pulir pantallas máquinas
   - **🚀 FOCO PRINCIPAL**: Deploy early + completar gestión máquinas. Setup Azure deployment + CI/CD básico + completar CRUD máquinas: mis máquinas + detalles máquina + dashboard + edición con historial. Pulir navegación si es necesario. Frontend: pantallas completas máquinas + dashboard funcional. Backend: CRUD completo + deployment productivo. **CONSTRUYE HACIA**: Sistema máquinas operativo para QuickCheck Sprint #7.

- **Sprint #7**: 📋 **Full QuickCheck** - Sistema completo de inspecciones rápidas end-to-end
   - **📋 FOCO PRINCIPAL**: Entregar feature de valor inmediato construyendo sobre máquinas Sprint #6. QuickCheck completo: plantillas dinámicas + UI ejecución intuitiva + persistencia resultados + asociación equipos + scoring. Frontend: wizard checklist + validación tiempo real + resultados visuales + historial. Backend: templates flexibles + scoring + persistencia + eventos. **ENTREGABLE CRÍTICO**: Feature diferenciadora funcional para demos.

- **Sprint #8**: ⚙️ **PWA + Testing + Cronjobs** - Infraestructura crítica y testing de lo implementado
   - **⚙️ FOCO PRINCIPAL**: Consolidar lo desarrollado con infraestructura key. PWA setup completo (manifest + SW básico) + testing comprehensivo de features implementadas (auth, máquinas, QuickCheck) + cronjobs infrastructure (scheduler básico tolerante a fallos). Backend: cronjobs + job queues básicas. Frontend: PWA + testing. **CONSTRUYE HACIA**: Base sólida para notificaciones Sprint #9 y alertas automáticas futuras.

- **Sprint #9**: 📬 **Full Notificaciones** - Sistema completo front y back de notificaciones
   - **📬 FOCO PRINCIPAL**: Establecer todo el sistema de notificaciones construyendo sobre infraestructura Sprint #8. Centro notificaciones completo: bandeja + estados leído/no leído + categorización + filtros + integración con eventos. Frontend: UI notificaciones + estados + navegación. Backend: modelo completo + endpoints + hooks para módulos + integración cronjobs. **CONSTRUYE HACIA**: Base crítica para eventos Sprint #10.

- **Sprint #10**: 📅 **Reporte Eventos + Eventos Automáticos** - Sistema eventos básico sin features no solicitadas
   - **📅 FOCO PRINCIPAL**: Implementar eventos pragmatic construyendo sobre notificaciones Sprint #9. Reporte manual de eventos + eventos automáticos (desde QuickCheck, sistema, etc.) + integración notificaciones. No timeline visual ni features complex - focus en que exista y funcione first. Frontend: formulario eventos + lista simple. Backend: modelo eventos + triggers automáticos + integración notifications. **CONSTRUYE HACIA**: Base events para mantenimiento Sprint #11.

- **Sprint #11**: ⚙️ **Full Mantenimiento** - Feature completa sin cosas no solicitadas
   - **⚙️ FOCO PRINCIPAL**: Completar mantenimiento preventivo construyendo sobre cronjobs Sprint #8 y eventos Sprint #10. Solo un timer (cronjob) que interactúe con sistema de eventos automáticos + sistema de notificaciones. Recordatorios + alertas automáticas + programación básica. No features complex no solicitadas - focus funcional. Frontend: configuración recordatorios + alertas. Backend: scheduler robusto + alert generation + integration. **CIERRA MVP CORE**: Último módulo funcional crítico.

- **Sprint #12**: 💬 **Full Comunicaciones** - Listado usuarios + gestión contactos + chat sencillo
   - **💬 FOCO PRINCIPAL**: Completar dimensión social del sistema. Listado y búsqueda usuarios + gestión contactos (agregar y remover) + chat sencillo interno. Frontend: directorio usuarios + lista contactos + UI chat básico. Backend: endpoints usuarios + modelo contactos + mensajería simple + notificaciones chat. **COMPLETA FEATURES CORE**: Último módulo funcional antes de refinamiento y nice-to-have.

- **Sprint #13**: 🧪 **Smoke Tests + Buffer** - Testing, refinamientos y mejoras necesarias
   - **🧪 FOCO PRINCIPAL**: Sprint buffer con testing y refinamiento construyendo sobre MVP completo Sprint #12. Smoke tests de todas las features + refinamientos críticos + mejoras UI necesarias + correcciones bugs. Testing comprehensivo end-to-end + validación manual + polish esencial. **BUFFER ESTRATÉGICO**: Asegura calidad antes de nice-to-have y permite ajustes post-integración completa.

- **Sprint #14**: � **Feature Básica Repuestos** - Módulo repuestos básico funcional
   - **� FOCO PRINCIPAL**: Agregar gestión básica de repuestos construyendo sobre máquinas existentes. Registro repuestos + asociación con máquinas + listado + edición básica. Frontend: formularios repuestos + listado + integración con máquinas. Backend: modelo repuestos + endpoints + relación con máquinas. **NICE-TO-HAVE PRIORITARIO**: Complementa gestión maquinaria con valor agregado tangible.

- **Sprint #15**: 🎁 **Full Nice-to-Have + UX** - Recuperación password + búsqueda + ayuda + mejoras UX
   - **🎁 FOCO PRINCIPAL**: Completar nice-to-have prioritarios y mejoras de experiencia. Recuperación contraseña + búsqueda básica sistema + centro ayuda + mejoras UX/UI (refinamiento visual y usabilidad) + guías contextuales. Si es posible: i18n básico + quick actions. **ENHANCE VALUE**: Elevar experiencia de usuario a nivel production-ready con features deseadas.

- **Sprint #16**: ✨ **Último Sprint Desarrollo** - Full pulida, nada de features nuevas, documentación
   - **✨ FOCO PRINCIPAL**: Último sprint de desarrollo con polish final y documentación. Full pulida de todo el sistema + corrección bugs finales + optimización performance + documentación completa (API docs + manual usuario + deployment guides) + demo script. **NO FEATURES NUEVAS**: Solo refinamiento, optimización y documentación para entrega. **FREEZE FUNCIONAL**: Sistema completo listo para entrega académica.

- **Sprint #17**: 🛡️ **Buffer Final de Entrega** - Contingencia + polish académico + verificaciones entrega
   - **🛡️ SAFETY NET**: Sprint de contingencia y refinamiento final antes de entrega académica. Refinamientos de última hora + documentación complementaria + verificaciones finales + contingencia para cualquier impedimento anterior. **BUFFER AMPLIO** (20.3hs): Garantiza entrega on-time con calidad académica independientemente de desafíos.

---

## Análisis Estratégico

### Hitos Estratégicos Refinados:

#### **Hito #1: Auth Básico** (Sprint #4)
- **Funcionalidades**: Registro, login con autologin, session JWT, logout, feedback básico
- **Status**: 🚧 **En progreso Sprint #4** - Auth simple pero funcional

#### **Hito #2: Gestión Máquinas** (Sprint #5-6)
- **Funcionalidades**: CRUD completo + deploy Azure + pantallas pulidas
- **Sprint #5**: Alta máquinas + navegación refinada
- **Sprint #6**: CRUD completo + deploy + dashboard

#### **Hito #3: QuickCheck** (Sprint #7)
- **Funcionalidades**: Sistema completo inspecciones rápidas end-to-end
- **Entregable**: Feature diferenciadora funcional para demos

#### **Hito #4: Infraestructura** (Sprint #8)
- **Funcionalidades**: PWA + testing comprehensivo + cronjobs infrastructure
- **Crítico**: Base sólida para módulos complejos posteriores

#### **Hito #5: Notificaciones** (Sprint #9)
- **Funcionalidades**: Sistema completo front/back notificaciones
- **Entregable**: Centro notificaciones + integración con eventos

#### **Hito #6: Eventos** (Sprint #10)
- **Funcionalidades**: Reporte eventos + eventos automáticos (sin timeline visual)
- **Pragmatic**: Focus en funcionalidad vs visual complexity

#### **Hito #7: Mantenimiento** (Sprint #11)
- **Funcionalidades**: Feature completa sin over-engineering
- **Simple**: Timer + eventos automáticos + notificaciones

#### **Hito #8: Comunicaciones** (Sprint #12)
- **Funcionalidades**: Listado usuarios + contactos + chat sencillo
- **Completa**: MVP core funcional completo

---

## Roadmap Estratégico Refinado

### **🎯 MVP Core (Sprints #4-12)**

#### **Fase Fundación** (Sprints #4-6):
- **Sprint #4**: 🎯 **Auth básico funcional** 
- **Sprint #5**: 🏭 **Navegación + inicio máquinas**
- **Sprint #6**: � **Deploy Azure + máquinas completas**

#### **Fase Features Core** (Sprints #7-11):
- **Sprint #7**: 📋 **QuickCheck completo** 
- **Sprint #8**: ⚙️ **PWA + testing + cronjobs** 
- **Sprint #9**: 🔔 **Notificaciones completas**
- **Sprint #10**: 📅 **Eventos + eventos automáticos**
- **Sprint #11**: ⚙️ **Mantenimiento completo**

#### **Fase Social** (Sprint #12):
- **Sprint #12**: 💬 **Comunicaciones completas**

### **🎁 Enhancement & Delivery (Sprints #13-17)**

#### **Fase Refinamiento** (Sprints #13-15):
- **Sprint #13**: 🧪 **Buffer + smoke tests**
- **Sprint #14**: 🔧 **Repuestos básicos** 
- **Sprint #15**: 🎁 **Nice-to-have + UX**

#### **Fase Final** (Sprints #16-17):
- **Sprint #16**: ✨ **Polish final + docs**
- **Sprint #17**: 🛡️ **Buffer entrega**

### **✅ Principios Estratégicos**

1. **🎯 MVP-First**: Funcionalidad simple pero completa antes que features complejas
2. **🚀 Early Deploy**: Azure en Sprint #6 vs rush final  
3. **⚙️ Infrastructure Early**: PWA + testing + cronjobs en Sprint #8
4. **📦 Feature Complete per Sprint**: Cada sprint entrega working software
5. **🛡️ Strategic Buffers**: Sprint #13 buffer + Sprint #17 entrega
6. **🎁 Nice-to-Have Later**: Repuestos + UX + features bonus post-MVP

### **🔧 Ajustes Clave vs Versión Anterior**

✅ **Sprint #8 optimizado**: PWA + testing + cronjobs (sin UX complex)  
✅ **UX movido a Sprint #15**: Junto con nice-to-have prioritarios  
✅ **Eventos pragmáticos**: Sin timeline visual, focus funcional  
✅ **Mantenimiento simple**: Timer + eventos + notificaciones (no over-engineering)  
✅ **Buffer estratégico Sprint #13**: Testing + refinamientos necesarios  
✅ **Polish final Sprint #16**: Documentación + freeze funcional

