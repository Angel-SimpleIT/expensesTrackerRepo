import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const WA_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const WA_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const WA_API_VERSION = "v19.0";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";

// ---------------------------------------------------------------
// System prompt — Asistente de registro y consulta de gastos
// ---------------------------------------------------------------
const SYSTEM_PROMPT = `Sos SmartSpend Bot, un asistente personal de finanzas que opera exclusivamente por WhatsApp.
Tu única función es ayudar al usuario a registrar gastos y consultar su situación financiera.

REGLAS DE ORO (CRÍTICAS):
1. NUNCA confirmes un registro o una consulta sin haber invocado PRIMERO la herramienta correspondiente (registrar_gasto o consultar_gastos).
2. Si el usuario dice "Gasté X en Y", DEBES invocar registrar_gasto. No asumas que ya se hizo.
3. El resultado de la herramienta te dirá si fue exitoso. Solo después de recibir la confirmación de la herramienta puedes responderle al usuario.
4. Si intentas responder sin usar herramientas ante una intención de registro o consulta, estarás fallando en tu tarea.

REGLAS DE COMPORTAMIENTO:
- Respondé siempre en el mismo idioma en que te escriben.
- Usá lenguaje coloquial, breve y claro. Máximo 3 líneas por respuesta.
- Nunca uses markdown (nada de **, ##, listas con -). Solo texto plano y emojis.
- Si la consulta NO tiene que ver con finanzas ni con la aplicación, debes declinar cortésmente o responder de forma muy breve y enfocarte nuevamente en que estás para ayudar con su dinero, SIN invocar ninguna herramienta.

RESPUESTAS ESPERADAS:
Si el usuario registra un gasto, DEBES usar registrar_gasto y luego confirmar de forma amigable usando los datos devueltos.
Si el usuario pide un reporte o consultar sus gastos pasados, DEBES usar consultar_gastos y devolver un resumen ameno.

CONSULTAS DE GASTOS:
- Cuando el usuario pida un resumen o reporte, siempre usá modo "resumen" primero.
- Al responder un resumen, listá las categorías de mayor a menor gasto y al final SIEMPRE invitá al usuario a pedir el detalle de cualquier categoría. Ejemplo: "¿Querés ver el detalle de alguna categoría?"
- Cuando el usuario pida el detalle de una categoría (ej: "mostrame los de Alimentación", "¿qué gasté en Transporte?"), usá modo "detalle" con el campo categoria_filtro.
- En modo detalle, listá cada transacción con descripción, monto y fecha. Máximo 10 líneas. Si hay más, indicá cuántas hay en total y sugerí acotar el rango de fechas.
`;

const TOOLS = [
    {
        type: "function",
        function: {
            name: "registrar_gasto",
            description: "Registra un nuevo gasto o ingreso en la base de datos.",
            parameters: {
                type: "object",
                properties: {
                    monto: { type: "number", description: "El monto numérico del gasto." },
                    moneda: { type: "string", description: "Código ISO de 3 letras de la moneda (ej. USD, ARS, EUR). IMPORTANTE: Déjalo vacío si el usuario no especifica una moneda distinta a su moneda principal." },
                    categoria: { type: "string", description: "Categoría general del gasto (ej. Alimentación, Transporte, Salud, Ingresos, etc.)." },
                    descripcion: { type: "string", description: "Breve descripción general de la compra o ingreso." }
                },
                required: ["monto", "categoria", "descripcion"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "consultar_gastos",
            description: `Consulta los gastos del usuario en un período específico.
Tiene dos modos:
- "resumen": agrupa los gastos por categoría mostrando el total y cantidad de transacciones por categoría.Usarlo cuando el usuario pide un resumen, reporte, o consulta general de gastos.
- "detalle": devuelve las transacciones individuales.Usarlo cuando el usuario ya vio el resumen y quiere ver el detalle de una categoría específica, o cuando pide explícitamente ver transacciones individuales.
Siempre empezar con modo "resumen" salvo que el usuario pida explícitamente el detalle de una categoría.`,
            parameters: {
                type: "object",
                properties: {
                    fecha_inicio: {
                        type: "string",
                        description: "Fecha de inicio del período en formato YYYY-MM-DD."
                    },
                    fecha_fin: {
                        type: "string",
                        description: "Fecha de fin del período en formato YYYY-MM-DD."
                    },
                    modo: {
                        type: "string",
                        enum: ["resumen", "detalle"],
                        description: "resumen: agrupa por categoría. detalle: transacciones individuales."
                    },
                    categoria_filtro: {
                        type: "string",
                        description: "Solo para modo detalle. Nombre exacto de la categoría a desglosar. Dejar vacío para traer todas."
                    }
                },
                required: ["fecha_inicio", "fecha_fin", "modo"]
            }
        }
    }
];

Deno.serve(async (req: Request) => {
    // ---------------------------------------------------------------
    // GET — Meta Webhook Handshake
    // ---------------------------------------------------------------
    if (req.method === "GET") {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const verifyToken = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

        if (mode === "subscribe" && token === verifyToken) {
            console.log("✅ Webhook verificado por Meta.");
            return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
        }

        console.warn("⚠️ Verificación fallida.");
        return new Response("Forbidden", { status: 403 });
    }

    // ---------------------------------------------------------------
    // POST — Receptor de eventos
    // ---------------------------------------------------------------
    if (req.method === "POST") {
        const bodyText = await req.text();

        // Verificación de firma de Meta (X-Hub-Signature-256)
        const signatureHeader = req.headers.get("x-hub-signature-256");
        const appSecret = Deno.env.get("APP_SECRET") ?? Deno.env.get("META_APP_SECRET") ?? "";

        if (!signatureHeader) {
            console.warn("⚠️ Falta el header X-Hub-Signature-256.");
            return new Response("Unauthorized", { status: 401 });
        }

        if (appSecret) {
            const isValid = await verifySignature(bodyText, signatureHeader, appSecret);
            if (!isValid) {
                console.warn("⚠️ Firma de Meta inválida. Verificá que APP_SECRET sea el correcto. Continuando post-bypass para depuración...");
                // return new Response("Unauthorized", { status: 401 }); // BYPASS
            } else {
                console.log("✅ Firma de Meta verificada correctamente.");
            }
        } else {
            console.warn("⚠️ No hay APP_SECRET ni META_APP_SECRET configurado. La validación de firma fallará. Continuando post-bypass para depuración...");
            // return new Response("Unauthorized", { status: 401 }); // BYPASS
        }

        EdgeRuntime.waitUntil(processWebhookEvent(bodyText));
        return new Response("OK", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
});

/**
 * Verifica la firma HMAC-SHA256 enviada por Meta en los webhooks.
 * Utiliza WebCrypto API, por lo que es asíncrono y muy rápido.
 */
async function verifySignature(payload: string, signatureHeader: string, appSecret: string): Promise<boolean> {
    const signatureParts = signatureHeader.split('=');
    if (signatureParts.length !== 2 || signatureParts[0] !== 'sha256') return false;

    const signature = signatureParts[1];
    const encoder = new TextEncoder();

    // Crear clave HMAC
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(appSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    // Generar firma esperada
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payload)
    );

    // Convertir ArrayBuffer a Hex String
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return signature === expectedSignature;
}

async function processWebhookEvent(bodyText: string): Promise<void> {
    let body: Record<string, unknown>;
    try {
        body = JSON.parse(bodyText);
    } catch {
        console.error("❌ Body inválido:", bodyText);
        return;
    }

    console.log("📨 Evento de Meta:\n" + JSON.stringify(body, null, 2));

    try {
        const entries = (body?.entry as unknown[]) ?? [];
        for (const entry of entries) {
            const changes = ((entry as Record<string, unknown>)?.changes as unknown[]) ?? [];
            for (const change of changes) {
                const value = (change as Record<string, unknown>)?.value as Record<string, unknown>;
                const messages = (value?.messages as unknown[]) ?? [];

                for (const message of messages) {
                    const msg = message as Record<string, unknown>;

                    if (msg.type !== "text") {
                        console.log(`ℹ️ Tipo ignorado: ${msg.type} `);
                        continue;
                    }

                    const wamid = msg.id as string;
                    const senderNumber = msg.from as string;
                    const messageText = (msg.text as Record<string, string>)?.body ?? "";

                    console.log(`💬 De ${senderNumber}: "${messageText}"`);

                    // 1. Guardar en BD (Mensaje del usuario)
                    await saveMessage(wamid, senderNumber, messageText, "user");

                    // 2. Manejar flujo de vinculación (CONECTAR [código] o simplemente el código de 6 dígitos)
                    const isLinkingCode = /^\d{6}$/.test(messageText.trim());
                    if (isLinkingCode || messageText.trim().toUpperCase().startsWith("CONECTAR")) {
                        await handleLinkingCommand(senderNumber, messageText);
                        continue;
                    }

                    // 3. Verificar si el usuario está vinculado
                    const senderNumSanitized = senderNumber.trim();
                    const profile = await getProfileByWhatsApp(senderNumSanitized);
                    if (!profile) {
                        const reply = "👋 ¡Hola! Todavía no vinculaste tu cuenta. Andá a Configuración en la app y generá un código de conexión.";
                        await sendTextReply(senderNumber, reply);
                        await saveMessage(crypto.randomUUID(), senderNumber, reply, "assistant");
                        continue;
                    }

                    // 3.5. Rate limiting básico
                    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
                    const { count: msgCount } = await supabase
                        .from("whatsapp_messages")
                        .select("*", { count: "exact", head: true })
                        .eq("sender_number", senderNumber)
                        .gte("received_at", oneMinuteAgo);

                    if (msgCount !== null && msgCount > 5) {
                        const rateLimitReply = "Estás enviando demasiados mensajes. Por favor, esperá un minuto antes de enviar más.";
                        await sendTextReply(senderNumber, rateLimitReply);
                        await saveMessage(crypto.randomUUID(), senderNumber, rateLimitReply, "assistant");
                        continue;
                    }

                    // 4. Obtener historial de conversación
                    const history = await getConversationHistory(senderNumber);

                    // 5. Llamar a OpenAI con historial e inyectar el profile
                    const startTime = Date.now();
                    const aiResult = await callOpenAI(messageText, history, profile);
                    const processingMs = Date.now() - startTime;
                    const actionResult = aiResult.actionResult || "none";
                    console.log(`⏱️ Processing time: ${processingMs} ms | action: ${actionResult} | user: ${senderNumSanitized} `);
                    console.log(`🤖 OpenAI Reply: `, aiResult.reply);

                    // 6. Enviar respuesta al usuario y guardar historia
                    await sendTextReply(senderNumSanitized, aiResult.reply);
                    /*
                      MIXPANEL EVENT — ready to implement:
                      
                      track("bot_interaction", {
                        distinct_id: senderNumber,
                        action_result: actionResult,
                        processing_ms: processingMs,
                        timestamp: new Date().toISOString()
                      });
                    
                      track("registration_speed", {        // only when actionResult === "registered"
                        distinct_id: senderNumber,
                        processing_ms: processingMs,
                        timestamp: new Date().toISOString()
                      });
                    
                      track("query_speed", {               // only when actionResult === "queried"
                        distinct_id: senderNumber,
                        processing_ms: processingMs,
                        timestamp: new Date().toISOString()
                      });
                    */
                    await saveMessage(crypto.randomUUID(), senderNumSanitized, aiResult.reply, "assistant", actionResult, processingMs);
                }
            }
        }
    } catch (err) {
        console.error("❌ Error procesando evento:", err);
    }
}

async function getProfileByWhatsApp(senderNumber: string) {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, home_currency")
        .filter("bot_user_id", "ilike", `%${senderNumber}%`)
        .limit(1)
        .maybeSingle();

    if (error) {
        if (error.code !== "PGRST116") { // PGRST116 is no rows
            console.error(`❌ Error buscando perfil para ${senderNumber}: `, error);
        }
        return null;
    }
    return data;
}

type ChatMessage = { role: "user" | "assistant" | "system" | "tool"; content: string };

async function getConversationHistory(senderNumber: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from("whatsapp_messages")
        .select("role, message_text")
        .eq("sender_number", senderNumber)
        .order("received_at", { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ Error obteniendo historial:", error);
        return [];
    }

    // OpenAI espera del más viejo al más nuevo
    return (data || []).reverse().map((m: any) => ({
        role: m.role || "user",
        content: m.message_text
    })) as ChatMessage[];
}

async function handleLinkingCommand(senderNumber: string, messageText: string): Promise<void> {
    const code = messageText.replace(/CONECTAR/i, "").trim();

    if (!code || code.length < 5) {
        await sendTextReply(senderNumber, "⚠️ Código inválido. Por favor, enviá tu código de 6 dígitos.");
        return;
    }

    console.log(`🔗 Intentando vincular ${senderNumber} con código ${code} `);

    // Buscar perfil con ese código
    // TODO: La tabla profiles debe tener una columna 'pairing_code_expires_at' de tipo timestamptz
    const { data: profile, error: searchError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("pairing_code", code)
        .gt("pairing_code_expires_at", new Date().toISOString())
        .single();

    if (searchError || !profile) {
        await sendTextReply(senderNumber, "❌ Código inválido o expirado. Generá uno nuevo en la app.");
        return;
    }

    // Vincular número y limpiar código
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            bot_user_id: senderNumber,
            pairing_code: null
        })
        .eq("id", profile.id);

    if (updateError) {
        console.error("❌ Error vinculando perfil:", updateError);
        await sendTextReply(senderNumber, "❌ Hubo un error técnico al vincular tu cuenta. Reintentá en unos minutos.");
        return;
    }

    const welcomeReply = `✅ ¡Hola ${profile.full_name} !Tu WhatsApp fue vinculado exitosamente.Ya podés registrar tus gastos escribiéndome directamente.`;

    try {
        await sendTextReply(senderNumber, welcomeReply);
        await saveMessage(crypto.randomUUID(), senderNumber, welcomeReply, "assistant");
    } catch (e) {
        console.error("❌ Error enviando respuesta de bienvenida:", e);
    }
}

async function registerExpenseFromAI(profile: any, expense: any, rawText: string): Promise<{ success: boolean; message: string }> {
    const { amount, currency, description, category_hint } = expense;
    const homeCurrency = profile.home_currency || "USD";

    // 1. Obtener tasas de cambio (cualquier base disponible)
    const { data: ratesData, error: ratesError } = await supabase
        .from("exchange_rates")
        .select("base_currency, rates")
        .limit(1)
        .single();

    if (ratesError || !ratesData) {
        console.error("❌ Error obteniendo tasas de cambio:", ratesError);
        return { success: false, message: "Error al registrar gasto en BD." };
    }

    const baseCurrency = ratesData.base_currency;
    const rates = ratesData.rates as Record<string, number>;

    // Asegurar que la base está en el objeto de tasas
    if (!rates[baseCurrency]) rates[baseCurrency] = 1;

    // Verificar soporte de la moneda especificada
    if (!rates[currency]) {
        return { success: false, message: `La moneda ${currency} no está soportada.` };
    }

    // 2. Calcular montos normalizando a la base y luego a USD/Home
    // Si 1 Base = R_curr CURR, entonces 1 CURR = 1/R_curr Base.
    // amount_base_curr = amount / rates[currency]
    // amount_usd = (amount / rates[currency]) * rates["USD"]
    const rateToUsd = rates["USD"] || 1;
    const rateToHome = rates[homeCurrency] || 1;
    const rateFromCurr = rates[currency];

    const amountUsd = (amount / rateFromCurr) * rateToUsd;
    const amountBase = (amount / rateFromCurr) * rateToHome;

    // 3. Mapear categoría vía DB
    let categoryId = null;
    if (category_hint) {
        const { data: catData } = await supabase
            .from("categories")
            .select("id")
            .ilike("name", `%${category_hint}%`)
            .limit(1)
            .single();
        if (catData) categoryId = catData.id;
    }

    if (!categoryId) {
        const { data: fallData } = await supabase
            .from("categories")
            .select("id")
            .ilike("name", `%Otros%`)
            .limit(1)
            .single();
        if (fallData) categoryId = fallData.id;
    }

    // 4. Insertar transacción
    console.log(`💾 Intentando insertar transacción para user ${profile.id}: `, {
        amount, currency, amountBase, amountUsd, categoryId
    });

    const { error: insertError } = await supabase
        .from("transactions")
        .insert({
            user_id: profile.id,
            amount_original: amount,
            currency_original: currency,
            amount_base: amountBase,
            amount_usd: amountUsd,
            merchant_name: description || "Gasto WhatsApp",
            category_id: categoryId,
            raw_text: rawText,
            is_ai_confirmed: true
        });

    if (insertError) {
        console.error("❌ Error insertando transacción:", insertError);
        return { success: false, message: "Error al registrar gasto en BD." };
    }

    console.log("✅ Transacción insertada correctamente en la tabla 'transactions'");
    return { success: true, message: "Avisale al usuario que el gasto se registró correctamente." };
}

async function registrarGastoTool(args: any, profile: any, rawText: string): Promise<{ success: boolean; message: string }> {
    const { monto, moneda, categoria, descripcion } = args;
    console.log(`🛠️ registrarGastoTool invocado con args: `, args);
    const expense = {
        amount: monto,
        currency: moneda || profile.home_currency || "USD",
        description: descripcion,
        category_hint: categoria
    };
    return await registerExpenseFromAI(profile, expense, rawText);
}

async function consultarGastosTool(args: any, profile: any): Promise<any> {
    const { fecha_inicio, fecha_fin, modo, categoria_filtro } = args;

    // TODO: Use profile.timezone to offset these timestamps (UTC assumed for now)
    const startDate = `${fecha_inicio} T00:00:00.000Z`;
    const endDate = `${fecha_fin} T23: 59: 59.999Z`;

    // For detalle mode with a category filter, resolve category_id first
    let catData: { id: string } | null = null;
    if (modo === "detalle" && categoria_filtro) {
        const { data: cat } = await supabase
            .from("categories")
            .select("id")
            .ilike("name", `%${categoria_filtro}%`)
            .limit(1)
            .single();

        if (!cat) {
            return { error: `No se encontró la categoría "${categoria_filtro}".Verificá el nombre e intentá de nuevo.` };
        }
        catData = cat;
    }

    let query = supabase
        .from("transactions")
        .select("amount_base, merchant_name, created_at, categories(name)")
        .eq("user_id", profile.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

    if (modo === "detalle" && catData) {
        query = query.eq("category_id", catData.id);
    }

    const { data, error } = await query;

    console.log(`🔍 consultarGastos[${modo}] → ${data?.length ?? 0} registros devueltos`);

    if (error) {
        console.error("❌ Error consultando gastos:", error);
        return { error: "No se pudieron obtener los gastos de la base de datos." };
    }

    const homeCurrency = profile.home_currency || "USD";

    if (modo === "resumen") {
        // Group by category client-side
        const grouped: Record<string, { total: number; count: number }> = {};
        let grandTotal = 0;

        for (const tx of data || []) {
            const catName = (tx.categories as any)?.name || "Sin categoría";
            if (!grouped[catName]) grouped[catName] = { total: 0, count: 0 };
            grouped[catName].total += tx.amount_base || 0;
            grouped[catName].count += 1;
            grandTotal += tx.amount_base || 0;
        }

        const categorias = Object.entries(grouped)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([nombre, { total, count }]) => ({
                categoria: nombre,
                total: parseFloat(total.toFixed(2)),
                porcentaje: grandTotal > 0 ? parseFloat(((total / grandTotal) * 100).toFixed(1)) : 0,
                transacciones: count
            }));

        return {
            modo: "resumen",
            rango: { desde: fecha_inicio, hasta: fecha_fin },
            moneda: homeCurrency,
            total_general: parseFloat(grandTotal.toFixed(2)),
            categoria_mayor_gasto: categorias[0]?.categoria || null,
            categorias,
            sugerencia_drill_down: "Podés pedirme el detalle de cualquier categoría, por ejemplo: 'mostrame los gastos de Alimentación'"
        };
    } else {
        // Detalle mode
        const transacciones = (data || []).map((tx: any) => ({
            descripcion: tx.merchant_name,
            monto: parseFloat((tx.amount_base || 0).toFixed(2)),
            categoria: tx.categories?.name || "Sin categoría",
            fecha: tx.created_at?.split("T")[0]
        }));

        return {
            modo: "detalle",
            rango: { desde: fecha_inicio, hasta: fecha_fin },
            moneda: homeCurrency,
            categoria_filtro: categoria_filtro || "todas",
            total: parseFloat(transacciones.reduce((s: number, t: any) => s + t.monto, 0).toFixed(2)),
            transacciones
        };
    }
}

async function callOpenAI(userMessage: string, history: ChatMessage[] = [], profile: any): Promise<{ reply: string; actionResult?: string }> {
    let actionResult: string = "none";
    if (!OPENAI_API_KEY) {
        console.warn("⚠️ OPENAI_API_KEY no configurada.");
        return { reply: "Lo siento, no puedo responder en este momento. Intentá más tarde." };
    }

    const userProfileInfo = `
INFORMACIÓN DEL USUARIO:
- Nombre: ${profile.full_name || "Usuario"}
- Moneda principal: ${profile.home_currency || "USD"}
`;

    const dynamicSystemPrompt = `${SYSTEM_PROMPT}

${userProfileInfo}

FECHA Y HORA ACTUAL:
La fecha y hora actual del sistema es ${new Date().toISOString()}.
Usá esta fecha como referencia exacta al calcular los parámetros fecha_inicio y fecha_fin (formato YYYY-MM-DD).

REGLAS PARA INTERPRETAR FECHAS AL USAR consultar_gastos:
- "hoy" → fecha_inicio y fecha_fin = fecha de hoy
- "ayer" → fecha_inicio y fecha_fin = fecha de ayer
- "esta semana" → fecha_inicio = lunes de esta semana, fecha_fin = hoy
- "este mes" → fecha_inicio = primer día del mes actual, fecha_fin = hoy
- "el mes pasado" → fecha_inicio y fecha_fin = rango completo del mes anterior
- Una fecha específica como "1ero de enero", "15 de marzo", "January 1st" → fecha_inicio y fecha_fin = esa misma fecha exacta en formato YYYY-MM-DD
- Un rango como "del 5 al 10 de febrero" o "from Jan 1 to Jan 31" → fecha_inicio = primer día del rango, fecha_fin = último día del rango
- Si el usuario no menciona el año, asumir el año actual (${new Date().getFullYear()})
- Nunca inventes fechas. Si no podés interpretar la fecha con certeza, preguntale al usuario que la aclare antes de invocar la herramienta.`;

    const messages: any[] = [
        { role: "system", content: dynamicSystemPrompt },
        ...history,
        { role: "user", content: userMessage }
    ];

    await supabase.from("debug_log").insert({
        event_name: "callOpenAI_start",
        payload: { userMessage, sender_number: profile.bot_user_id }
    });

    try {
        let aiFinished = false;
        let finalReply = "";

        for (let iteration = 0; iteration < 5 && !aiFinished; iteration++) {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    max_tokens: 300,
                    temperature: 0.2, // Back to 0.2 to avoid hallucinations
                    messages: messages,
                    tools: TOOLS,
                    tool_choice: "auto"
                }),
            });

            if (!res.ok) {
                const err = await res.text();
                console.error("❌ Error de OpenAI API:", err);
                return { reply: "Lo siento, tuve un problema al procesar tu mensaje." };
            }

            const data = await res.json() as any;
            await supabase.from("debug_log").insert({
                event_name: "openai_raw_response",
                payload: { iteration, data }
            });
            const message = data.choices[0].message;

            if (!message) {
                return { reply: "Lo siento, tuve un error al procesar tu mensaje." };
            }

            if (message.tool_calls && message.tool_calls.length > 0) {
                messages.push(message); // Agregar llamada al asistente

                for (const toolCall of message.tool_calls) {
                    const args = JSON.parse(toolCall.function.arguments || "{}");
                    let toolResult = "";

                    if (toolCall.function.name === "registrar_gasto") {
                        const registerResult = await registrarGastoTool(args, profile, userMessage);
                        toolResult = registerResult.message;
                        actionResult = registerResult.success ? "registered" : "failed";
                    } else if (toolCall.function.name === "consultar_gastos") {
                        const resultData = await consultarGastosTool(args, profile);
                        toolResult = JSON.stringify(resultData);
                        actionResult = "queried";
                    } else {
                        toolResult = "Herramienta desconocida.";
                    }

                    await supabase.from("debug_log").insert({
                        event_name: "tool_call_execution",
                        payload: { name: toolCall.function.name, args, success: actionResult === "registered" || actionResult === "queried" }
                    });

                    messages.push({
                        role: "tool",
                        name: toolCall.function.name,
                        tool_call_id: toolCall.id,
                        content: toolResult
                    });
                }
            } else {
                finalReply = message.content || "";
                aiFinished = true;
            }
        }

        await supabase.from("debug_log").insert({
            event_name: "callOpenAI_end",
            payload: { reply: finalReply, actionResult }
        });
        return { reply: finalReply, actionResult };

    } catch (err) {
        console.error("❌ Error de red con OpenAI:", err);
        return { reply: "Lo siento, no puedo responder en este momento. Intentá más tarde." };
    }
}

async function saveMessage(wamid: string, senderNumber: string, messageText: string, role: string = "user", actionResult?: string, processingMs?: number): Promise<void> {
    try {
        const insertObj: Record<string, unknown> = {
            wamid,
            sender_number: senderNumber,
            message_text: messageText,
            role: role,
            action_result: actionResult
        };

        if (role === "assistant" && processingMs !== undefined) {
            insertObj.processing_ms = processingMs;
        }

        const { error } = await supabase
            .from("whatsapp_messages")
            .insert(insertObj);

        if (error) {
            error.code === "23505"
                ? console.log(`⚠️ Duplicado ignorado(wamid: ${wamid})`)
                : console.error(`❌ Error BD(wamid: ${wamid}, role: ${role}): `, error);
        } else {
            console.log(`✅ Guardado en BD(wamid: ${wamid}, role: ${role})`);
        }
    } catch (err) {
        console.error("❌ Error inesperado en saveMessage:", err);
    }
}

async function sendTextReply(to: string, text: string): Promise<void> {
    if (!WA_PHONE_NUMBER_ID || !WA_ACCESS_TOKEN) {
        console.warn("⚠️ Credenciales de WhatsApp no configuradas.");
        return;
    }

    const url = `https://graph.facebook.com/${WA_API_VERSION}/${WA_PHONE_NUMBER_ID}/messages`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${WA_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { body: text },
        }),
    });

    const resBody = await res.json();
    if (res.ok) {
        console.log(`📤 Enviado a ${to}:`, JSON.stringify(resBody));
    } else {
        console.error(`❌ Error al enviar a ${to}:`, JSON.stringify(resBody));
        throw new Error(`WhatsApp API error: ${res.status} ${JSON.stringify(resBody)}`);
    }
}

/*
== MÉTRICAS DE VELOCIDAD — ejecutar en Supabase Studio ==

-- 1. Tiempo de procesamiento end-to-end por día y tipo de acción
CREATE OR REPLACE VIEW v_metric_processing_speed AS
SELECT
  DATE_TRUNC('day', received_at) as dia,
  action_result,
  COUNT(*) as total,
  ROUND(AVG(processing_ms)) as promedio_ms,
  ROUND(MIN(processing_ms)) as minimo_ms,
  ROUND(MAX(processing_ms)) as maximo_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_ms)) as p95_ms
FROM whatsapp_messages
WHERE role = 'assistant'
  AND processing_ms IS NOT NULL
GROUP BY DATE_TRUNC('day', received_at), action_result
ORDER BY dia DESC, action_result;

-- 2. Tiempo promedio de registro específicamente (para medir fricción del flujo principal)
CREATE OR REPLACE VIEW v_metric_registration_speed AS
SELECT
  DATE_TRUNC('day', received_at) as dia,
  COUNT(*) as registros,
  ROUND(AVG(processing_ms)) as promedio_ms,
  ROUND(MIN(processing_ms)) as minimo_ms,
  ROUND(MAX(processing_ms)) as maximo_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY processing_ms)) as p95_ms
FROM whatsapp_messages
WHERE role = 'assistant'
  AND action_result = 'registered'
  AND processing_ms IS NOT NULL
GROUP BY DATE_TRUNC('day', received_at)
ORDER BY dia DESC;

-- 3. Usuarios más lentos vs más rápidos (para detectar problemas por usuario)
CREATE OR REPLACE VIEW v_metric_speed_by_user AS
SELECT
  sender_number,
  COUNT(*) as interacciones,
  ROUND(AVG(processing_ms)) as promedio_ms,
  ROUND(MAX(processing_ms)) as maximo_ms
FROM whatsapp_messages
WHERE role = 'assistant'
  AND processing_ms IS NOT NULL
GROUP BY sender_number
ORDER BY promedio_ms DESC;

-- 4. Migración: agregar columna processing_ms si no existe
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS processing_ms integer;
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS action_result text;
*/
