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
  - [Pruebas Unitarias Backend](#pruebas-unitarias-backend)
  - [Pruebas de Componentes Frontend](#pruebas-de-componentes-frontend)
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

### Pruebas Unitarias Backend

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

### Pruebas de Componentes Frontend

El frontend utiliza Jasmine y Karma para pruebas unitarias de componentes Angular.

#### Ejecutar Pruebas de Componentes

```bash
cd frontend
ng test
```

Este comando inicia Karma y ejecuta todas las pruebas de componentes en modo watch.

#### Verificar Cobertura de Código

```bash
ng test --code-coverage
```

El reporte de cobertura se genera en `frontend/coverage/index.html`.

#### Matchers de Jasmine Utilizados

Las pruebas de componentes utilizan los siguientes matchers para validar comportamiento:

##### Matchers de Igualdad

- **`toBe(expected)`**: Compara valores primitivos o referencias de objetos (comparación estricta ===)

  ```typescript
  expect(component.isLoading).toBe(false);
  ```

- **`toEqual(expected)`**: Compara el contenido de objetos o arrays (deep equality)
  ```typescript
  expect(component.movies).toEqual([{ id: 1, title: "Movie 1" }]);
  ```

##### Matchers Booleanos

- **`toBeTruthy()`**: Verifica que el valor sea verdadero en contexto booleano

  ```typescript
  expect(component.form.valid).toBeTruthy();
  ```

- **`toBeFalsy()`**: Verifica que el valor sea falso en contexto booleano
  ```typescript
  expect(component.errorMessage).toBeFalsy();
  ```

##### Matchers de Contenido

- **`toContain(expected)`**: Verifica que un array/string contenga un elemento/substring

  ```typescript
  expect(genres).toContain("Action");
  ```

- **`toMatch(pattern)`**: Verifica que un string coincida con una expresión regular
  ```typescript
  expect(component.email).toMatch(
    /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
  );
  ```

##### Matchers de Existencia

- **`toBeDefined()`**: Verifica que una variable esté definida

  ```typescript
  expect(component.authService).toBeDefined();
  ```

- **`toBeNull()`**: Verifica que el valor sea null
  ```typescript
  expect(component.selectedMovie).toBeNull();
  ```

##### Matchers de Tipo

- **`toBeInstanceOf(Class)`**: Verifica que un objeto sea instancia de una clase
  ```typescript
  expect(component.loginForm).toBeInstanceOf(FormGroup);
  ```

##### Matchers Numéricos

- **`toBeGreaterThan(expected)`**: Verifica que un número sea mayor que el esperado

  ```typescript
  expect(component.movies.length).toBeGreaterThan(0);
  ```

- **`toBeLessThan(expected)`**: Verifica que un número sea menor que el esperado

  ```typescript
  expect(component.errorCount).toBeLessThan(5);
  ```

- **`toBeCloseTo(expected, precision)`**: Compara números con decimales con cierta precisión
  ```typescript
  expect(component.rating).toBeCloseTo(4.5, 1);
  ```

#### Ejemplos de Pruebas de Componentes

##### Pruebas de Renderizado de Elementos

```typescript
it("should render movie title", () => {
  const compiled = fixture.nativeElement;
  expect(compiled.querySelector("h1").textContent).toContain("Movies");
});
```

##### Pruebas de Formularios Reactivos

```typescript
it("should validate email format", () => {
  const emailControl = component.loginForm.get("email");
  emailControl?.setValue("invalid-email");
  expect(emailControl?.invalid).toBeTruthy();
  expect(emailControl?.errors?.["email"]).toBeTruthy();
});
```

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

### Pruebas de Seguridad con OWASP ZAP (Spidering, Escaneo Activo/Pasivo, Fuzzing)

OWASP ZAP es una herramienta de código abierto para encontrar vulnerabilidades de seguridad en aplicaciones web. Esta sección describe las cuatro metodologías principales de análisis: **Spidering** (descubrimiento de rutas), **Escaneo Pasivo** (análisis no intrusivo), **Escaneo Activo** (explotación de vulnerabilidades) y **Fuzzing** (pruebas de robustez con entradas aleatorias).

#### Instalación y Configuración Inicial

1. **Instalar OWASP ZAP**: Descargar desde [zaproxy.org](https://www.zaproxy.org/download/)
2. **Iniciar ZAP**: Ejecutar la aplicación
3. **Configurar Proxy**: Configurar navegador para usar proxy `localhost:8080`

#### Metodología 1: Spidering (Descubrimiento de Rutas)

El **Spidering** es el proceso automatizado de descubrir todas las URLs y rutas de la aplicación web rastreando enlaces, formularios y endpoints.

##### Objetivo

Mapear completamente la estructura de la aplicación para identificar todos los puntos de entrada que deben ser analizados.

##### Configuración del Spider

1. En ZAP, navega a **Tools → Spider**
2. Ingresa la URL base: `http://localhost:4200`
3. **Configuración recomendada**:
   - **Max Depth**: 5 (niveles de profundidad)
   - **Number of Threads**: 5
   - **Max Duration**: 10 minutos
   - **Parse HTML Comments**: Habilitado
   - **Parse robots.txt**: Habilitado
   - **Parse sitemap.xml**: Habilitado

##### Ejecución

```
1. Tools → Spider
2. Ingresa URL: http://localhost:4200
3. Click en "Start Scan"
4. Observa el árbol de sitios expandirse con las rutas descubiertas
```

##### Resultados Esperados

El spider debería descubrir:

- `/login` - Formulario de autenticación
- `/register` - Formulario de registro
- `/movies` - Lista de películas
- `/movies/new` - Crear película
- `/movies/:id` - Editar película
- `/rooms` - Gestión de salas
- `/showtimes` - Gestión de funciones
- APIs backend: `/api/auth/*`, `/api/movies/*`, `/api/rooms/*`, `/api/showtimes/*`

##### Análisis de Cobertura

Verifica en la pestaña **Sites** que todas las rutas conocidas hayan sido descubiertas. Si faltan rutas:

- Ejecuta una exploración manual navegando las rutas faltantes
- Considera rutas protegidas que requieren autenticación

#### Metodología 2: Escaneo Pasivo (Análisis No Intrusivo)

El **Escaneo Pasivo** analiza el tráfico HTTP que pasa por el proxy de ZAP sin realizar peticiones adicionales, identificando problemas de configuración y seguridad básica.

##### Objetivo

Detectar vulnerabilidades sin modificar datos ni realizar ataques, minimizando riesgos en producción.

##### Cómo Funciona

- Se activa automáticamente cuando navegas la aplicación con el proxy de ZAP configurado
- Analiza encabezados HTTP, cookies, respuestas del servidor
- No envía payloads maliciosos ni modifica peticiones

##### Categorías de Análisis Pasivo

1. **Missing Security Headers**

   - `X-Content-Type-Options`
   - `X-Frame-Options`
   - `Content-Security-Policy`
   - `Strict-Transport-Security` (HSTS)

2. **Cookie Security**

   - Cookies sin `HttpOnly` flag
   - Cookies sin `Secure` flag (en HTTPS)
   - Cookies sin `SameSite` attribute

3. **Information Disclosure**
   - Versiones de frameworks expuestas en encabezados
   - Stack traces en respuestas de error
   - Comentarios HTML con información sensible

##### Ejecución

```
1. Configura proxy del navegador: localhost:8080
2. Navega la aplicación manualmente:
   - Registra un usuario
   - Inicia sesión
   - Crea películas, salas, funciones
   - Realiza operaciones CRUD
3. ZAP analiza automáticamente cada petición/respuesta
4. Revisa Alerts (panel inferior) para ver hallazgos
```

##### Resultados Esperados

**Alertas comunes detectadas**:

- ⚠️ Missing Anti-clickjacking Header (`X-Frame-Options`)
- ⚠️ Content Security Policy (CSP) Header Not Set
- ⚠️ Server Leaks Version Information via "Server" HTTP Header
- ⚠️ Cookies without HttpOnly Flag

#### Metodología 3: Escaneo Activo (Explotación de Vulnerabilidades)

El **Escaneo Activo** envía payloads maliciosos y peticiones modificadas para identificar vulnerabilidades explotables como inyecciones SQL/NoSQL, XSS, CSRF, etc.

##### Objetivo

Descubrir vulnerabilidades críticas que podrían ser explotadas por atacantes para comprometer la aplicación.

##### ⚠️ Advertencia

El escaneo activo modifica datos y puede causar:

- Registros inválidos en la base de datos
- Corrupción de datos
- Denegación de servicio temporal
  **Solo ejecutar en ambientes de prueba/desarrollo, NUNCA en producción.**

##### Configuración del Active Scan

1. En ZAP, clic derecho en el sitio → **Attack → Active Scan**
2. **Configuración de Política**:
   - **Policy**: Default Policy o crear una personalizada
   - **Threshold**: Medium (sensibilidad de detección)
   - **Strength**: High (intensidad de ataques)
3. **Categorías habilitadas**:
   - SQL Injection
   - NoSQL Injection (MongoDB)
   - Cross-Site Scripting (XSS)
   - Cross-Site Request Forgery (CSRF)
   - Path Traversal
   - Remote Code Execution

##### Vectores de Ataque Probados

**1. SQL/NoSQL Injection**

```
GET /api/movies?id=' OR '1'='1
GET /api/movies?id[$ne]=null
POST /api/auth/login
{
  "email": {"$ne": null},
  "password": {"$ne": null}
}
```

**2. Cross-Site Scripting (XSS)**

```
POST /api/movies
{
  "title": "<script>alert('XSS')</script>",
  "director": "<img src=x onerror=alert('XSS')>"
}
```

**3. Path Traversal**

```
GET /api/movies/../../etc/passwd
GET /api/movies/%2e%2e%2f%2e%2e%2fconfig/database.js
```

**4. Authentication Bypass**

```
GET /api/rooms (sin Authorization header)
PUT /api/movies/123 (con token de otro usuario)
```

##### Ejecución

```
1. Asegúrate de haber completado el Spidering
2. Clic derecho en http://localhost:4200 → Attack → Active Scan
3. Selecciona política de escaneo: Default Policy
4. Marca "Show advanced options"
   - Threads per host: 5
   - Max results to list: 100
5. Click "Start Scan"
6. Tiempo estimado: 15-30 minutos
```

##### Resultados Esperados

**Vulnerabilidades que ZAP debería encontrar**:

- 🔴 **High**: Missing Authentication for /api/movies (GET es público, otros endpoints requieren auth)
- 🟡 **Medium**: JWT Token Not Validated Properly (si el middleware tiene debilidades)
- 🟢 **Low**: Cross-Domain JavaScript Source File Inclusion

**Vulnerabilidades que NO deberían encontrarse** (implementación correcta):

- ✅ SQL Injection: MongoDB usa drivers parametrizados
- ✅ NoSQL Injection: Mongoose sanitiza queries automáticamente
- ✅ Password Storage: bcryptjs con 10 salt rounds
- ✅ CORS: Configurado correctamente en backend

#### Metodología 4: Fuzzing (Pruebas de Robustez con Entradas Aleatorias)

El **Fuzzing** envía entradas inválidas, malformadas o aleatorias a los endpoints para probar la robustez del manejo de errores y validación de entrada.

##### Objetivo

Identificar comportamientos inesperados cuando la aplicación recibe datos fuera de especificación (números negativos, strings largos, tipos incorrectos, valores null/undefined).

##### Tipos de Payloads de Fuzzing

1. **Fuzzing de Tipo de Dato**

   - String donde se espera número: `"abc"` en campo `duration`
   - Número donde se espera string: `12345` en campo `title`
   - Booleano donde se espera string: `true` en campo `genre`

2. **Fuzzing de Rango**

   - Números negativos: `-1` para `capacity`
   - Números excesivamente grandes: `9999999999` para `duration`
   - Strings vacíos: `""` para campos requeridos
   - Strings extremadamente largos: 10,000 caracteres en `title`

3. **Fuzzing de Caracteres Especiales**

   - SQL: `'; DROP TABLE movies; --`
   - NoSQL: `{"$ne": null}`
   - XSS: `<script>alert('XSS')</script>`
   - Unicode: `\u0000`, `\uFFFE`
   - Path traversal: `../../etc/passwd`

4. **Fuzzing de Null/Undefined**
   - `null` en campos obligatorios
   - `undefined` en campos de validación
   - Omitir campos requeridos completamente

##### Configuración de Fuzzer en ZAP

1. Intercepta una petición POST (ej: crear película)
2. Clic derecho en la petición → **Fuzz**
3. Selecciona el campo a fuzzear (ej: `"title": "Test"`)
4. Click en **Add** para agregar payloads:

**Ejemplo: Fuzzear campo `capacity` de Room**

```
Payload List: Integers
Values: -1, 0, 999999, 2147483647

Payload List: Special Chars
Values: null, undefined, "", "abc", true, false

Payload List: SQL Injection
Values: '; DROP TABLE rooms; --, ' OR '1'='1
```

5. Número de Threads: 5
6. Delay between requests: 100ms
7. Click en **Start Fuzzer**

##### Áreas Críticas para Fuzzing

**1. Endpoint de Registro de Usuario**

```
POST /api/auth/register

Campos a fuzzear:
- username: "", null, "a"*1000, "<script>", {"$ne": null}
- email: "invalid", "@", "test@", null, 12345
- password: "", "123", "a"*10000, null
```

**2. Endpoint de Creación de Película**

```
POST /api/movies

Campos a fuzzear:
- title: "", null, "a"*500, <script>, 12345
- director: "", null, true, []
- duration: -1, 0, "abc", 999999, null
- release_year: -2000, 0, 3000, "abc", null
```

**3. Endpoint de Creación de Sala**

```
POST /api/rooms

Campos a fuzzear:
- name: "", null, "a"*200, {"$ne": null}
- capacity: -10, 0, "abc", 2147483647, null
- type: "", "INVALID", 123, null, ["2D", "3D"]
```

**4. Endpoint de Creación de Función**

```
POST /api/showtimes

Campos a fuzzear:
- movie_id: "invalid_id", "", null, 12345, {"$ne": null}
- room_id: "000000000000000000000000", null, []
- start_date: "invalid", "32-13-2025", "", 20251225, null
- end_date: "2024-01-01" (antes de start_date), "", null
```

##### Ejecución Manual de Fuzzing con cURL

```bash
# Fuzzing de tipo de dato (string en lugar de número)
curl -X POST http://localhost:3000/api/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","director":"Test","duration":"abc","genre":"Action","release_year":2024}'

# Fuzzing de rango (número negativo)
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Room","capacity":-10,"type":"2D"}'

# Fuzzing de caracteres especiales (XSS)
curl -X POST http://localhost:3000/api/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","director":"Test","duration":120,"genre":"Action","release_year":2024}'

# Fuzzing de null
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":null,"capacity":100,"type":"2D"}'
```

##### Resultados Esperados

**Comportamiento Correcto (Debe Pasar)**:

- ✅ Validación de tipos: Mongoose rechaza tipos incorrectos con error 400
- ✅ Validación de rangos: Backend rechaza números negativos
- ✅ Validación de campos requeridos: Respuestas 400 con mensaje descriptivo
- ✅ Sanitización de entrada: Caracteres especiales escapados o rechazados

**Vulnerabilidades Comunes (A Verificar)**:

- 🔴 Crasheo de servidor con inputs extremos
- 🟡 Mensajes de error revelando stack traces completos
- 🟡 Bypass de validación con null/undefined
- 🟡 Inserción de datos inválidos en base de datos

#### Comparación de Técnicas de Escaneo

| Técnica       | Objetivo Principal                     | Intrusividad | Modifica Datos | Tiempo Estimado               |
| ------------- | -------------------------------------- | ------------ | -------------- | ----------------------------- |
| **Spidering** | Descubrir todas las rutas y endpoints  | Baja         | No             | 5-10 min                      |
| **Pasivo**    | Identificar problemas de configuración | Ninguna      | No             | Automático durante navegación |
| **Activo**    | Encontrar vulnerabilidades explotables | Alta         | Sí             | 15-30 min                     |
| **Fuzzing**   | Probar robustez con entradas inválidas | Media        | Sí             | 10-20 min por endpoint        |

#### Reporte de Hallazgos por Tipo de Escaneo

##### Spidering - Cobertura de Rutas

- ✅ Frontend: 8 rutas descubiertas
- ✅ Backend APIs: 12 endpoints mapeados
- ⚠️ Rutas protegidas requieren autenticación manual

##### Escaneo Pasivo - Vulnerabilidades de Configuración

- 🟡 Missing `X-Frame-Options` header
- 🟡 Missing `Content-Security-Policy` header
- 🟡 Server version disclosed in headers
- 🟡 Cookies without `HttpOnly` flag

##### Escaneo Activo - Vulnerabilidades Críticas

- ✅ No SQL Injection detectada
- ✅ No NoSQL Injection exitosa
- ✅ Passwords hasheadas correctamente
- 🟡 CORS configurado pero headers de seguridad faltantes

##### Fuzzing - Validación de Entrada

- ✅ Tipos de dato validados correctamente
- ✅ Rangos numéricos validados
- ⚠️ Algunos mensajes de error exponen estructura de BD
- ⚠️ Strings extremadamente largos aceptados (DoS potential)

#### Generar Reporte de Seguridad

1. Después de completar todos los escaneos
2. **Report → Generate HTML Report**
3. Selecciona template: Traditional HTML Report
4. Incluye:
   - Sites
   - Alerts (High/Medium/Low/Info)
   - Risk Summary
5. Guardar en `backend/security-report.html`

#### Pruebas de Seguridad Adicionales

##### 1. Pruebas de Autenticación

- **Política de Contraseñas Débiles**: Probar con contraseña "123456"
- **Validación de Token JWT**: Probar con tokens modificados/expirados

##### 2. Pruebas de Autorización

- **Escalación de Privilegios**: Intentar acceder a recursos de otros usuarios
- **Autorización Faltante**: Intentar acceder a endpoints protegidos sin token

##### 3. Validación de Entrada

- **Inyección NoSQL**: Probar con entrada maliciosa de MongoDB
- **XSS**: Probar con `<script>alert('XSS')</script>`

##### 4. Pruebas de Lógica de Negocio

- **Integridad de Datos**: Intentar eliminar sala usada en función
- **Validación de Fecha**: Crear función con end_date < start_date

#### Configuración de ZAP para Pruebas de API

1. **Importar OpenAPI/Swagger**: Si tienes documentación de la API

   - Tools → Import → Import a file or URL containing OpenAPI/Swagger definition

2. **Configurar Contexto**:
   - Clic derecho en sitio → Include in Context → New Context
   - Agregar autenticación (JWT)
   - Configurar gestión de sesión

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
