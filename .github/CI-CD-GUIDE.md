# 🚀 CI/CD Pipeline - Cinema Tests

## 📋 Resumen del Flujo

```
Push a GitHub → GitHub Actions ejecuta → Tests + Linting → Deploy automático
                      ↓
    ┌─────────────────┴─────────────────┐
    │                                   │
Backend CI                         Frontend CI
- ESLint                          - Karma/Jasmine
- Jest Tests                      - Build Angular
    ↓                                   ↓
Render redeploy                   Vercel redeploy
(automático)                      (automático)
```

---

## ⚙️ Configuración de Secrets en GitHub

### Paso 1: Ir a Settings del Repositorio

1. Ve a tu repo: `https://github.com/luis-sagx/cinema-tests`
2. Click en **"Settings"**
3. En el menú izquierdo: **"Secrets and variables"** → **"Actions"**
4. Click en **"New repository secret"**

### Paso 2: Agregar los Secrets

Agrega estos 2 secrets:

#### Secret 1: MONGODB_URI

```
Name: MONGODB_URI
Secret: mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

_(Usa tu connection string real de MongoDB Atlas)_

#### Secret 2: JWT_SECRET

```
Name: JWT_SECRET
Secret: tu_jwt_secret_aqui
```

_(Usa el mismo que tienes en tu .env de backend)_

---

## 📁 Workflows Creados

### 🔵 Backend CI ([.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml))

**Se ejecuta cuando:**

- Haces push a `main` o `develop`
- Hay cambios en la carpeta `backend/`
- Creas un Pull Request

**Pasos que ejecuta:**

1. ✅ Checkout del código
2. ✅ Instala Node.js 20
3. ✅ Instala dependencias (`npm ci`)
4. ✅ Ejecuta ESLint (`npm run lint`)
5. ✅ Ejecuta tests con Jest (`npm test`)
6. ✅ Sube reporte de coverage

**Resultado:** Si todo pasa, Render detecta el push y redeploy automáticamente.

---

### 🟢 Frontend CI ([.github/workflows/frontend-ci.yml](.github/workflows/frontend-ci.yml))

**Se ejecuta cuando:**

- Haces push a `main` o `develop`
- Hay cambios en la carpeta `frontend/`
- Creas un Pull Request

**Pasos que ejecuta:**

1. ✅ Checkout del código
2. ✅ Instala Node.js 20
3. ✅ Instala dependencias (`npm ci`)
4. ✅ Ejecuta tests Karma/Jasmine (headless)
5. ✅ Build de producción
6. ✅ Verifica output del build

**Resultado:** Si todo pasa, Vercel detecta el push y redeploy automáticamente.

---

## 🎯 Flujo Completo de Trabajo

### 1️⃣ Desarrollo Local

```bash
# Backend
cd backend
npm run dev         # Servidor en localhost:3000
npm run lint        # Verificar código
npm test            # Ejecutar tests

# Frontend
cd frontend
npm start           # App en localhost:4200
npm test            # Ejecutar tests
```

### 2️⃣ Commit y Push

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

### 3️⃣ GitHub Actions (Automático)

- ⏳ GitHub Actions ejecuta workflows
- ✅ Si pasan los tests → Deploy continúa
- ❌ Si fallan los tests → Deploy bloqueado

### 4️⃣ Deploy Automático

- **Render**: Detecta cambios en `/backend` → Redeploy
- **Vercel**: Detecta cambios en `/frontend` → Redeploy

### 5️⃣ Aplicación Actualizada

- Backend: `https://cinema-tests.onrender.com`
- Frontend: `https://cinema-tests.vercel.app` (o tu dominio)

---

## 🔍 Verificar el Estado de CI/CD

### Ver Workflows en GitHub

1. Ve a tu repositorio
2. Click en la pestaña **"Actions"**
3. Verás todos los workflows ejecutándose

### Badges (Opcional)

Puedes agregar badges al README principal:

```markdown
![Backend CI](https://github.com/luis-sagx/cinema-tests/actions/workflows/backend-ci.yml/badge.svg)
![Frontend CI](https://github.com/luis-sagx/cinema-tests/actions/workflows/frontend-ci.yml/badge.svg)
```

---

## 🛠️ Comandos Útiles

### Forzar ejecución de workflow específico

```bash
# Hacer un cambio pequeño en el workflow
git add .github/workflows/backend-ci.yml
git commit -m "Trigger backend CI"
git push
```

### Ver logs de GitHub Actions

```bash
# Usar GitHub CLI (opcional)
gh run list
gh run view [run-id]
```

---

## ⚠️ Troubleshooting

### ❌ Tests fallan en CI pero pasan localmente

**Causa:** Diferencia de environments
**Solución:** Verifica que los secrets estén configurados correctamente

### ❌ MongoDB connection error en tests

**Causa:** `MONGODB_URI` no configurado en GitHub Secrets
**Solución:** Agrega el secret como se explicó arriba

### ❌ Frontend tests timeout

**Causa:** ChromeHeadless no disponible
**Solución:** El workflow ya usa ChromeHeadless, si falla revisa las dependencias

### ❌ Build falla en Vercel/Render

**Causa:** Error en el código que pasó los tests
**Solución:** Revisa los logs en Vercel/Render dashboard

---

## 📊 Monitoreo

### GitHub Actions

- **Dashboard**: `https://github.com/luis-sagx/cinema-tests/actions`
- **Notificaciones**: GitHub te envía emails si fallan los workflows

### Render

- **Logs**: Dashboard de Render → Tu servicio → "Logs"
- **Status**: Muestra el estado del deploy

### Vercel

- **Deployments**: Dashboard de Vercel → Tu proyecto → "Deployments"
- **Preview URLs**: Vercel crea previews automáticas para cada push

---

## ✅ Checklist de Configuración

- [ ] Workflows creados en `.github/workflows/`
- [ ] Secrets configurados en GitHub (MONGODB_URI, JWT_SECRET)
- [ ] Backend desplegado en Render
- [ ] Frontend desplegado en Vercel
- [ ] CORS configurado en backend
- [ ] Environments configurados en frontend
- [ ] Tests pasan localmente
- [ ] Hacer un push de prueba

---

## 🎉 ¡Todo listo!

Ahora cada vez que hagas push a `main`:

1. ✅ GitHub Actions ejecuta tests automáticamente
2. ✅ Si pasan, Render y Vercel despliegan automáticamente
3. ✅ Tu app está actualizada en producción en minutos

**Siguiente paso:** Hacer commit y push de estos cambios para probar el flujo completo.
