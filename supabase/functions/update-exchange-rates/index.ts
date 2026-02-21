import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Get Fixer API Key
        const fixerApiKey = Deno.env.get('FIXER_API_KEY')
        if (!fixerApiKey) {
            throw new Error('FIXER_API_KEY environment variable is missing')
        }

        // 2. Fetch from Fixer
        // Free plan uses EUR as base currency by default
        const symbols = 'USD,EUR,MXN,ARS,COP,UYU'
        const fixerUrl = `http://data.fixer.io/api/latest?access_key=${fixerApiKey}&symbols=${symbols}`

        console.log(`Fetching exchange rates from Fixer API... symbols: ${symbols}`)
        const fixerResponse = await fetch(fixerUrl)

        if (!fixerResponse.ok) {
            throw new Error(`Failed to fetch from Fixer: ${fixerResponse.statusText}`)
        }

        const data = await fixerResponse.json()

        if (!data.success) {
            throw new Error(`Fixer API Error: ${data.error?.info || JSON.stringify(data.error)}`)
        }

        console.log(`Successfully fetched rates. Base: ${data.base}, Date: ${data.date}`)

        // 3. Init Supabase Service Role client to bypass RLS for inserts
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Missing Supabase environment variables')
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // 4. Upsert the rates into our exchange_rates table
        const { error: dbError } = await supabase
            .from('exchange_rates')
            .upsert({
                base_currency: data.base, // Usually 'EUR' on the free plan
                rates: data.rates,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'base_currency'
            })

        if (dbError) {
            throw new Error(`Failed to save to database: ${dbError.message}`)
        }

        console.log(`Successfully updated database for base currency: ${data.base}`)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Exchange rates updated successfully',
                base: data.base,
                rates: data.rates
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error in update-exchange-rates: ${errorMessage}`)

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
