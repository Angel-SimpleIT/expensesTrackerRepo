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

REGLAS DE COMPORTAMIENTO:
- Respondé siempre en el mismo idioma en que te escriben.
- Usá lenguaje coloquial, breve y claro. Máximo 3 líneas por respuesta.
- Nunca uses markdown (nada de **, ##, listas con -). Solo texto plano y emojis.
- Si la consulta NO tiene que ver con finanzas ni con la aplicación, debes declinar cortésmente o responder de forma muy breve y enfocarte nuevamente en que estás para ayudar con su dinero, SIN invocar ninguna herramienta.

RESPUESTAS ESPERADAS:
Si el usuario registra un gasto, confirma el registro de forma amigable usando los datos devueltos por la herramienta.
Si el usuario pide un reporte, usa la herramienta de consulta y devuelve un resumen ameno.
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
                    moneda: { type: "string", description: "Código ISO de 3 letras de la moneda (ej. USD, ARS, EUR). Déjalo vacío si no lo especifica." },
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
            description: "Consulta los gastos acumulados en un periodo específico para este usuario.",
            parameters: {
                type: "object",
                properties: {
                    periodo: {
                        type: "string",
                        description: "El periodo a consultar. Opciones: 'hoy', 'ayer', 'semana_actual', 'mes_actual', 'mes_pasado'"
                    }
                },
                required: ["periodo"]
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
        EdgeRuntime.waitUntil(processWebhookEvent(bodyText));
        return new Response("OK", { status: 200 });
    }

    return new Response("Method Not Allowed", { status: 405 });
});

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
                        console.log(`ℹ️ Tipo ignorado: ${msg.type}`);
                        continue;
                    }

                    const wamid = msg.id as string;
                    const senderNumber = msg.from as string;
                    const messageText = (msg.text as Record<string, string>)?.body ?? "";

                    console.log(`💬 De ${senderNumber}: "${messageText}"`);

                    // 1. Guardar en BD (Mensaje del usuario)
                    await saveMessage(wamid, senderNumber, messageText, "user");

                    // 2. Manejar flujo de vinculación (CONECTAR [código])
                    if (messageText.trim().toUpperCase().startsWith("CONECTAR")) {
                        await handleLinkingCommand(senderNumber, messageText);
                        continue;
                    }

                    // 3. Verificar si el usuario está vinculado
                    const profile = await getProfileByWhatsApp(senderNumber);
                    if (!profile) {
                        const reply = "👋 ¡Hola! Todavía no vinculaste tu cuenta. Andá a Configuración en la app y generá un código de conexión.";
                        await sendTextReply(senderNumber, reply);
                        await saveMessage(`reply-${wamid}`, senderNumber, reply, "assistant");
                        continue;
                    }

                    // 4. Obtener historial de conversación
                    const history = await getConversationHistory(senderNumber);

                    // 5. Llamar a OpenAI con historial e inyectar el profile
                    const aiResult = await callOpenAI(messageText, history, profile);
                    console.log(`🤖 OpenAI Reply:`, aiResult.reply);

                    // 6. Enviar respuesta al usuario y guardar historia
                    await sendTextReply(senderNumber, aiResult.reply);
                    await saveMessage(`reply-${wamid}`, senderNumber, aiResult.reply, "assistant");
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
        .eq("bot_user_id", senderNumber)
        .single();

    if (error) {
        if (error.code !== "PGRST116") { // PGRST116 is no rows
            console.error(`❌ Error buscando perfil para ${senderNumber}:`, error);
        }
        return null;
    }
    return data;
}

async function getConversationHistory(senderNumber: string): Promise<any[]> {
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
    }));
}

async function handleLinkingCommand(senderNumber: string, messageText: string): Promise<void> {
    const code = messageText.replace(/CONECTAR/i, "").trim();

    if (!code || code.length < 5) {
        await sendTextReply(senderNumber, "⚠️ Código inválido. Por favor, enviá: CONECTAR <tu_codigo>");
        return;
    }

    console.log(`🔗 Intentando vincular ${senderNumber} con código ${code}`);

    // Buscar perfil con ese código
    const { data: profile, error: searchError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("pairing_code", code)
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

    await sendTextReply(
        senderNumber,
        `✅ ¡Hola ${profile.full_name}! Tu WhatsApp fue vinculado exitosamente. Ya podés registrar tus gastos escribiéndome directamente.`
    );
}

async function registerExpenseFromAI(profile: any, expense: any, rawText: string): Promise<boolean> {
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
        return false;
    }

    const baseCurrency = ratesData.base_currency;
    const rates = ratesData.rates as Record<string, number>;

    // Asegurar que la base está en el objeto de tasas
    if (!rates[baseCurrency]) rates[baseCurrency] = 1;

    // 2. Calcular montos normalizando a la base y luego a USD/Home
    // Si 1 Base = R_curr CURR, entonces 1 CURR = 1/R_curr Base.
    // amount_base_curr = amount / rates[currency]
    // amount_usd = (amount / rates[currency]) * rates["USD"]
    const rateToUsd = rates["USD"] || 1;
    const rateToHome = rates[homeCurrency] || 1;
    const rateFromCurr = rates[currency] || rates["USD"]; // Fallback a USD si la moneda no existe

    const amountUsd = (amount / rateFromCurr) * rateToUsd;
    const amountBase = (amount / rateFromCurr) * rateToHome;

    // 3. Mapear categoría
    const categories: Record<string, string> = {
        "Alimentación": "a66f6091-4e93-4a52-b871-d617ab3c3d06",
        "Transporte": "800d6bc2-e3db-44e1-99db-645f3462bb2a",
        "Compras": "67c5708c-3cd0-40c4-9974-bef09d8397d5",
        "Hogar": "142fa898-8e98-4c5c-8825-bf566c23d363",
        "Café": "f1f29a0c-d32f-4796-b0b3-e9d9b338d891",
        "Entretenimiento": "4cd280b9-af79-4c00-83e8-665d12b0a58f",
        "Salud": "e38c1d45-e276-4b67-b041-ae6166104f16",
        "Teléfono": "ef61c547-02ea-4d29-84cc-94e46e1420c0",
        "Viajes": "6eab2da5-7911-4857-80a0-b54761fd0e64",
        "Otros": "432d677f-2e18-4d7f-a545-e246400039ca",
        "Ingresos": "588e5a5f-3088-4ec7-9585-b7763f640fb2",
        "Mascotas": "e2fefbdc-8e71-430b-8a58-f0e7000e5e55",
        "Sueldo": "f9f977fc-e4c0-401f-85bd-103bc47eddd8",
        "Gastos Financieros": "5816b115-61a9-4be5-9dee-74bfe115cda6",
        "Educación": "853f6fc6-38e2-4f1b-b90c-e7d28e8ef5c8",
        "Delivery": "ac3d7b76-89b4-4b90-a4f2-b11b113cd954"
    };

    // Búsqueda difusa simple por nombre
    let categoryId = categories["Otros"];
    if (category_hint) {
        const found = Object.entries(categories).find(([name]) =>
            name.toLowerCase().includes(category_hint.toLowerCase()) ||
            category_hint.toLowerCase().includes(name.toLowerCase())
        );
        if (found) categoryId = found[1];
    }

    // 4. Insertar transacción
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
        return false;
    }

    return true;
}

async function registrarGastoTool(args: any, profile: any, rawText: string): Promise<boolean> {
    const { monto, moneda, categoria, descripcion } = args;
    const expense = {
        amount: monto,
        currency: moneda || profile.home_currency || "USD",
        description: descripcion,
        category_hint: categoria
    };
    return await registerExpenseFromAI(profile, expense, rawText);
}

async function consultarGastosTool(args: any, profile: any): Promise<any> {
    const { periodo } = args;
    let startDate = new Date();
    let endDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (periodo === "ayer") {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
    } else if (periodo === "semana_actual") {
        const day = startDate.getDay();
        const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
        startDate.setDate(diff);
    } else if (periodo === "mes_actual") {
        startDate.setDate(1);
    } else if (periodo === "mes_pasado") {
        startDate.setMonth(startDate.getMonth() - 1);
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth());
        endDate.setDate(0);
    }

    const { data, error } = await supabase
        .from("transactions")
        .select(`
            amount_base, 
            merchant_name, 
            created_at,
            categories(name)
        `)
        .eq("user_id", profile.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

    if (error) {
        console.error("❌ Error consultando gastos:", error);
        return { error: "No se pudieron obtener los gastos de la base de datos." };
    }

    return {
        rango_consultado: { desde: startDate.toISOString().split("T")[0], hasta: endDate.toISOString().split("T")[0] },
        moneda_base_usuario: profile.home_currency || "USD",
        movimientos: data
    };
}

async function callOpenAI(userMessage: string, history: any[] = [], profile: any): Promise<{ reply: string }> {
    if (!OPENAI_API_KEY) {
        console.warn("⚠️ OPENAI_API_KEY no configurada.");
        return { reply: "Lo siento, no puedo responder en este momento. Intentá más tarde." };
    }

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage }
    ];

    try {
        let aiFinished = false;
        let finalReply = "";

        while (!aiFinished) {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    max_tokens: 300,
                    temperature: 0.4,
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
                        const success = await registrarGastoTool(args, profile, userMessage);
                        toolResult = success ? "Avisale al usuario que el gasto se registró correctamente." : "Error al registrar gasto en BD.";
                    } else if (toolCall.function.name === "consultar_gastos") {
                        const resultData = await consultarGastosTool(args, profile);
                        toolResult = JSON.stringify(resultData);
                    } else {
                        toolResult = "Herramienta desconocida.";
                    }

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

        return { reply: finalReply };

    } catch (err) {
        console.error("❌ Error de red con OpenAI:", err);
        return { reply: "Lo siento, no puedo responder en este momento. Intentá más tarde." };
    }
}

async function saveMessage(wamid: string, senderNumber: string, messageText: string, role: string = "user"): Promise<void> {
    try {
        const { error } = await supabase
            .from("whatsapp_messages")
            .insert({
                wamid,
                sender_number: senderNumber,
                message_text: messageText,
                role: role
            });

        if (error) {
            error.code === "23505"
                ? console.log(`⚠️ Duplicado ignorado (wamid: ${wamid})`)
                : console.error(`❌ Error BD (wamid: ${wamid}, role: ${role}):`, error);
        } else {
            console.log(`✅ Guardado en BD (wamid: ${wamid}, role: ${role})`);
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

    try {
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
        res.ok
            ? console.log(`📤 Enviado a ${to}:`, JSON.stringify(resBody))
            : console.error(`❌ Error al enviar a ${to}:`, JSON.stringify(resBody));

    } catch (err) {
        console.error("❌ Error de red enviando reply:", err);
    }
}
