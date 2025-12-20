# Sistema de Gestión de Cine

Aplicación web full-stack para gestionar un sistema de cine, incluyendo películas, salas y funciones. Construido con Angular 20 y Node.js/Express con MongoDB.

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución de la Aplicación](#ejecución-de-la-aplicación)
- [Pruebas](#pruebas)
  - [Pruebas Unitarias](#pruebas-unitarias)
  - [Pruebas con Postman](#pruebas-con-postman)
  - [Pruebas de Rendimiento con JMeter](#pruebas-de-rendimiento-con-jmeter)
  - [Pruebas de Seguridad con OWASP ZAP](#pruebas-de-seguridad-con-owasp-zap)
- [Documentación de la API](#documentación-de-la-api)
- [Características de Seguridad](#características-de-seguridad)

## Descripción General

Este sistema de gestión de cine permite a usuarios autenticados gestionar películas, salas de cine y funciones. El sistema implementa autenticación JWT, validación de integridad de datos y una interfaz moderna y responsiva con un tema personalizado de cine.

## Stack Tecnológico

### Backend

- **Runtime**: Node.js
- **Framework**: Express 5
- **Base de Datos**: MongoDB con Mongoose ODM
- **Autenticación**: JWT (jsonwebtoken) con hash de contraseñas bcryptjs
- **Pruebas**: Jest + Supertest
- **Linting**: ESLint

### Frontend

- **Framework**: Angular 20 (Componentes Standalone)
- **Estilos**: Tailwind CSS v4
- **Gestión de Estado**: Angular Signals
- **HTTP**: Angular HttpClient con interceptores JWT

## Características

### Autenticación y Autorización

- Registro e inicio de sesión de usuarios con tokens JWT
- Hash de contraseñas con bcryptjs
- Rutas protegidas con middleware de autenticación
- Gestión de sesiones basada en tokens

### Gestión de Películas

- Endpoint GET público (no requiere autenticación)
- Operaciones CRUD autenticadas (Crear, Actualizar, Eliminar)
- Propiedad de películas por usuario
- Previene eliminación si la película está en funciones activas

### Gestión de Salas

- Operaciones CRUD completas (todas requieren autenticación)
- Salas específicas por usuario (privadas al propietario)
- Información de capacidad y tipo de sala (2D, 3D, VIP)
- Previene eliminación si la sala está en funciones activas

### Gestión de Funciones

- Períodos de proyección basados en fechas (fecha_inicio a fecha_fin)
- Vincula películas con salas
- Valida existencia de sala y película
- Privadas para usuarios autenticados

### Integridad de Datos

- Verificaciones de integridad referencial previenen eliminación de salas/películas en uso
- La validación asegura que las funciones referencien salas y películas válidas
- Normalización de fechas para manejo consistente de períodos

## Estructura del Proyecto

```
proyecto/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # Conexión MongoDB
│   │   ├── controllers/
│   │   │   ├── movie.controller.js   # Lógica CRUD de películas
│   │   │   ├── room.controller.js    # Lógica CRUD de salas
│   │   │   ├── showtime.controller.js # Lógica CRUD de funciones
│   │   │   └── user.controller.js    # Lógica de autenticación
│   │   ├── middleware/
│   │   │   └── auth.middleware.js    # Verificación JWT
│   │   ├── models/
│   │   │   ├── movie.model.js        # Esquema de película
│   │   │   ├── room.model.js         # Esquema de sala
│   │   │   ├── showtime.model.js     # Esquema de función
│   │   │   └── user.model.js         # Esquema de usuario
│   │   ├── routes/
│   │   │   ├── movie.routes.js       # Endpoints de películas
│   │   │   ├── room.routes.js        # Endpoints de salas
│   │   │   ├── showtime.routes.js    # Endpoints de funciones
│   │   │   └── user.routes.js        # Endpoints de autenticación
│   │   └── app.js                    # Configuración de Express
│   ├── test/                         # Pruebas unitarias Jest
│   ├── coverage/                     # Reportes de cobertura
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── auth/             # Login/Registro
    │   │   │   ├── movies/           # CRUD de películas
    │   │   │   ├── rooms/            # CRUD de salas
    │   │   │   └── showtimes/        # CRUD de funciones
    │   │   ├── services/             # Servicios HTTP
    │   │   ├── guards/               # Guardias de rutas
    │   │   └── app.routes.ts         # Configuración de rutas
    │   └── styles.css                # Tema Tailwind
    └── package.json
```

## Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- Cuenta de MongoDB Atlas o instancia local de MongoDB
- Gestor de paquetes npm o yarn

### Configuración del Backend

```bash
cd backend
npm install
```

### Configuración del Frontend

```bash
cd frontend
npm install
```

## Configuración

### Variables de Entorno del Backend

Crea un archivo `.env` en el directorio `backend/`:

```env
# Conexión MongoDB
MONGODB_URI=mongodb+srv...

# Secreto JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Puerto del Servidor
PORT=3000

# Expiración JWT (opcional)
JWT_EXPIRES_IN=24h
```

**Importante**: Reemplaza `username`, `password` y `cluster` con tus credenciales de MongoDB Atlas.

## Ejecución de la Aplicación

### Iniciar Servidor Backend

```bash
cd backend
npm run dev
```

El servidor se ejecuta en `http://localhost:3000`

### Iniciar Aplicación Frontend

```bash
cd frontend
npm start
```

El frontend se ejecuta en `http://localhost:4200`

## Pruebas

### Pruebas Unitarias

El backend incluye pruebas unitarias completas usando Jest y Supertest.

#### Ejecutar Todas las Pruebas

```bash
cd backend
npm test
```

#### Ejecutar Pruebas Secuencialmente (para depuración)

```bash
npm run test:sequential
```

#### Ver Reporte de Cobertura

Después de ejecutar las pruebas, abre `backend/coverage/lcov-report/index.html` en tu navegador para ver información detallada de cobertura.

#### La Cobertura de Pruebas Incluye:

- **Autenticación de Usuario**: Registro, inicio de sesión, manejo de usuarios duplicados
- **Operaciones de Películas**: Operaciones CRUD, autorización, validación
- **Operaciones de Salas**: Operaciones CRUD, autorización, validación
- **Operaciones de Funciones**: Operaciones CRUD, manejo de fechas, integridad referencial

### Pruebas con Postman

#### Configuración

1. **Instalar Postman**: Descargar desde [postman.com](https://www.postman.com/downloads/)

2. **Crear una Nueva Colección**: Nombrala "Cinema Management API"

3. **Configurar Variable de URL Base**:
   - Haz clic en la colección → pestaña Variables
   - Agregar variable: `baseUrl` = `http://localhost:3000/api`

#### Escenarios de Prueba

##### 1. Registro de Usuario

```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123456"
}
```

**Respuesta Esperada (201)**:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

##### 2. Inicio de Sesión de Usuario

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

**Respuesta Esperada (200)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Guardar el token**: En la pestaña Tests, agregar:

```javascript
pm.collectionVariables.set("authToken", pm.response.json().token);
```

##### 3. Crear Película (GET Público, Escritura Requiere Autenticación)

```
POST {{baseUrl}}/movies
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "title": "Inception",
  "director": "Christopher Nolan",
  "genre": "Sci-Fi",
  "duration": 148,
  "release_year": 2010
}
```

##### 4. Obtener Todas las Películas (Público - Sin Autenticación)

```
GET {{baseUrl}}/movies
```

##### 5. Crear Sala (Requiere Autenticación)

```
POST {{baseUrl}}/rooms
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "name": "Sala Premium 1",
  "capacity": 120,
  "type": "VIP"
}
```

##### 6. Crear Función (Requiere Autenticación)

```
POST {{baseUrl}}/showtimes
Authorization: Bearer {{authToken}}
Content-Type: application/json

{
  "movie_id": "{{movieId}}",
  "room_id": "{{roomId}}",
  "start_date": "2025-12-25",
  "end_date": "2025-12-31"
}
```

##### 7. Probar Integridad de Datos - Intentar Eliminar Sala en Uso

```
DELETE {{baseUrl}}/rooms/{{roomId}}
Authorization: Bearer {{authToken}}
```

**Respuesta Esperada (400)**:

```json
{
  "message": "Cannot delete room because it is being used in one or more showtimes"
}
```

#### Automatización de Pruebas en Postman

Agregar en la pestaña Tests de cada petición:

```javascript
// Probar código de respuesta
pm.test("Código de estado es 200", function () {
  pm.response.to.have.status(200);
});

// Probar tiempo de respuesta
pm.test("Tiempo de respuesta es menor a 500ms", function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

// Probar estructura de respuesta
pm.test("Respuesta tiene campos requeridos", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("token");
});
```

### Pruebas de Rendimiento con JMeter

#### Configuración

1. **Instalar JMeter**: Descargar desde [jmeter.apache.org](https://jmeter.apache.org/download_jmeter.cgi)
2. **Iniciar JMeter**: Ejecutar `jmeter.bat` (Windows) o `jmeter.sh` (Linux/Mac)

#### Configuración del Plan de Pruebas

##### 1. Crear Plan de Pruebas

- **Nombre del Plan de Pruebas**: Cinema API Performance Test

##### 2. Agregar Grupo de Hilos

- Clic derecho en Plan de Pruebas → Agregar → Threads → Thread Group
- **Configuración**:
  - Número de Hilos (usuarios): 100
  - Período de Aceleración: 10 segundos
  - Contador de Bucle: 10

##### 3. Agregar Valores Predeterminados de Petición HTTP

- Clic derecho en Grupo de Hilos → Agregar → Config Element → HTTP Request Defaults
- **Configuración**:
  - Nombre del Servidor: `localhost`
  - Número de Puerto: `3000`
  - Protocolo: `http`

##### 4. Agregar Variables de Usuario

- Clic derecho en Grupo de Hilos → Agregar → Config Element → User Defined Variables
- Agregar variable: `BASE_PATH` = `/api`

##### 5. Agregar Peticiones HTTP

###### Petición de Registro de Usuario

```
Ruta: ${BASE_PATH}/auth/register
Método: POST
Datos del Cuerpo:
{
  "username": "jmeter${__Random(1,10000)}",
  "email": "jmeter${__Random(1,10000)}@test.com",
  "password": "Test123456"
}
```

###### Petición de Inicio de Sesión

```
Ruta: ${BASE_PATH}/auth/login
Método: POST
Datos del Cuerpo:
{
  "email": "test@example.com",
  "password": "Test123456"
}
```

Agregar Extractor JSON para extraer el token:

- Nombre de variable: `authToken`
- Ruta JSON: `$.token`

###### Petición Obtener Películas (Prueba de Carga - Sin Autenticación)

```
Ruta: ${BASE_PATH}/movies
Método: GET
```

###### Petición Crear Película

```
Ruta: ${BASE_PATH}/movies
Método: POST
Encabezado: Authorization: Bearer ${authToken}
Datos del Cuerpo:
{
  "title": "Movie ${__Random(1,1000)}",
  "genre": "Action",
  "duration": ${__Random(90,180)},
  "rating": "PG-13",
  "release_date": "2025-01-01"
}
```

##### 6. Agregar Oyentes (Listeners)

- Clic derecho en Grupo de Hilos → Agregar → Listener → View Results Tree
- Clic derecho en Grupo de Hilos → Agregar → Listener → Summary Report
- Clic derecho en Grupo de Hilos → Agregar → Listener → Aggregate Report
- Clic derecho en Grupo de Hilos → Agregar → Listener → Graph Results

##### 7. Ejecutar Prueba

- Hacer clic en el botón verde Start
- Monitorear resultados en tiempo real

#### Métricas de Rendimiento a Monitorear

- **Rendimiento (Throughput)**: Peticiones por segundo
- **Tiempo de Respuesta Promedio**: Debe ser < 500ms
- **Tasa de Error**: Debe ser < 1%
- **Percentil 90**: Tiempo de respuesta para el 90% de las peticiones
- **Usuarios Concurrentes**: Máximo de usuarios concurrentes antes de degradación

#### Escenarios de Pruebas de Rendimiento

1. **Prueba de Carga**: 100 usuarios en 10 segundos, 10 bucles
2. **Prueba de Estrés**: 500 usuarios en 30 segundos, 5 bucles
3. **Prueba de Pico**: 1000 usuarios instantáneamente, 1 bucle
4. **Prueba de Resistencia**: 50 usuarios durante 1 hora, bucle infinito

### Pruebas de Seguridad con OWASP ZAP

#### Configuración

1. **Instalar OWASP ZAP**: Descargar desde [zaproxy.org](https://www.zaproxy.org/download/)
2. **Iniciar ZAP**: Ejecutar la aplicación

#### Escaneo Automatizado

##### 1. Escaneo Rápido (Quick Start)

1. Abrir ZAP
2. Hacer clic en "Automated Scan"
3. Ingresar URL: `http://localhost:4200`
4. Hacer clic en "Attack"

##### 2. Exploración Manual + Escaneo Activo

1. Iniciar ZAP
2. Configurar proxy del navegador a `localhost:8080`
3. Navegar la aplicación manualmente:
   - Registrar usuario
   - Iniciar sesión
   - Crear películas, salas, funciones
   - Actualizar y eliminar entidades
4. En ZAP, clic derecho en el sitio → "Attack" → "Active Scan"

#### Categorías de Pruebas de Seguridad

##### 1. Pruebas de Autenticación

- **Política de Contraseñas Débiles**: Probar con contraseña "123456"
- **Validación de Token JWT**: Probar con tokens modificados/expirados
- **Gestión de Sesión**: Probar expiración de token

```bash
# Probar con token expirado
curl -H "Authorization: Bearer expired_token_here" \
  http://localhost:3000/api/movies
```

##### 2. Pruebas de Autorización

- **Escalación de Privilegios Horizontal**: Intentar acceder a salas de otros usuarios
- **Escalación de Privilegios Vertical**: Intentar funciones de administrador como usuario regular
- **Autorización Faltante**: Intentar acceder a endpoints protegidos sin token

```bash
# Probar acceso no autorizado
curl http://localhost:3000/api/rooms
```

##### 3. Validación de Entrada

- **Inyección SQL**: Probar con entrada maliciosa (inyección NoSQL de MongoDB)
- **XSS**: Probar con `<script>alert('XSS')</script>`
- **Inyección de Comandos**: Probar con `; ls -la`

##### 4. Pruebas de Lógica de Negocio

- **Integridad de Datos**: Intentar eliminar sala usada en función
- **Validación de Fecha**: Crear función con fecha_fin < fecha_inicio
- **Números Negativos**: Probar capacidad de sala con valor negativo

##### 5. Seguridad de API

- **Asignación Masiva**: Intentar agregar campos extra en las peticiones
- **Limitación de Tasa**: Enviar 1000 peticiones rápidamente
- **Política CORS**: Probar desde diferentes orígenes

#### Configuración de ZAP para Pruebas de API

1. **Importar OpenAPI/Swagger**: Si tienes documentación de la API

   - Tools → Import → Import a file or URL containing OpenAPI/Swagger definition

2. **Configurar Contexto**:

   - Clic derecho en sitio → Include in Context → New Context
   - Agregar autenticación (JWT)
   - Configurar gestión de sesión

3. **Configuración de Escaneo Activo**:
   - Policy → SQL Injection, XSS, Path Traversal habilitados
   - Threshold: Medium
   - Strength: High

#### Hallazgos de Seguridad Esperados

✅ **Debe Pasar:**

- Hash de contraseñas (bcryptjs)
- Autenticación con token JWT
- CORS configurado
- Validación de entrada en modelos
- Verificaciones de integridad de datos

⚠️ **Vulnerabilidades Comunes a Verificar:**

- Limitación de tasa no implementada
- Riesgo de exposición del secreto JWT
- Mensajes de error revelando información sensible
- Falta de encabezados de seguridad (helmet.js)
- No hay HTTPS en producción

#### Generar Reporte de Seguridad

1. Después de completar el escaneo
2. Report → Generate HTML Report
3. Guardar en `backend/security-report.html`

## Documentación de la API

### Endpoints de Autenticación

#### Registrar Usuario

```
POST /api/auth/register
Content-Type: application/json

Petición:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Respuesta (201):
{
  "message": "User registered successfully",
  "token": "jwt_token"
}
```

#### Iniciar Sesión

```
POST /api/auth/login
Content-Type: application/json

Petición:
{
  "email": "string",
  "password": "string"
}

Respuesta (200):
{
  "token": "jwt_token",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

### Endpoints de Películas

#### Obtener Todas las Películas (Público)

```
GET /api/movies

Respuesta (200):
[
  {
    "_id": "string",
    "title": "string",
    "director": "string",
    "genre": "string",
    "duration": number,
    "release_year": number,
    "user_id": "string"
  }
]
```

#### Crear Película (Requiere Autenticación)

```
POST /api/movies
Authorization: Bearer {token}
Content-Type: application/json

Petición:
{
  "title": "string",
  "director": "string",
  "genre": "string",
  "duration": number,
  "release_year": number
}

Respuesta (201):
{
  "_id": "string",
  "title": "string",
  ...
}
```

#### Actualizar Película (Requiere Autenticación)

```
PUT /api/movies/:id
Authorization: Bearer {token}
Content-Type: application/json

Petición: Igual que Crear
Respuesta (200): Objeto de película actualizado
```

#### Eliminar Película (Requiere Autenticación)

```
DELETE /api/movies/:id
Authorization: Bearer {token}

Respuesta (200):
{
  "message": "Movie deleted successfully"
}

Respuesta (400) si se usa en funciones:
{
  "message": "Cannot delete movie because it is being used in one or more showtimes"
}
```

### Endpoints de Salas (Todos Requieren Autenticación)

#### Obtener Todas las Salas

```
GET /api/rooms
Authorization: Bearer {token}
```

#### Crear Sala

```
POST /api/rooms
Authorization: Bearer {token}
Content-Type: application/json

Petición:
{
  "name": "string",
  "capacity": number,
  "type": "string" // Valores permitidos: "2D", "3D", "VIP"
}
```

#### Actualizar Sala

```
PUT /api/rooms/:id
Authorization: Bearer {token}
```

#### Eliminar Sala

```
DELETE /api/rooms/:id
Authorization: Bearer {token}

Respuesta (400) si se usa en funciones:
{
  "message": "Cannot delete room because it is being used in one or more showtimes"
}
```

### Endpoints de Funciones (Todos Requieren Autenticación)

#### Obtener Todas las Funciones

```
GET /api/showtimes
Authorization: Bearer {token}
```

#### Crear Función

```
POST /api/showtimes
Authorization: Bearer {token}
Content-Type: application/json

Petición:
{
  "movie_id": "string",
  "room_id": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}
```

#### Actualizar Función

```
PUT /api/showtimes/:id
Authorization: Bearer {token}
```

#### Eliminar Función

```
DELETE /api/showtimes/:id
Authorization: Bearer {token}
```

## Características de Seguridad

### Implementado

✅ Autenticación JWT con generación segura de tokens  
✅ Hash de contraseñas con bcryptjs (10 rondas de salt)  
✅ Rutas protegidas con middleware de autenticación  
✅ Validación de propiedad de usuario para recursos  
✅ Validación de entrada vía esquemas Mongoose  
✅ Verificaciones de integridad de datos (integridad referencial)  
✅ Configuración CORS  
✅ Gestión de variables de entorno con dotenv

## Licencia

Este proyecto es con fines educativos.

## Colaboradores

- Luis Sagnay
