# INFORME DE EXPOSICIÓN: EVALUACIÓN DE RENDIMIENTO Y ESTRÉS
## Proyecto: Sistema de Gestión de Cine
**Materia:** Pruebas de Software  
**Estudiante:** Pablo Zurita  
**Fecha:** 12 de febrero de 2024  

---

## 1. INTRODUCCIÓN Y CONTEXTO
El objetivo de esta fase de pruebas es evaluar la **resiliencia y estabilidad** del backend ante diferentes escenarios de carga. Se han utilizado dos herramientas líderes en la industria: **JMeter** para pruebas de estrés masivo y **k6** para validación de niveles de servicio (SLAs) bajo carga controlada.

---

## 2. PRUEBAS DE ESTRÉS (APACHE JMETER)
Esta prueba busca el **punto de quiebre** del sistema, sometiéndolo a una demanda superior a la capacidad esperada.

### 2.1. Diseño del Escenario
- **Carga Nominal:** 100 usuarios virtuales (threads) simultáneos.
- **Ramp-up period:** 10 segundos (entrada de 10 usuarios/seg).
- **Intensidad:** 10 iteraciones por usuario (5,000 muestras totales).
- **Flujo Transaccional:** Autenticación JWT → Consulta de Catálogo → Gestión de Funciones.

### 2.2. Resultados Obtenidos
| Métrica                       | Valor Real   | Observación Técnica                                         |
| :---------------------------- | :----------- | :---------------------------------------------------------- |
| **Throughput (Rendimiento)**  | **8.71 TPS** | Capacidad máxima de procesamiento del servidor.             |
| **Tiempo de Respuesta (Avg)** | **13.84 s**  | Latencia afectada por restricciones de CPU (Tier Gratuito). |
| **Tasa de Error**             | **0.04%**    | Integridad casi total del servicio bajo presión.            |

### 2.3. Interpretación Analítica (Persona 3)
> [!IMPORTANT]
> **Análisis de Resiliencia:** A pesar de la alta latencia, el sistema demostró una robustez excepcional. La baja tasa de error indica que el backend gestiona correctamente el **encolado de peticiones (queueing)** sin colapsar ni corromper las sesiones JWT. El cuello de botella es estrictamente de **infraestructura (CPU/RAM)** y no de lógica de código.

---

## 3. PRUEBAS DE CARGA (K6 - PERFORMANCE AS CODE)
Validación táctica del comportamiento del sistema en condiciones de tráfico normalizado.

### 3.1. Configuración del Script (Stages)
El escenario se definió mediante código JavaScript para garantizar repetibilidad:
1. **Ramp-up (20s):** Escalado gradual hasta 5 usuarios.
2. **Sustain (40s):** Carga constante para evaluar estabilidad térmica.
3. **Ramp-down (20s):** Desconexión controlada.

### 3.2. Umbrales de Aceptación (Thresholds)
- **Latencia:** p(95) < 800ms (El 95% de peticiones debe ser veloz).
- **Fiabilidad:** Tasa de error < 1%.

### 3.3. Análisis Comparativo
| Característica  | JMeter (Estrés)                     | k6 (Carga)                            |
| :-------------- | :---------------------------------- | :------------------------------------ |
| **Objetivo**    | Romper el sistema / Hallar límites. | Validar SLAs / Día a día.             |
| **Resultado**   | Estable pero lento (8.7 TPS).       | Rápido y fluido (Dentro de umbrales). |
| **Caso de Uso** | Análisis de capacidad crítica.      | Integración Continua (CI/CD).         |

---

## 4. CONCLUSIONES TÉCNICAS Y RECOMENDACIÓN
1. **Lógica Optimizada:** El manejo de la base de datos y la seguridad responde correctamente a nivel de software.
2. **Limitación de Infraestructura:** El "Tier Gratuito" de Render impone un techo físico al Throughput.
3. **Recomendación:** Para producción masiva, se recomienda el **escalado vertical** de la instancia de cómputo para reducir los tiempos de respuesta por debajo del segundo bajo carga.

---
*Este documento constituye el soporte técnico para la defensa del 3er Parcial.*
