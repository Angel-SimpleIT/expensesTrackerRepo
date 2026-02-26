import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MIXPANEL_TOKEN = Deno.env.get("MIXPANEL_PROJECT_TOKEN") ?? "";
const MIXPANEL_URL = "https://api.mixpanel.com/track";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WebhookPayload {
    type: string;
    table: string;
    schema: string;
    record: Record<string, unknown>;
}

interface MixpanelEvent {
    event: string;
    properties: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Helper: build the secondary event (gasto_registrado / consulta_realizada /
//          accion_fallida) that mirrors the base event shape.
// ---------------------------------------------------------------------------

function buildSecondaryEvent(
    eventName: string,
    senderNumber: string,
    processingMs: number | null,
    unixTime: number
): MixpanelEvent {
    return {
        event: eventName,
        properties: {
            token: MIXPANEL_TOKEN,
            distinct_id: senderNumber,
            processing_ms: processingMs,
            time: unixTime,
        },
    };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request): Promise<Response> => {
    // Only accept POST requests
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload: WebhookPayload = await req.json();
        const { record } = payload;

        console.log("[mixpanel-tracker] Received record:", JSON.stringify(record));

        // Extract fields
        const senderNumber = record.sender_number as string | null;
        const role = record.role as string | null;
        const actionResult = record.action_result as string | null;
        const processingMs = record.processing_ms as number | null;
        const receivedAt = record.received_at as string | null;
        const wamid = record.wamid as string | null;

        // Only process assistant messages with a non-null action_result
        if (role !== "assistant" || actionResult === null) {
            console.log(
                `[mixpanel-tracker] Skipping row — role="${role}", action_result="${actionResult}"`
            );
            return new Response("OK", { status: 200 });
        }

        // Derive Unix timestamp (seconds)
        const unixTime = receivedAt
            ? Math.floor(new Date(receivedAt).getTime() / 1000)
            : Math.floor(Date.now() / 1000);

        // ----- Base event: bot_interaction -----
        const baseEvent: MixpanelEvent = {
            event: "bot_interaction",
            properties: {
                token: MIXPANEL_TOKEN,
                distinct_id: senderNumber,
                action_result: actionResult,
                processing_ms: processingMs ?? null,
                time: unixTime,
                wamid: wamid,
            },
        };

        const events: MixpanelEvent[] = [baseEvent];

        // ----- Secondary event based on action_result -----
        const secondaryEventMap: Record<string, string> = {
            registered: "gasto_registrado",
            queried: "consulta_realizada",
            failed: "accion_fallida",
        };

        const secondaryEventName = secondaryEventMap[actionResult];
        if (secondaryEventName) {
            events.push(
                buildSecondaryEvent(secondaryEventName, senderNumber!, processingMs ?? null, unixTime)
            );
        }

        console.log(
            `[mixpanel-tracker] Sending ${events.length} event(s) to Mixpanel:`,
            JSON.stringify(events)
        );

        // ----- Send to Mixpanel -----
        let mixpanelStatus = 0;
        try {
            const mixpanelRes = await fetch(MIXPANEL_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(events),
            });
            mixpanelStatus = mixpanelRes.status;
            console.log(`[mixpanel-tracker] Mixpanel response status: ${mixpanelStatus}`);
        } catch (fetchErr) {
            console.error("[mixpanel-tracker] Failed to reach Mixpanel:", fetchErr);
        }

        return new Response("OK", { status: 200 });
    } catch (err) {
        console.error("[mixpanel-tracker] Unexpected error:", err);
        // Never let errors propagate to the webhook caller
        return new Response("OK", { status: 200 });
    }
});
