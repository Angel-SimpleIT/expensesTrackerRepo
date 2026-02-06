
### Project Overview

Construcción de una interfaz de registro de gastos "invisible" basada en mensajería (WhatsApp/Telegram) que utiliza un motor de Procesamiento de Lenguaje Natural (LLM) para eliminar la fricción de entrada y genera un dataset estructurado y anonimizado para análisis B2B.

### Problema a Resolver

1. **Fricción (B2C):** Las apps actuales requieren demasiados pasos (abrir, autenticar, categorizar, guardar), lo que destruye la retención.
2. **Calidad de Data (B2B):** Los datos de consumo actuales están dispersos o son puramente bancarios (sin contexto). Este MVP captura el "gasto hormiga" y efectivo con categorización inteligente.

### Objetivo Principal

Validar si el registro en <3 segundos mediante texto/voz aumenta la frecuencia de uso y si la data resultante tiene integridad suficiente para modelos de analítica de consumo.

---

## Nivel 2: Computational

### Key Features (MoSCoW)

| Prioridad | Funcionalidad | Especificación Técnica |
| --- | --- | --- |
| **Must** | **NLP Parsing** | Extracción de `monto`, `moneda`, `categoría` y `comercio` desde lenguaje natural. |
| **Must** | **Smart Currency** | Jerarquía de detección: 1. Explícita en texto > 2. Moneda base del perfil. |
| **Must** | **Bot Interface** | Integración con API de Telegram/WhatsApp como canal principal de entrada. |
| **Should** | **Normalización de Data** | Conversión automática a USD en backend para analítica agregada (vía API externa). |
| **Should** | **Dashboard Web** | Vista de lectura simple para que el usuario consulte sus totales mensuales. |
| **Could** | **OCR de Tickets** | Procesamiento de imágenes de recibos mediante Vision AI. |
| **Won’t Have** | **Trading, Inversiones, Criptomonedas, Soporte multi-cuenta bancaria.** | Evita sobrecargar la UI y diluir la propuesta de valor. |

### Metas y Milestones

* **M1 (Semana 2):** Backend funcional con integración a LLM y precisión de parsing >90%.
* **M2 (Semana 4):** Beta cerrada con 50 usuarios reales registrando transacciones diarias.
* **M3 (Semana 6):** Generación del primer reporte de tendencias de consumo (Data Product MVP).

### Criterios de Éxito (KPIs)

* **Time-to-Log:** < 5 segundos desde la intención hasta la confirmación.
* **Retention D7:** > 40% de usuarios activos registrando al menos un gasto diario.
* **Data Integrity:** < 5% de registros corregidos manualmente por el usuario.

---

## Nivel 3: Procedural

### Especificaciones Técnicas

* **Stack:** Node.js (FastAPI/Express), DB PostgreSQL (Transaccional) en supabase con RLS, Supabase Auth, Edge functions, Supabase Storage.
* **Motor de IA:** GPT-4o-mini para extracción de entidades.
* **Esquema de Salida IA (JSON):**

```json
{
  "raw_text": "20 dolares en starbucks",
  "entities": {
    "amount": 20.00,
    "currency": "USD",
    "category": "Food & Drinks",
    "merchant": "Starbucks",
    "detected_explicitly": true
  }
}

```

### Lógica de Manejo de Monedas

1. **Onboarding:** El usuario define su `home_currency` (ej. MXN).
2. **Inferencia:** * Si el mensaje dice "50", el sistema registra "50 MXN".
* Si el mensaje dice "10 usd", el sistema registra "10 USD" y guarda el valor convertido a MXN usando el tipo de cambio del día para el dashboard.


3. **Normalización B2B:** Cada transacción genera una entrada en una tabla espejo anonimizada con el monto convertido a `normalized_usd` para facilitar el análisis macro.

### Flujos de Usuario

1. **Registro Rápido:** Usuario envía mensaje -> IA procesa -> Bot confirma con un ✅ y el detalle -> Fin.
2. **Corrección:** Usuario envía mensaje -> IA interpreta mal -> Usuario presiona botón "Editar" en el bot -> Abre micro-formulario web.

### Edge Cases y Manejo de Errores

* **Falta de datos:** Si el usuario dice "Gasté en el cine", el bot responde: "¿Cuánto gastaste en el cine?".
* **Ambigüedad de moneda:** Si el usuario está en Colombia pero registra "20 dólares", el sistema prioriza la moneda mencionada explícitamente sobre la local.
* **Falla de API:** Si el LLM no responde, el mensaje se guarda como "Pendiente" y se procesa asíncronamente cuando el servicio se restablezca.

### Seguridad y Privacidad

* **Anonimización:** Los reportes B2B eliminan `user_id`, `phone_number` y `exact_location`, sustituyéndolos por `cohort_id` y `region_code`.
* **Cumplimiento:** Encriptación de datos sensibles en tránsito y reposo.

---