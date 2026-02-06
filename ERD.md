 
### 1. Arquitectura de Datos (ERD)

Esta estructura asegura que capturemos el contexto que las apps bancarias pierden, manteniendo la privacidad.

#### A. Tabla `profiles` (El contexto de Carla)

* `id`: UUID (vinculado a Supabase Auth).
* `home_currency`: Moneda base (ej. 'MXN').
* `zip_code`: Clave para segmentación geográfica B2B.
* `age_cohort`: Rango de edad (ej. '25-34') — *Evitamos fecha exacta por privacidad*.
* `gender`: Para patrones de consumo demográficos.

#### B. Tabla `categories` (Personalización de Santi)

* `id`: UUID.
* `user_id`: UUID (Si es NULL, es una categoría global; si tiene ID, es personalizada).
* `name`: Nombre (ej. 'Café y Snacks').
* `icon`: String del icono (ej. 'Coffee').
* `keywords`: Array de texto (ej. ['starbucks', 'espresso', 'cafeteria']) — *Esto ayuda a la IA a aprender*.

#### C. Tabla `transactions` (El motor de la app)

* `amount_original`: Lo que Santi gastó (ej. 5.00).
* `currency_original`: Moneda del gasto (ej. 'EUR').
* `amount_base`: El valor convertido a la moneda de Santi (ej. 95.00 MXN).
* `amount_usd`: **El valor normalizado para Carla** (ej. 5.40 USD) — *Esencial para comparar datos globales*.
* `raw_text`: El mensaje original del chat (ej. "5 euritos en café").
* `merchant_name`: Nombre del lugar extraído por la IA.
* `is_ai_confirmed`: Booleano (Si Santi lo editó o lo aceptó tal cual)