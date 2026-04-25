import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Ocurrió un error en la autenticación.')}`)
        }
    }

    // URL a la que se redirige después de completar el proceso de inicio de sesión
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
