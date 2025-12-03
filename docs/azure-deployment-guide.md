# FleetMan - Guía de Deployment con Azure Container Apps

Esta guía te llevará paso a paso desde cero hasta tener tu backend desplegado automáticamente con CI/CD.

---

## 📋 Pre-requisitos

- [ ] Azure CLI instalado ([Descargar](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli))
- [ ] Docker Desktop instalado y corriendo ([Descargar](https://www.docker.com/products/docker-desktop))
- [ ] Cuenta de Azure activa
- [ ] Repositorio GitHub con acceso de administrador
- [ ] MongoDB URI (MongoDB Atlas o Cosmos DB)

---

## 🚀 PARTE 1: Setup Inicial de Azure

### Step 1: Login a Azure

```bash
# Login
az login

# Verificar suscripción activa
az account show

# (Opcional) Si tienes múltiples suscripciones, selecciona la correcta
az account list --output table
az account set --subscription "TU_SUBSCRIPTION_ID"
```

### Step 2: Crear Resource Group

```bash
# Crear resource group (ajusta la location si prefieres otra región)
az group create \
  --name fleetman-rg \
  --location eastus

# Verificar
az group show --name fleetman-rg
```

### Step 3: Crear Azure Container Registry (ACR)

```bash
# Crear ACR (el nombre debe ser único globalmente, solo letras y números)
az acr create \
  --name fleetmanregistry \
  --resource-group fleetman-rg \
  --sku Basic \
  --admin-enabled true

# Verificar
az acr show --name fleetmanregistry --query loginServer --output tsv
# Deberías ver: fleetmanregistry.azurecr.io
```

### Step 4: Obtener credenciales del ACR

```bash
# Obtener username
az acr credential show --name fleetmanregistry --query username --output tsv

# Obtener password
az acr credential show --name fleetmanregistry --query passwords[0].value --output tsv

# GUARDA ESTOS VALORES - los necesitarás después
```

### Step 5: Crear Container App Environment

```bash
# Crear environment
az containerapp env create \
  --name fleetman-env \
  --resource-group fleetman-rg \
  --location eastus

# Verificar (puede tardar 2-3 minutos)
az containerapp env show \
  --name fleetman-env \
  --resource-group fleetman-rg \
  --query "provisioningState"
# Debe decir: "Succeeded"
```

---

## 🔑 PARTE 2: Configurar GitHub Secrets

### Step 6: Crear Service Principal de Azure

```bash
# Obtener tu subscription ID
SUBSCRIPTION_ID=$(az account show --query id --output tsv)

# Crear service principal con rol Contributor
az ad sp create-for-rbac \
  --name "fleetman-github-deploy" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/fleetman-rg \
  --sdk-auth

# Esto te dará un JSON como este (CÓPIALO COMPLETO):
# {
#   "clientId": "...",
#   "clientSecret": "...",
#   "subscriptionId": "...",
#   "tenantId": "...",
#   ...
# }
```

### Step 7: Agregar Secrets en GitHub

Ve a tu repositorio en GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. Agrega el siguiente secret:

| Name | Value |
|------|-------|
| `AZURE_CREDENTIALS` | El JSON completo del paso anterior |

> 💡 **Tip:** Copia el JSON COMPLETO exactamente como aparece, sin modificar nada.

---

## 🐳 PARTE 3: Primer Deploy (Manual)

Antes de confiar en el CI/CD, vamos a hacer un deploy manual para verificar que todo funciona.

### Step 8: Test de Docker Local

```bash
# Navegar a la raíz del proyecto
cd c:\MarkMed\Programming\FleetMan\FleetMan

# Build local de la imagen
docker build -t fleetman-backend:test .

# Esto puede tardar 5-10 minutos la primera vez
# Verifica que complete sin errores
```

### Step 9: Test Local del Contenedor

```bash
# Run local (ajusta el MONGODB_URI a tu conexión real)
docker run -p 3000:80 \
  -e MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/fleetman" \
  -e JWT_SECRET="test-secret-key-minimum-32-chars" \
  -e NODE_ENV="production" \
  -e CORS_ORIGIN="*" \
  fleetman-backend:test

# Deberías ver en consola:
# 🚀 FleetMan Backend running on port 80
```

### Step 10: Verificar en Localhost

Abre otra terminal y prueba:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api

# Si ambos responden OK, presiona Ctrl+C en la terminal del docker run
```

### Step 11: Push Manual a ACR

```bash
# Login al registry
az acr login --name fleetmanregistry

# Tag la imagen
docker tag fleetman-backend:test fleetmanregistry.azurecr.io/fleetman-backend:manual-v1

# Push
docker push fleetmanregistry.azurecr.io/fleetman-backend:manual-v1

# Verificar que la imagen esté en ACR
az acr repository list --name fleetmanregistry --output table
```

### Step 12: Crear Container App

```bash
# Obtener credenciales de ACR
ACR_USERNAME=$(az acr credential show -n fleetmanregistry --query username -o tsv)
ACR_PASSWORD=$(az acr credential show -n fleetmanregistry --query passwords[0].value -o tsv)

# Crear Container App
az containerapp create \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --environment fleetman-env \
  --image fleetmanregistry.azurecr.io/fleetman-backend:manual-v1 \
  --target-port 80 \
  --ingress external \
  --registry-server fleetmanregistry.azurecr.io \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars \
    NODE_ENV=production \
    PORT=80 \
  --secrets \
    mongodb-uri="TU_MONGODB_CONNECTION_STRING" \
    jwt-secret="TU_JWT_SECRET_MINIMO_32_CARACTERES" \
  --query properties.configuration.ingress.fqdn
```

> ⚠️ **IMPORTANTE:** Reemplaza `TU_MONGODB_CONNECTION_STRING` y `TU_JWT_SECRET_MINIMO_32_CARACTERES` con tus valores reales.

### Step 13: Configurar Variables de Entorno

```bash
# Obtener el nombre de tu Container App
APP_NAME="fleetman-backend"

# Actualizar secrets
az containerapp secret set \
  --name $APP_NAME \
  --resource-group fleetman-rg \
  --secrets \
    mongodb-uri="TU_MONGODB_URI_REAL" \
    jwt-secret="TU_JWT_SECRET_REAL"

# Actualizar env vars para usar los secrets
az containerapp update \
  --name $APP_NAME \
  --resource-group fleetman-rg \
  --set-env-vars \
    NODE_ENV=production \
    PORT=80 \
    MONGODB_URI=secretref:mongodb-uri \
    JWT_SECRET=secretref:jwt-secret \
    CORS_ORIGIN="https://tu-frontend.com,http://localhost:5173"
```

### Step 14: Obtener URL y Verificar

```bash
# Obtener URL del Container App
APP_URL=$(az containerapp show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --query properties.configuration.ingress.fqdn -o tsv)

echo "🌐 Tu backend está en: https://$APP_URL"

# Probar health check
curl https://$APP_URL/health

# Probar API
curl https://$APP_URL/api
```

---

## 🔄 PARTE 4: Activar CI/CD Automático

### Step 15: Commit de los Archivos

```bash
cd c:\MarkMed\Programming\FleetMan\FleetMan

# Verificar estado
git status

# Deberías ver:
# - Dockerfile
# - .dockerignore
# - .github/workflows/azure-container-deploy.yml

# Add archivos
git add Dockerfile .dockerignore .github/workflows/azure-container-deploy.yml

# Commit
git commit -m "feat: Add Docker and Azure Container Apps CI/CD"

# Push a la branch dev
git push origin dev
```

### Step 16: Verificar GitHub Actions

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Deberías ver un workflow corriendo: **"Deploy to Azure Container Apps"**
4. Click en el workflow para ver los logs en tiempo real

### Step 17: Monitorear el Deploy

El workflow hará:
1. ✅ Build de la imagen Docker
2. ✅ Push a ACR con tag del commit SHA
3. ✅ Update del Container App
4. ✅ Health check automático
5. ✅ Resumen del deployment

Si todo está verde ✅, ¡tu CI/CD está funcionando!

---

## 🧪 PARTE 5: Testing de CI/CD

### Step 18: Hacer un Cambio de Prueba

```bash
# Editar un archivo del backend (ejemplo)
# Abre apps/backend/src/main.ts y cambia la línea del console.log

# Por ejemplo, cambia:
# console.log(`🚀 FleetMan Backend running on port ${PORT}`)
# Por:
# console.log(`🚀 FleetMan Backend v2.0 running on port ${PORT}`)

# Commit y push
git add apps/backend/src/main.ts
git commit -m "test: Update startup message"
git push origin dev
```

### Step 19: Verificar Deploy Automático

1. GitHub Actions debería detectar el push
2. En 5-8 minutos deberías tener una nueva versión desplegada
3. Verifica revisando los logs del Container App

```bash
# Ver logs en tiempo real
az containerapp logs show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --follow
```

---

## 📊 PARTE 6: Migración desde App Service

### Step 20: Verificar que Container App Funciona

Antes de tocar el App Service, asegúrate de que todo funciona:

- [ ] Health check responde
- [ ] API responde
- [ ] MongoDB se conecta correctamente
- [ ] JWT funciona
- [ ] Frontend puede conectarse (actualiza la URL en tu frontend)

### Step 21: Actualizar Frontend

En tu aplicación frontend, cambia la URL del backend:

```javascript
// Cambiar de:
const API_URL = "https://tu-app-service.azurewebsites.net"

// A:
const API_URL = "https://fleetman-backend.xxx.eastus.azurecontainerapps.io"
```

### Step 22: Testing Completo

Prueba todas las funcionalidades críticas:
- Login
- CRUD de máquinas
- QuickCheck
- Notifications
- etc.

### Step 23: Detener App Service (Opcional)

Una vez que estés 100% seguro de que Container Apps funciona:

```bash
# Opción 1: Solo detener (no eliminar)
az webapp stop \
  --name TU_APP_SERVICE_NAME \
  --resource-group TU_RESOURCE_GROUP

# Opción 2: Eliminar completamente (CUIDADO!)
# Solo hazlo después de 1-2 semanas de que Container App funcione bien
az webapp delete \
  --name TU_APP_SERVICE_NAME \
  --resource-group TU_RESOURCE_GROUP

# También puedes eliminar el App Service Plan si no lo usas para nada más
az appservice plan delete \
  --name TU_APP_SERVICE_PLAN \
  --resource-group TU_RESOURCE_GROUP
```

---

## 🔧 PARTE 7: Comandos Útiles

### Ver Logs

```bash
# Logs en tiempo real
az containerapp logs show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --follow

# Últimas 100 líneas
az containerapp logs show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --tail 100
```

### Reiniciar Container App

```bash
az containerapp revision restart \
  --name fleetman-backend \
  --resource-group fleetman-rg
```

### Ver Revisiones (Versiones)

```bash
az containerapp revision list \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --output table
```

### Rollback a Versión Anterior

```bash
# Listar revisiones
az containerapp revision list \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --output table

# Activar revisión anterior
az containerapp revision activate \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --revision "fleetman-backend--XXXXX"
```

### Actualizar Variables de Entorno

```bash
az containerapp update \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --set-env-vars \
    NUEVA_VARIABLE="valor"
```

### Ver Métricas

```bash
# CPU y Memoria
az containerapp show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --query "properties.template.containers[0].resources"
```

---

## 🐛 Troubleshooting

### Problema: Container no inicia

```bash
# Ver logs de inicio
az containerapp logs show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --tail 200

# Verificar que las variables de entorno estén configuradas
az containerapp show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --query "properties.template.containers[0].env"
```

### Problema: GitHub Actions falla

1. Verifica que `AZURE_CREDENTIALS` esté correcto en GitHub Secrets
2. Verifica que el Service Principal tenga permisos en el Resource Group
3. Revisa los logs del workflow en detalle

### Problema: Health Check falla

```bash
# Verificar que el puerto 80 esté expuesto
az containerapp show \
  --name fleetman-backend \
  --resource-group fleetman-rg \
  --query "properties.configuration.ingress"

# Probar health check manualmente
curl https://TU_URL/health -v
```

### Problema: No se puede conectar a MongoDB

```bash
# Verificar que el secret esté configurado
az containerapp secret list \
  --name fleetman-backend \
  --resource-group fleetman-rg

# Verificar formato del MONGODB_URI
# Debe ser: mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true
```

---

## 💰 Costos Estimados

| Recurso | SKU | Costo/mes |
|---------|-----|-----------|
| Container Registry (Basic) | Basic | ~$5 |
| Container App Environment | Consumo | ~$0 (base) |
| Container App | 1 vCPU, 2GB RAM | ~$15-25 |
| Bandwidth | Variable | ~$5 |
| **TOTAL** | - | **~$25-35/mes** |

> 💡 **Tip:** Container Apps escala a 0 si no hay tráfico, lo que puede reducir costos significativamente.

---

## ✅ Checklist Final

- [ ] ACR creado y funcionando
- [ ] Container App Environment creado
- [ ] Container App desplegado y respondiendo
- [ ] GitHub Actions configurado con secretos
- [ ] CI/CD funcionando automáticamente en commits a `dev`
- [ ] Variables de entorno configuradas (MongoDB, JWT, CORS)
- [ ] Health check funcionando
- [ ] Frontend actualizado con nueva URL
- [ ] App Service detenido (opcional)

---

## 📚 Referencias

- [Azure Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [Azure Container Registry Docs](https://learn.microsoft.com/en-us/azure/container-registry/)
- [GitHub Actions Azure Login](https://github.com/Azure/login)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

---

## 🆘 Necesitas Ayuda?

Si encuentras problemas, revisa:
1. Los logs del Container App
2. Los logs de GitHub Actions
3. La configuración de secretos y variables de entorno
4. Que tu MongoDB URI sea accesible desde Azure

¡Éxito con el deployment! 🚀
