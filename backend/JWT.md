# Cambios Realizados - Autenticación JWT

## Resumen

Se ha implementado un sistema de autenticación con JWT (JSON Web Tokens) en el proyecto de gestión de películas. Los usuarios ahora requieren contraseña y todas las entidades principales están relacionadas con el usuario autenticado.

## Cambios Principales

### 1. **Modelo de Usuario** (`src/models/user.model.js`)

- ✅ Agregado campo `password` obligatorio (mínimo 6 caracteres)
- Las contraseñas se encriptan con bcrypt antes de guardarse

### 2. **Autenticación JWT**

- ✅ Creado middleware de autenticación (`src/middleware/auth.middleware.js`)
- ✅ Nuevas rutas de autenticación:
  - `POST /api/users/register` - Registro de usuarios
  - `POST /api/users/login` - Inicio de sesión
- ✅ Tokens JWT con expiración de 24 horas

### 3. **Relaciones con Usuario**

Todos los modelos ahora incluyen `user_id`:

- ✅ **Movie** - Películas pertenecen a usuarios
- ✅ **Showtime** - Funciones pertenecen a usuarios

### 4. **Rutas Protegidas**

#### Rutas Completamente Privadas (Showtimes)

**Todas las operaciones de Showtimes requieren autenticación** y cada usuario solo ve sus propias funciones:

- ✅ `GET /api/showtimes` - Listar funciones del usuario autenticado
- ✅ `GET /api/showtimes/:id` - Ver función propia por ID
- ✅ `POST /api/showtimes` - Crear función
- ✅ `PUT /api/showtimes/:id` - Actualizar función propia
- ✅ `DELETE /api/showtimes/:id` - Eliminar función propia

**Comportamiento:** Similar a las reservas del ejemplo backend. Cada usuario solo puede ver y gestionar sus propias funciones.

#### Rutas Parcialmente Públicas (Movies)

Las siguientes operaciones requieren autenticación:

- ✅ `POST /api/movies` - Crear película
- ✅ `PUT /api/movies/:id` - Actualizar película
- ✅ `DELETE /api/movies/:id` - Eliminar película

Las rutas GET de movies permanecen públicas para consultas de catálogo:

- 🌐 `GET /api/movies` - Ver todas las películas (público)
- 🌐 `GET /api/movies/:id` - Ver película por ID (público)

### 5. **Controladores Actualizados**

- ✅ Los controladores verifican que el usuario sea propietario del recurso
- ✅ Se agrega automáticamente `user_id` al crear recursos
- ✅ Solo se pueden modificar/eliminar recursos propios

### 6. **Dependencias Instaladas**

```json
{
  "jsonwebtoken": "^9.x.x",
  "bcryptjs": "^2.x.x"
}
```

### 7. **Variables de Entorno** (`.env`)

```env
JWT_SECRET=secret-key-group6
```

## Uso del Sistema

### Registro de Usuario

```bash
POST /api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Respuesta:**

```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login

```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "mypassword123"
}
```

**Respuesta:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Usar el Token en Rutas Protegidas

#### Crear una Película (público puede ver, solo creador puede modificar)

```bash
POST /api/movies
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Inception",
  "director": "Christopher Nolan",
  "genre": "Sci-Fi",
  "duration": 148,
  "release_year": 2010
}
```

#### Crear una Función (Solo el usuario autenticado puede verla)

```bash
POST /api/showtimes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "movie_id": "67890abcdef...",
  "room_id": "12345abcdef...",
  "start_time": "2025-12-25T18:00:00Z",
  "end_time": "2025-12-25T20:30:00Z"
}
```

#### Listar Mis Funciones (Solo usuario autenticado)

```bash
GET /api/showtimes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:** Solo retorna las funciones creadas por el usuario autenticado.

## Características de Seguridad

1. **Contraseñas Encriptadas**: Uso de bcrypt con salt rounds = 10
2. **Tokens Temporales**: Los JWT expiran en 24 horas
3. **Autorización**: Solo el propietario puede modificar sus recursos
4. **Aislamiento de Datos**: Cada usuario solo ve sus propias funciones (showtimes)
5. **Validaciones**:
   - Email válido y único
   - Contraseña mínimo 6 caracteres
   - Tokens verificados en cada petición protegida

## Simplificación del Backend

El sistema se ha mantenido simple para facilitar las pruebas:

- Rutas claras y directas
- Validaciones simples pero efectivas
- Mensajes de error descriptivos
- **Showtimes completamente privados**: Igual que las reservas del ejemplo backend
- Sin roles complejos (un solo tipo de usuario)

## Notas Importantes

⚠️ **IMPORTANTE**: Cambiar `JWT_SECRET` en producción por un valor seguro y aleatorio.

⚠️ **Showtimes (Funciones)**: Completamente privadas. Todas las rutas GET y POST requieren autenticación y cada usuario solo ve sus propias funciones. Funciona exactamente como las reservas del ejemplo en `backend/`.

⚠️ **Movies (Películas)**: Las rutas GET permanecen públicas para facilitar las consultas de catálogo, pero solo el propietario puede crear, modificar o eliminar sus películas.
