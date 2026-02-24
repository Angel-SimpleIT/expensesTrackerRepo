import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        // 1. Verify the user making the request
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: authHeader }
            }
        })

        const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

        if (authError || !user) {
            console.error('Auth error:', authError)
            throw new Error('Unauthorized or invalid user token')
        }

        console.log(`User ${user.id} requested account deletion.`)

        // 2. Initialize Admin client to bypass RLS and delete the user from auth.users
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error('Error deleting user:', deleteError)
            throw new Error(`Failed to delete user: ${deleteError.message}`)
        }

        console.log(`Successfully deleted user ${user.id}`)

        return new Response(
            JSON.stringify({ success: true, message: 'Account deleted successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error in delete-user-account: ${errorMessage}`)

        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
