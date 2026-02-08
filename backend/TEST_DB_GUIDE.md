# 🧪 Configuración de Tests - Backend

## 📋 Cómo Funciona setupDB.js

### JEST_WORKER_ID - Explicación

`JEST_WORKER_ID` es una **variable de entorno automática** que Jest establece cuando ejecuta tests en paralelo:

```bash
npm test                    # Por defecto, Jest usa múltiples workers
└─ Worker 1 → JEST_WORKER_ID=1 → cinemax-test-worker-1
└─ Worker 2 → JEST_WORKER_ID=2 → cinemax-test-worker-2
└─ Worker 3 → JEST_WORKER_ID=3 → cinemax-test-worker-3

npm test -- --runInBand     # Tests secuenciales (1 worker)
└─ Worker único → Sin JEST_WORKER_ID → cinemax-test
```

### ¿Por qué bases de datos separadas?

✅ **Evita conflictos:** Cada worker tiene su propia DB  
✅ **Tests en paralelo:** Más rápido  
✅ **Sin race conditions:** Un test no afecta a otro

---

## 🔧 Funciones Disponibles

### 1. connectTestDB()

Conecta a MongoDB usando una DB específica para tests

```javascript
const { connectTestDB } = require('../src/config/setupDB')

beforeAll(async () => {
  await connectTestDB()
})
```

### 2. cleanupTestDB() [NUEVA]

Limpia todas las colecciones de la DB de test

```javascript
const { cleanupTestDB } = require('../src/config/setupDB')

beforeEach(async () => {
  await cleanupTestDB() // Limpia todo entre tests
})
```

### 3. disconnectTestDB() [NUEVA]

Cierra la conexión de mongoose

```javascript
const { disconnectTestDB } = require('../src/config/setupDB')

afterAll(async () => {
  await disconnectTestDB()
})
```

---

## 🎯 Patrón Recomendado para Tests

### Opción 1: Limpieza por modelo (actual)

```javascript
const User = require('../src/models/user.model')
const { connectTestDB } = require('../src/config/setupDB')

beforeAll(async () => {
  await connectTestDB()
})

beforeEach(async () => {
  await User.deleteMany({}) // Solo limpia users
})

afterAll(async () => {
  await User.deleteMany({})
  await mongoose.connection.close()
})
```

**Ventajas:** Control específico, solo limpia lo necesario  
**Desventajas:** Debes especificar cada modelo

---

### Opción 2: Limpieza total (nueva función)

```javascript
const {
  connectTestDB,
  cleanupTestDB,
  disconnectTestDB,
} = require('../src/config/setupDB')

beforeAll(async () => {
  await connectTestDB()
})

beforeEach(async () => {
  await cleanupTestDB() // Limpia TODAS las colecciones
})

afterAll(async () => {
  await cleanupTestDB()
  await disconnectTestDB()
})
```

**Ventajas:** Más simple, garantiza DB limpia  
**Desventajas:** Puede ser más lento si tienes muchas colecciones

---

## ⚡ Mejores Prácticas

### 1. Verificar variables de entorno en tests

```javascript
beforeAll(() => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está configurado para tests')
  }
})
```

### 2. Timeout apropiado

```javascript
jest.setTimeout(30000) // 30 segundos para tests con DB
```

### 3. Tests en paralelo vs secuencial

```bash
# Paralelo (más rápido) - usa workers
npm test

# Secuencial (más predecible) - 1 worker
npm test -- --runInBand
```

### 4. Ver qué worker está ejecutando

El código ya muestra en consola:

```
[Test DB] Usando base de datos: cinemax-test-worker-1
[Test DB] Conexión exitosa a: cinemax-test-worker-1
```

---

## 🗑️ Limpieza de DBs de Test (MongoDB Atlas)

Las DBs de test se acumulan con el tiempo. Para limpiarlas:

### Opción 1: Manualmente en Atlas

1. Ve a MongoDB Atlas
2. Collections → Verás múltiples DBs: `cinemax-test-worker-1`, `cinemax-test-worker-2`, etc.
3. Elimina las que no uses

### Opción 2: Script de limpieza (crear si es necesario)

```javascript
// scripts/cleanup-test-dbs.js
const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function cleanupTestDatabases() {
  await client.connect()
  const databases = await client.db().admin().listDatabases()

  for (const db of databases.databases) {
    if (db.name.includes('-test-worker-')) {
      console.log(`Eliminando ${db.name}...`)
      await client.db(db.name).dropDatabase()
    }
  }

  await client.close()
  console.log('✅ Limpieza completa')
}

cleanupTestDatabases()
```

---

## 🚀 Mejora Futura: MongoDB Memory Server

Para tests **MÁS rápidos** y sin depender de Atlas:

```bash
npm install -D mongodb-memory-server
```

```javascript
// setupDB.js (versión con memory server)
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

async function connectTestDB() {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
}

async function disconnectTestDB() {
  await mongoose.disconnect()
  await mongoServer.stop()
}
```

**Ventajas:**

- ✅ No usa internet/Atlas
- ✅ Más rápido
- ✅ No acumula DBs
- ✅ Perfecto para CI/CD

**Desventajas:**

- ❌ Requiere más RAM
- ❌ No prueba la conexión real a Atlas
