# API

Este directorio contiene las definiciones y documentación de la API externa del sistema.

## Propósito
- Documentar los endpoints públicos de la API
- Versionado de la API
- Definir contratos de interfaces externas

## Archivos típicos
- `v1/` - Versión 1 de la API
- `v2/` - Versión 2 de la API
- `openapi.yaml` - Especificación OpenAPI/Swagger
- `api-docs.md` - Documentación adicional de la API
- `postman/` - Colecciones de Postman para testing

## Estructura recomendada
```
api/
├── v1/
│   ├── openapi.yaml
│   └── schemas/
├── v2/
│   ├── openapi.yaml
│   └── schemas/
└── README.md
```