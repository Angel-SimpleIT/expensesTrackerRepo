# BLUEPRINT: SMARTSPEND (SUPABASE BaaS)

# 1. Esquema de Datos (Estructura de "Datos Enriquecidos")

* **profiles**: `id` (uuid, fk auth.users), `full_name`, `role` (user/admin_b2b), `home_currency`, `bot_user_id` (ID de WhatsApp), `pairing_code` (6 dígitos), `zip_code` (5 dígitos), `age_cohort` (rango edad).
* **categories**: `id`, `user_id` (uuid, opcional para personalizadas), `name`, `icon` (lucide-name), `keywords` (text[] para entrenamiento IA).
* **transactions**:
* `id`, `user_id` (fk profiles).
* `raw_text` (mensaje original de WhatsApp).
* `amount_original`, `currency_original`.
* `amount_base` (moneda del usuario), `amount_usd` (normalización B2B).
* `category_id` (fk categories), `merchant_name`.
* `is_ai_confirmed` (bool), `created_at` (timestamptz).


* **exchange_rates**: `base_currency` (PK), `rates` (jsonb), `updated_at`.

## 2. Reglas de Seguridad (RLS)

1. **Profiles**: El usuario lee su propia fila. El `admin_b2b` no tiene acceso a perfiles individuales.
2. **Transactions**:
* `user`: Permiso total (CRUD) sobre sus registros propios.
* `admin_b2b`: **Acceso Denegado**. No puede leer esta tabla directamente.


3. **Categories**: Lectura para todos (si `user_id` es NULL). Usuario crea/edita solo las suyas.

## 3. Vistas Anónimas (Capa B2B)

* **b2b_market_insights**: Vista que agrupa datos de `transactions` y `profiles`.
* Campos: `category`, `merchant_name`, `amount_usd`, `zip_code`, `age_cohort`, `created_at`.
* **Regla**: Solo accesible para `role = 'admin_b2b'`. Excluye `user_id` y `raw_text`.



## 4. Lógica de Negocio (Edge Functions)

* **whatsapp-webhook**:
1. Recibe mensaje de WhatsApp API.
2. Identifica al usuario por `bot_user_id`.
3. Envía `raw_text` a OpenAI (GPT-4o-mini) para parsing.
4. Consulta `exchange_rates` para normalización.
5. Inserta en `transactions`.


* **link-bot-user**: Valida el `pairing_code` generado en el frontend y vincula el `bot_user_id` al perfil del usuario.

## 5. Realtime

* Habilitar `REPLICA` en la tabla `transactions`. Esto permite que el dashboard de "Santi" se actualice instantáneamente en cuanto el bot confirme un gasto en WhatsApp.

---

### Implementación del Flujo de Vinculación (Pairing)

Para que el frontend que ya tienes funcione con este backend, la lógica de vinculación debe ser robusta:

1. **Frontend**: Genera código y lo guarda en `profiles.pairing_code`.
2. **WhatsApp**: Santi envía "CONECTAR 123456".
3. **Backend**: La Edge Function busca el código, hace el "match" y limpia el campo `pairing_code`.

