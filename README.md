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

### 3. Configuración de Email System (Backend)

Para desarrollo local del backend con capacidades de email (Sprint #15):

```bash
# Navegar al backend
cd apps/backend

# Copiar el template
cp .env.example .env

# Editar y agregar credenciales de Mailtrap
# SMTP_HOST=smtp.mailtrap.io
# SMTP_USER=tu_usuario_mailtrap
# SMTP_PASS=tu_password_mailtrap
```

**Para Azure Deployment:** Ver [docs/deployment/azure-email-config-manual.md](docs/deployment/azure-email-config-manual.md)

## Instalación

```bash
# Instrucciones de instalación vendrán aquí
```

## Uso

```bash
# Instrucciones de uso vendrán aquí
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
