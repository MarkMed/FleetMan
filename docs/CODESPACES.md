# 🚀 Guía de Desarrollo en GitHub Codespaces

Esta guía te ayudará a desarrollar FleetMan usando GitHub Codespaces de manera efectiva.

## ¿Qué es GitHub Codespaces?

GitHub Codespaces es un entorno de desarrollo completo basado en la nube que se ejecuta en VSCode. Te permite desarrollar sin necesidad de instalar nada en tu computadora local.

## 🎯 Inicio Rápido

### 1. Crear un Codespace

1. Ve al repositorio en GitHub: https://github.com/MarkMed/FleetMan
2. Haz clic en el botón verde **"Code"**
3. Selecciona la pestaña **"Codespaces"**
4. Haz clic en **"Create codespace on main"** (o en tu rama de trabajo)

El Codespace tardará unos minutos en iniciarse y configurarse automáticamente.

### 2. Configuración Automática

Cuando el Codespace se inicie, automáticamente:
- ✅ Instalará Node.js 20
- ✅ Configurará pnpm
- ✅ Instalará todas las dependencias del proyecto
- ✅ Configurará las extensiones de VSCode recomendadas
- ✅ Preparará los puertos 3000 (frontend) y 5000 (backend)

### 3. Iniciar el Frontend

Una vez que el Codespace esté listo:

```bash
cd apps/frontend
pnpm dev
```

Verás algo como:
```
  VITE v5.4.0  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## 👀 Cómo Visualizar la Aplicación

### Opción 1: Notificación Automática (Más Fácil)

Cuando ejecutes `pnpm dev`, VSCode mostrará una notificación en la esquina inferior derecha:

```
Your application running on port 3000 is available.
[Open in Browser] [Preview in Editor]
```

- **Open in Browser**: Abre en una nueva pestaña del navegador
- **Preview in Editor**: Abre en un panel dentro de VSCode (⭐ Recomendado)

### Opción 2: Panel de Puertos

1. Busca el panel **"PORTS"** en la parte inferior de VSCode (junto a "TERMINAL")
2. Verás una lista de puertos:
   ```
   PORT    | LABEL           | LOCAL ADDRESS
   3000    | Frontend (Vite) | https://xxxxxx-3000.preview.app.github.dev
   5000    | Backend API     | https://xxxxxx-5000.preview.app.github.dev
   ```
3. Haz clic derecho en el puerto **3000**
4. Selecciona una opción:
   - **"Open in Browser"**: Nueva pestaña del navegador
   - **"Preview in Editor"**: Panel dentro de VSCode ⭐
   - **"Copy Local Address"**: Copia la URL

### Opción 3: Paleta de Comandos

1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Busca: **"Ports: Focus on Ports View"**
3. Se abrirá el panel de puertos donde puedes hacer clic en las URLs

## 🎨 Desarrollo del Frontend

### Comandos Útiles

```bash
# Iniciar servidor de desarrollo
cd apps/frontend && pnpm dev

# Compilar para producción
pnpm build

# Vista previa de la compilación
pnpm preview

# Verificación de tipos
pnpm typecheck

# Linting
pnpm lint
```

### Hot Reload

Los cambios que hagas en el código se reflejarán automáticamente en el navegador gracias a Vite's Hot Module Replacement (HMR).

## 🔧 Desarrollo del Backend

Si también necesitas trabajar con el backend:

```bash
cd apps/backend
pnpm dev
```

El backend estará disponible en el puerto **5000**. Puedes acceder a él de la misma manera que al frontend.

## 🚀 Desarrollo Completo (Frontend + Backend)

Para iniciar ambos servicios simultáneamente desde la raíz del proyecto:

```bash
pnpm dev
```

Esto iniciará tanto el frontend como el backend en paralelo.

## 📱 Características Especiales en Codespaces

### 1. Puertos Automáticos
- El puerto 3000 se configurará automáticamente para abrir en el navegador
- El puerto 5000 enviará una notificación cuando esté listo
- Ambos puertos son accesibles desde tu navegador

### 2. Visibilidad de Puertos
Los puertos pueden ser:
- **Private**: Solo accesible para ti
- **Public**: Accesible para cualquiera con la URL (útil para compartir)

Para cambiar la visibilidad:
1. Ve al panel "PORTS"
2. Haz clic derecho en el puerto
3. Selecciona "Port Visibility" → "Public" o "Private"

### 3. Extensiones Pre-instaladas
El Codespace incluye automáticamente:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Error Lens
- TypeScript
- GitHub Copilot (si tienes acceso)

### 4. Persistencia
- Tus cambios en el código se guardan automáticamente
- El Codespace se pausará después de 30 minutos de inactividad
- Puedes reactivarlo desde GitHub en cualquier momento

## 🛠️ Tips y Trucos

### Acceso Rápido a Puertos
Crea un atajo de teclado personalizado:
1. `Ctrl+Shift+P` → "Preferences: Open Keyboard Shortcuts"
2. Busca "Ports: Focus on Ports View"
3. Asigna un atajo (ej: `Ctrl+Alt+P`)

### Terminal Dividida
Para ejecutar frontend y backend simultáneamente:
1. Abre una terminal: `Ctrl+`` (acento grave)
2. Haz clic en el ícono "+" para dividir la terminal
3. En una terminal: `cd apps/frontend && pnpm dev`
4. En la otra: `cd apps/backend && pnpm dev`

### Previsualización en Panel Lateral
Para tener el código y la vista previa lado a lado:
1. Abre la vista previa en el editor
2. Arrastra el panel a un lado de la pantalla
3. ¡Desarrollo en tiempo real!

## 🐛 Solución de Problemas

### El puerto no aparece en el panel PORTS
1. Espera unos segundos después de ejecutar `pnpm dev`
2. Si no aparece, ve a PORTS → clic en "Forward a Port"
3. Ingresa `3000` manualmente

### La aplicación no carga
1. Verifica que el servidor esté corriendo en la terminal
2. Revisa si hay errores en la terminal
3. Intenta detener el servidor (Ctrl+C) y reiniciarlo

### Cambios no se reflejan
1. Verifica que el HMR esté activo (debería aparecer "[vite] connected" en la consola)
2. Recarga la página manualmente (F5)
3. Si persiste, reinicia el servidor de desarrollo

### Puerto ya en uso
Si el puerto 3000 está ocupado:
```bash
# Encuentra el proceso usando el puerto
lsof -ti:3000

# Mátalo
kill -9 $(lsof -ti:3000)

# Reinicia el servidor
pnpm dev
```

## 📚 Recursos Adicionales

- [Documentación oficial de Codespaces](https://docs.github.com/en/codespaces)
- [VSCode en Codespaces](https://code.visualstudio.com/docs/remote/codespaces)
- [Vite Documentation](https://vitejs.dev/)

## ❓ Preguntas Frecuentes

**P: ¿Puedo usar Codespaces gratis?**  
R: Sí, GitHub ofrece 120 horas núcleo/mes gratis. Para este proyecto, eso es aproximadamente 60 horas de uso mensual.

**P: ¿Mis cambios se guardan?**  
R: Sí, todos los cambios se guardan automáticamente en el Codespace. Recuerda hacer commit y push para subirlos al repositorio.

**P: ¿Puedo trabajar offline?**  
R: No, Codespaces requiere conexión a internet ya que se ejecuta en la nube.

**P: ¿Cómo comparto mi vista previa con otros?**  
R: Cambia la visibilidad del puerto a "Public" en el panel PORTS y comparte la URL.

**P: ¿Puedo conectarme desde mi VSCode local?**  
R: Sí, con la extensión "GitHub Codespaces" puedes conectarte desde VSCode desktop.

---

**¡Feliz desarrollo! 🎉**

Si tienes problemas o sugerencias para mejorar esta guía, por favor abre un issue en GitHub.
