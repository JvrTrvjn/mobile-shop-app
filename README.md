# 📱 Mobile Shop App

<p align="center">
  <a href="README_EN.md">English</a> |
  <a href="README.md">Español</a>
</p>

> Aplicación web responsive de página única (SPA) desarrollada con Preact para navegar y comprar dispositivos móviles.

## 📋 Descripción General

Esta mini-aplicación implementa una tienda de dispositivos móviles siguiendo los requisitos específicos de la prueba técnica. La aplicación cuenta con:

- **Vista principal (PLP)** - Listado de productos con búsqueda en tiempo real
- **Vista de detalle (PDP)** - Información completa del producto y opciones de compra

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| **📱 PLP** | Página de Listado de Productos con diseño de cuadrícula adaptable |
| **🔎 PDP** | Página de Detalle de Producto con especificaciones completas |
| **🔍 Búsqueda** | Filtrado en tiempo real por marca y modelo con entrada debounced |
| **🌐 Multilingüe** | Soporte completo para español e inglés con detección automática |
| **🛒 Carrito** | Añade productos con selección de color y almacenamiento |
| **💾 Caché** | Sistema de caché con expiración de 1 hora para reducir llamadas a API |
| **📱 Responsive** | Diseño adaptable a cualquier dispositivo |

## 🛠️ Stack Tecnológico

- **Preact**: Framework ligero compatible con React
- **Preact-iso**: Enrutador para implementar SPA
- **Vite**: Herramienta de construcción rápida
- **RxJS**: Para gestión de eventos y búsqueda optimizada
- **i18next**: Internacionalización completa
- **Context API**: Gestión de estado global
- **Vitest**: Framework de testing
- **ESLint/Prettier**: Herramientas de calidad de código

## 📂 Estructura del Proyecto

```
mobile-shop-app/
├── public/                 # Activos estáticos
├── scripts/                # Scripts de build y utilidades
├── src/
│   ├── assets/             # Imágenes y otros recursos estáticos
│   ├── components/         # Componentes UI reutilizables
│   ├── config/             # Archivos de configuración
│   ├── context/            # Proveedores de contexto React
│   ├── locales/            # Archivos de traducción
│   ├── pages/              # Componentes principales de página
│   ├── services/           # Servicios de API y datos
│   ├── utils/              # Funciones de utilidad
│   ├── index.jsx           # Punto de entrada de la aplicación
│   └── style.css           # Estilos globales
├── tests/                  # Archivos de test
├── .eslintrc.json          # Configuración de ESLint
├── .prettierrc             # Configuración de Prettier
├── package.json            # Dependencias y scripts
└── vite.config.js          # Configuración de Vite
```

## 🚀 Comenzando

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn

### Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/JvrTrvjn/mobile-shop-app.git
cd mobile-shop-app
```

2. Instalar dependencias
```bash
npm install
```

3. Iniciar el servidor de desarrollo
```bash
npm start
```

4. Abrir el navegador y navegar a `http://localhost:5173`

## 📜 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Ejecuta la aplicación en modo desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm test` | Ejecuta la suite de tests |
| `npm run lint` | Ejecuta ESLint para verificar la calidad del código |

## 🔍 Detalles de Implementación

### 💾 Estrategia de Caché

La aplicación implementa un mecanismo de caché del lado del cliente para las respuestas de la API con un período de expiración de 1 hora. Esto reduce las peticiones de red innecesarias y mejora la experiencia del usuario mediante:

- **Almacenamiento** de datos en localStorage con marcas de tiempo
- **Validación** de la expiración antes de realizar nuevas peticiones
- **Actualización** automática de entradas de caché obsoletas

### 🌐 Internacionalización

La aplicación soporta múltiples idiomas a través de:

- **Detección automática** de idioma basada en la configuración del navegador
- **Selector de idioma** disponible en la interfaz
- **Persistencia** de la selección de idioma en localStorage
- **Cobertura completa** de traducción para todos los elementos de la UI

Para añadir un nuevo idioma:
1. Crear un nuevo archivo JSON en `/src/locales/`
2. Añadir el nuevo idioma a la configuración en `/src/config/i18n.js`

### 🔄 Gestión de Estado

En lugar de utilizar una librería externa de gestión de estado, la aplicación implementa proveedores de contexto personalizados para:

- **CartContext**: Gestión del estado del carrito con patrón reducer
- **I18nContext**: Internacionalización con cambio de idioma
- **ToastContext**: Notificaciones toast para feedback del usuario

### ⚡ Optimizaciones de Rendimiento

- **Búsqueda debounced** usando RxJS para prevenir re-renderizados excesivos
- **Carga diferida** de detalles de productos
- **Memoización** de componentes que se renderizan frecuentemente
- **Caché** del lado del cliente para reducir llamadas a la API

## 🔌 Integración con API

La aplicación se integra con los siguientes endpoints:

- `GET /api/product` - Recupera la lista de todos los productos
- `GET /api/product/:id` - Recupera información detallada de un producto específico
- `POST /api/cart` - Añade un producto al carrito de compras


## 🔮 Áreas de Desarrollo Futuro

Este proyecto se encuentra en evolución continua. Se han identificado diversas áreas para futuras mejoras que se abordarán en próximas iteraciones:

### Optimización de Rendimiento
Se implementarán mejoras en el rendimiento general de la aplicación, incluyendo lazy loading para componentes e imágenes, optimización del tamaño de los bundles mediante code splitting, y refinamiento del sistema de caché para una gestión más granular de los datos.

### Mejoras en Diseño Responsive
Si bien la aplicación es actualmente adaptable a diferentes dispositivos, se trabajará en perfeccionar la experiencia en resoluciones intermedias y pantallas más pequeñas, con especial atención a la página de detalles de producto y los selectores de opciones.

### Experiencia de Usuario
Se incorporarán estados de carga tipo skeleton para mejorar la percepción de rendimiento, una navegación más intuitiva mediante breadcrumbs mejorados, y sistemas de paginación o scroll infinito para manejar grandes conjuntos de datos.

### Testing y Calidad
Se ampliará la cobertura de pruebas unitarias y se implementarán pruebas de integración para garantizar la robustez del código en escenarios más complejos. Esto incluirá pruebas específicas para los componentes del carrito y el sistema de búsqueda.

### Accesibilidad
Se mejorarán los aspectos de accesibilidad mediante la incorporación de atributos ARIA apropiados, optimización de la navegación por teclado y mejora del contraste de colores según estándares WCAG.

Estas mejoras representan el compromiso con la calidad del producto y la intención de desarrollar una aplicación que no solo cumpla con los requisitos técnicos, sino que también ofrezca una experiencia excepcional al usuario final.