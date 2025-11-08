# FleetMan

Sistema de gestión de flotas de vehículos.

## Configuración del entorno

### 1. Variables de entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

### 2. Token de GitHub

Para ciertas funcionalidades, necesitarás un token de GitHub con permisos de repositorio:

1. Ve a [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Genera un nuevo token con scope "repo"
3. Copia el token en tu archivo `.env`:

```
GITHUB_TOKEN=tu_token_aqui
```

⚠️ **IMPORTANTE**: Nunca subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

## 🚀 Inicio Rápido

### Opción 1: GitHub Codespaces (Recomendado)

La forma más rápida de empezar a desarrollar es usando GitHub Codespaces.

📖 **[Ver guía completa de Codespaces](./docs/CODESPACES.md)** - Guía detallada con troubleshooting y tips.

**Resumen rápido:**

1. **Crear un Codespace:**
   - Haz clic en el botón "Code" en GitHub
   - Selecciona la pestaña "Codespaces"
   - Haz clic en "Create codespace on main"

2. **Acceder al Frontend:**
   - El Codespace instalará automáticamente las dependencias
   - Ejecuta el comando: `cd apps/frontend && pnpm dev`
   - Cuando el servidor esté listo, verás una notificación para abrir el navegador
   - También puedes hacer clic en el puerto 3000 en la pestaña "PORTS" de VSCode
   - O presiona `Ctrl+Shift+P` y busca "Ports: Focus on Ports View"

3. **Visualizar en VSCode:**
   - VSCode mostrará una notificación para "Abrir en el navegador" automáticamente
   - También puedes ver los puertos en la pestaña "PORTS" (parte inferior de VSCode)
   - Haz clic derecho en el puerto 3000 y selecciona "Open in Browser" o "Preview in Editor"

### Opción 2: Instalación Local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar el servidor de desarrollo del frontend
cd apps/frontend
pnpm dev

# El frontend estará disponible en http://localhost:3000
```

## Uso

### Desarrollo del Frontend

```bash
# Desde la raíz del proyecto
cd apps/frontend

# Servidor de desarrollo
pnpm dev

# Compilar para producción
pnpm build

# Vista previa de la compilación
pnpm preview

# Verificación de tipos
pnpm typecheck

# Linting
pnpm lint
```

### Desarrollo del Backend

```bash
# Desde la raíz del proyecto
cd apps/backend

# Servidor de desarrollo
pnpm dev

# El backend estará disponible en http://localhost:5000
```

### Desarrollo Completo (Frontend + Backend)

```bash
# Desde la raíz del proyecto
pnpm dev

# Esto iniciará tanto el frontend como el backend en paralelo
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
