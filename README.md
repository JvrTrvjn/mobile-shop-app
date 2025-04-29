# Mobile Shop App

## Descripción
Mini-aplicación para comprar dispositivos móviles desarrollada con Preact.

## Tecnologías
- Preact
- Vite
- CSS puro
- Context API (para gestión de estado)
- i18next (internacionalización)

## Arquitectura del proyecto
La aplicación sigue un patrón de arquitectura basado en componentes con separación clara de responsabilidades:
- **Components**: Componentes UI reutilizables
- **Pages**: Vistas principales de la aplicación (PLP y PDP)
- **Services**: Lógica de negocio y comunicación con API
- **Hooks**: Custom hooks para lógica reutilizable
- **Utils**: Funciones de utilidad
- **Context**: Gestión de estado global
- **Locales**: Archivos de traducción para internacionalización

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

## Internacionalización (i18n)
La aplicación está completamente internacionalizada y soporta múltiples idiomas:

- **Idiomas soportados**: Español (es) e Inglés (en)
- **Selector de idioma**: Disponible en la barra de navegación
- **Persistencia**: La preferencia de idioma se guarda en localStorage
- **Detección automática**: Se detecta automáticamente el idioma del navegador

Para añadir un nuevo idioma:
1. Crear un nuevo archivo JSON en `/src/locales/`
2. Añadir el nuevo idioma a la configuración en `/src/config/i18n.js`

## Estructura del proyecto
(Esta sección se actualizará a medida que avance el desarrollo)
