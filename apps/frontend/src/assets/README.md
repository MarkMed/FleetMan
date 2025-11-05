# Assets Directory

## Propósito
Contiene todos los recursos estáticos de la aplicación como iconos, imágenes, fuentes y otros archivos multimedia. Estos assets son procesados por Vite y optimizados para producción.

## Estructura de Carpetas

```
assets/
├── icons/                # Iconos de la aplicación
│   ├── app/             # Iconos de la app (logo, favicon)
│   ├── ui/              # Iconos de interfaz
│   ├── machines/        # Iconos específicos de máquinas
│   └── status/          # Iconos de estados y alertas
├── images/              # Imágenes y fotografías
│   ├── backgrounds/     # Fondos e imágenes de fondo
│   ├── placeholders/    # Imágenes placeholder
│   ├── branding/        # Logos y elementos de marca
│   └── illustrations/   # Ilustraciones y gráficos
├── fonts/               # Fuentes personalizadas (si las hay)
├── videos/              # Videos y animaciones
├── documents/           # Documentos estáticos (PDFs, etc)
└── sounds/              # Sonidos y notificaciones de audio
```

## Categorías de Assets

### 1. **Icons** - Iconografía
**Propósito**: Iconos para la interfaz de usuario
**Formatos recomendados**: SVG (preferible), PNG para iconos complejos
**Tamaños estándar**: 16x16, 24x24, 32x32, 48x48, 64x64 píxeles

**Subcarpetas**:
```
icons/
├── app/
│   ├── logo.svg         # Logo principal de FleetMan
│   ├── logo-mini.svg    # Logo compacto para espacios pequeños
│   ├── favicon.ico      # Favicon del sitio
│   └── app-icon.png     # Icono de la aplicación (PWA)
├── ui/
│   ├── arrow-left.svg   # Navegación
│   ├── arrow-right.svg
│   ├── chevron-down.svg
│   ├── close.svg        # Acciones
│   ├── edit.svg
│   ├── delete.svg
│   ├── save.svg
│   ├── search.svg       # Funcionalidades
│   ├── filter.svg
│   ├── export.svg
│   ├── import.svg
│   ├── menu.svg         # Navegación
│   ├── home.svg
│   ├── dashboard.svg
│   ├── settings.svg
│   ├── user.svg         # Usuario
│   ├── logout.svg
│   └── notifications.svg
├── machines/
│   ├── excavator.svg    # Tipos de máquinas
│   ├── bulldozer.svg
│   ├── crane.svg
│   ├── truck.svg
│   ├── compactor.svg
│   ├── loader.svg
│   └── generic-machine.svg
└── status/
    ├── success.svg      # Estados
    ├── warning.svg
    ├── error.svg
    ├── info.svg
    ├── active.svg       # Estados de máquinas
    ├── maintenance.svg
    ├── offline.svg
    └── critical.svg
```

### 2. **Images** - Imágenes y Fotografías
**Propósito**: Imágenes para UI, fondos y contenido visual
**Formatos recomendados**: WebP (preferible), PNG, JPEG
**Optimización**: Múltiples tamaños para responsive design

**Subcarpetas**:
```
images/
├── backgrounds/
│   ├── auth-bg.webp     # Fondo para páginas de autenticación
│   ├── dashboard-bg.webp # Fondo sutil para dashboard
│   └── hero-bg.webp     # Imagen hero para landing
├── placeholders/
│   ├── machine-placeholder.svg # Placeholder para máquinas sin imagen
│   ├── user-avatar.svg  # Avatar por defecto de usuario
│   ├── no-data.svg      # Ilustración para estados vacíos
│   └── loading.svg      # Animación de carga
├── branding/
│   ├── fleetman-logo-full.svg # Logo completo con texto
│   ├── fleetman-logo-white.svg # Logo en blanco
│   ├── company-banner.png # Banner de la empresa
│   └── watermark.png    # Marca de agua para reportes
└── illustrations/
    ├── empty-state.svg  # Estados vacíos
    ├── error-404.svg    # Error 404
    ├── maintenance.svg  # Ilustración de mantenimiento
    ├── success.svg      # Operaciones exitosas
    └── welcome.svg      # Pantalla de bienvenida
```

### 3. **Fonts** - Fuentes Personalizadas
**Propósito**: Fuentes custom para branding (si se necesitan)
**Formatos**: WOFF2 (preferible), WOFF, TTF como fallback

```
fonts/
├── brand/
│   ├── BrandFont-Regular.woff2
│   ├── BrandFont-Bold.woff2
│   └── BrandFont-Light.woff2
└── icons/
    └── FleetManIcons.woff2 # Font de iconos custom (si se crea)
```

### 4. **Videos** - Contenido Multimedia
**Propósito**: Videos para onboarding, tutoriales o demos
**Formatos**: MP4 (H.264), WebM como alternativa

```
videos/
├── onboarding/
│   ├── intro.mp4        # Video de introducción
│   └── tutorial.mp4     # Tutorial básico
└── demos/
    ├── quick-check.mp4  # Demo de chequeo rápido
    └── maintenance.mp4  # Demo de mantenimiento
```

### 5. **Documents** - Documentos Estáticos
**Propósito**: Documentos descargables y recursos
**Formatos**: PDF, DOC(X) para templates

```
documents/
├── templates/
│   ├── maintenance-checklist.pdf
│   ├── quick-check-template.pdf
│   └── incident-report.pdf
├── manuals/
│   ├── user-manual.pdf
│   └── admin-guide.pdf
└── legal/
    ├── terms-of-service.pdf
    ├── privacy-policy.pdf
    └── data-protection.pdf
```

### 6. **Sounds** - Audio y Notificaciones
**Propósito**: Sonidos para notificaciones y feedback
**Formatos**: MP3, OGG

```
sounds/
├── notifications/
│   ├── success.mp3      # Sonido de éxito
│   ├── warning.mp3      # Sonido de advertencia
│   ├── error.mp3        # Sonido de error
│   └── info.mp3         # Sonido informativo
└── alerts/
    ├── critical-alert.mp3 # Alerta crítica
    └── maintenance-due.mp3 # Mantenimiento vencido
```

## Optimización de Assets

### 1. **Imágenes**
```typescript
// Vite automáticamente optimiza imágenes
import machineImage from '@/assets/images/machines/excavator.webp';
import machineImageSmall from '@/assets/images/machines/excavator.webp?w=300';
import machineImageLarge from '@/assets/images/machines/excavator.webp?w=800';

// Uso responsive
<picture>
  <source media="(max-width: 640px)" srcSet={machineImageSmall} />
  <source media="(min-width: 641px)" srcSet={machineImageLarge} />
  <img src={machineImage} alt="Excavadora" />
</picture>
```

### 2. **Iconos SVG**
```typescript
// Import directo de SVG
import LogoIcon from '@/assets/icons/app/logo.svg?react';
import DeleteIcon from '@/assets/icons/ui/delete.svg?react';

// Uso como componente React
<LogoIcon className="w-8 h-8 text-primary" />
<DeleteIcon className="w-4 h-4 text-destructive" />
```

### 3. **Lazy Loading**
```typescript
// Para imágenes grandes o contenido below-the-fold
const HeroImage = lazy(() => import('@/assets/images/backgrounds/hero-bg.webp'));

// En componente
<Suspense fallback={<ImageSkeleton />}>
  <img src={HeroImage} alt="Hero" loading="lazy" />
</Suspense>
```

## Naming Conventions

### Archivos
- **Kebab-case**: `machine-placeholder.svg`
- **Descriptivos**: `excavator-icon.svg` mejor que `icon1.svg`
- **Incluir variantes**: `logo-white.svg`, `logo-dark.svg`

### Organización por Tamaño
```
icons/ui/
├── edit.svg           # Tamaño estándar (24x24)
├── edit-small.svg     # Versión pequeña (16x16)
└── edit-large.svg     # Versión grande (32x32)
```

### Versionado
```
images/branding/
├── logo-v2.svg        # Versión actual
├── logo-v1.svg        # Versión anterior (para backward compatibility)
└── logo-legacy.svg    # Versión legacy
```

## Asset Management

### 1. **Imports en TypeScript**
```typescript
// Declaración de tipos para assets
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}
```

### 2. **Asset Constants**
```typescript
// src/constants/assets.ts
export const ASSETS = {
  LOGOS: {
    MAIN: '/src/assets/icons/app/logo.svg',
    MINI: '/src/assets/icons/app/logo-mini.svg',
    WHITE: '/src/assets/branding/fleetman-logo-white.svg'
  },
  PLACEHOLDERS: {
    MACHINE: '/src/assets/images/placeholders/machine-placeholder.svg',
    USER: '/src/assets/images/placeholders/user-avatar.svg',
    NO_DATA: '/src/assets/images/placeholders/no-data.svg'
  },
  SOUNDS: {
    SUCCESS: '/src/assets/sounds/notifications/success.mp3',
    WARNING: '/src/assets/sounds/notifications/warning.mp3',
    ERROR: '/src/assets/sounds/notifications/error.mp3'
  }
} as const;
```

### 3. **Asset Helper Hook**
```typescript
// Hook para manejar assets dinámicamente
export const useAsset = (path: string) => {
  const [assetUrl, setAssetUrl] = useState<string>('');
  
  useEffect(() => {
    import(/* @vite-ignore */ path)
      .then(module => setAssetUrl(module.default))
      .catch(error => console.error('Error loading asset:', error));
  }, [path]);
  
  return assetUrl;
};

// Uso
const machineIcon = useAsset(`/src/assets/icons/machines/${machineType}.svg`);
```

## Performance Best Practices

### 1. **Formato y Compresión**
- **SVG**: Para iconos y gráficos simples
- **WebP**: Para imágenes fotográficas (fallback a PNG/JPEG)
- **AVIF**: Para máxima compresión (cuando sea soportado)

### 2. **Lazy Loading**
- Imágenes below-the-fold
- Contenido no crítico
- Assets grandes o multimedia

### 3. **Critical Assets**
- Logo y iconos principales en bundle inicial
- Sprites para iconos muy usados
- Inline SVGs para iconos críticos

### 4. **Caching Strategy**
```typescript
// Vite configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|otf/i.test(extType)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  }
});
```

## Accessibility

### 1. **Alt Text para Imágenes**
```typescript
// Siempre proporcionar alt text descriptivo
<img 
  src={machineImage} 
  alt="Excavadora Caterpillar modelo 320D en operación"
  loading="lazy"
/>

// Para imágenes decorativas
<img 
  src={decorativeImage} 
  alt=""
  role="presentation"
/>
```

### 2. **SVG Accessibility**
```svg
<!-- SVG con título y descripción -->
<svg role="img" aria-labelledby="title desc">
  <title id="title">Icono de Excavadora</title>
  <desc id="desc">Representa una máquina excavadora</desc>
  <!-- contenido del SVG -->
</svg>
```

### 3. **Iconos Informativos**
```typescript
// Iconos que transmiten información deben tener texto alternativo
<span className="flex items-center">
  <WarningIcon className="w-4 h-4 text-warning" aria-hidden="true" />
  <span className="sr-only">Advertencia:</span>
  Mantenimiento pendiente
</span>
```

## Versionado y Deployments

### 1. **Asset Versioning**
- Hash automático por Vite para cache busting
- Mantener versiones anteriores para rollbacks
- Documentar cambios significativos en assets

### 2. **CDN Strategy**
```typescript
// Configuración para CDN en producción
export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? 'https://cdn.fleetman.com/assets/' 
    : '/',
});
```

## Testing Assets

### 1. **Asset Tests**
```typescript
describe('Asset Loading', () => {
  test('should load main logo', async () => {
    const logoModule = await import('@/assets/icons/app/logo.svg');
    expect(logoModule.default).toBeDefined();
  });
  
  test('should have alt text for all images', () => {
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });
});
```

### 2. **Asset Optimization Tests**
```typescript
// Test que verifica que los assets están optimizados
test('images should be under size limit', () => {
  // Verificar que las imágenes no excedan cierto tamaño
  // Esto se haría típicamente en el build process
});
```