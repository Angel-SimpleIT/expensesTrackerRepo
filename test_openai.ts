import "dotenv/config";


const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
                    fecha_inicio: {
                        type: "string",
                        description: "Fecha de inicio del periodo a consultar en formato YYYY-MM-DD. Si el usuario pide 'gastos de hoy', usa la misma fecha en ambos campos."
                    },
                    fecha_fin: {
                        type: "string",
                        description: "Fecha de fin del periodo a consultar en formato YYYY-MM-DD. Si el usuario pide 'gastos de hoy', usa la misma fecha en ambos campos."
                    }
                },
                required: ["fecha_inicio", "fecha_fin"]
            }
        }
    }
];

async function callOpenAI(userMessage: string) {
    if (!OPENAI_API_KEY) {
        console.warn("⚠️ OPENAI_API_KEY no configurada.");
        return;
    }

    const dynamicSystemPrompt = `${SYSTEM_PROMPT}\n\nFECHA Y HORA ACTUAL:\nLa fecha y hora actual del sistema es ${new Date().toISOString()}.\nAsegúrate de hacer una gestión de tiempo adecuada para cada usuario. Usa esta fecha como referencia exacta al calcular los parámetros 'fecha_inicio' y 'fecha_fin' (formato YYYY-MM-DD). Si piden gastos de "hoy", ambos campos tendrán la misma fecha.`;

    const messages = [
        { role: "system", content: dynamicSystemPrompt },
        { role: "user", content: userMessage }
    ];

    console.log("Sending request to OpenAI...");

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
        return;
    }

    const data = await res.json() as any;
    const message = data.choices[0].message;

    if (message.tool_calls && message.tool_calls.length > 0) {
        console.log("TOOL CALLS:");
        console.log(JSON.stringify(message.tool_calls, null, 2));
    } else {
        console.log("AI REPLY:", message.content);
    }
}

callOpenAI("dame los gastos del 1ero de enero");
