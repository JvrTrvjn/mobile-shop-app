# Mobile Shop App

## Descripción
Mini-aplicación para comprar dispositivos móviles desarrollada con Preact.

## Tecnologías
- Preact
- Vite
- CSS puro
- Context API (para gestión de estado)

## Arquitectura del proyecto
La aplicación sigue un patrón de arquitectura basado en componentes con separación clara de responsabilidades:
- **Components**: Componentes UI reutilizables
- **Pages**: Vistas principales de la aplicación (PLP y PDP)
- **Services**: Lógica de negocio y comunicación con API
- **Hooks**: Custom hooks para lógica reutilizable
- **Utils**: Funciones de utilidad
- **Context**: Gestión de estado global

## Instalación y uso
```bash
# Instalación de dependencias
npm install

# Desarrollo
npm start

# Producción
npm run build

# Pruebas
npm test

# Linting
npm run lint
```

## Estrategia de caché
La aplicación implementa un sistema de caché en cliente para optimizar las peticiones al API:
- Almacenamiento en localStorage con expiración de 1 hora
- Validación automática de datos obsoletos

## Estructura del proyecto
(Esta sección se actualizará a medida que avance el desarrollo)
