# Frontend - Sistema de Gestión de Cine

Aplicación frontend Angular 20 para gestionar un sistema de cine con autenticación JWT, incluyendo gestión de películas, salas y funciones.

## Stack Tecnológico

- **Framework**: Angular 20 (Componentes Standalone)
- **Estilos**: Tailwind CSS v4 con tema personalizado de cine
- **Gestión de Estado**: Angular Signals
- **Formularios**: Reactive Forms
- **Cliente HTTP**: Angular HttpClient con interceptores JWT
- **Enrutamiento**: Angular Router con guardias de autenticación

## Características Principales

- **Autenticación**: Sistema de login y registro basado en JWT
- **Gestión de Películas**: Crear, leer, actualizar y eliminar películas (GET público, operaciones de escritura autenticadas)
- **Gestión de Salas**: Operaciones CRUD completas para salas de cine (privadas para usuarios autenticados)
- **Gestión de Funciones**: Gestionar proyecciones de películas con períodos de fecha (privadas para usuarios autenticados)
- **Integridad de Datos**: Previene la eliminación de salas/películas que están referenciadas en funciones activas
- **Diseño Responsivo**: Layouts de cuadrícula mobile-first con Tailwind CSS
- **Tema Personalizado**: Paleta de colores inspirada en cine con acentos neón

## Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── auth/           # Login y registro
│   │   ├── movies/         # Componentes CRUD de películas
│   │   ├── rooms/          # Componentes CRUD de salas
│   │   └── showtimes/      # Componentes CRUD de funciones
│   ├── services/           # Servicios HTTP y autenticación
│   ├── guards/             # Guardias de rutas para autenticación
│   └── app.routes.ts       # Configuración de enrutamiento
└── styles.css              # Estilos globales y tema Tailwind
```

## Servidor de Desarrollo

Iniciar el servidor de desarrollo:

```bash
npm install
npm start
```

Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente cuando modifiques los archivos fuente.

**Nota**: Asegúrate de que el servidor backend esté ejecutándose en `http://localhost:3000` antes de iniciar el frontend.

## Compilación para Producción

Compilar el proyecto:

```bash
npm run build
```

Los artefactos de compilación se almacenarán en el directorio `dist/`, optimizados para despliegue en producción.

## Colores del Tema Personalizado

La aplicación usa un tema personalizado de cine definido en `src/styles.css`:

- **cinema-dark**: Fondo oscuro principal
- **cinema-accent**: Fondos de tarjetas y contenedores
- **cinema-blue**: Botones y enlaces principales
- **purple-neon**: Acciones de edición
- **cyan-neon**: Acciones de edición alternativas
- **red-cinema**: Acciones de eliminación
- **blue-neon**: Estados hover

## Flujo de Autenticación

1. El usuario se registra o inicia sesión a través de `/login`
2. El token JWT se almacena en localStorage
3. El token se incluye automáticamente en todas las peticiones HTTP vía interceptor
4. Las rutas protegidas redirigen al login si el usuario no está autenticado
5. El token expira después del tiempo configurado (establecido en el backend)

## Integración con la API

El frontend se comunica con la API backend en `http://localhost:3000/api`:

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión de usuario
- `GET /movies` - Listar todas las películas (público)
- `POST /movies` - Crear película (autenticado)
- `PUT /movies/:id` - Actualizar película (autenticado)
- `DELETE /movies/:id` - Eliminar película (autenticado)
- `GET /rooms` - Listar salas (autenticado)
- `POST /rooms` - Crear sala (autenticado)
- `PUT /rooms/:id` - Actualizar sala (autenticado)
- `DELETE /rooms/:id` - Eliminar sala (autenticado)
- `GET /showtimes` - Listar funciones (autenticado)
- `POST /showtimes` - Crear función (autenticado)
- `PUT /showtimes/:id` - Actualizar función (autenticado)
- `DELETE /showtimes/:id` - Eliminar función (autenticado)

## Recursos Adicionales

Para más información sobre comandos de Angular CLI, visita la [Documentación de Angular CLI](https://angular.dev/tools/cli).
