import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (error) {
            console.error('Auth error in callback:', error)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Ocurrió un error en la autenticación.')}`)
        }
    }

    // URL a la que se redirige después de completar el proceso de inicio de sesión
    // Usamos origin para asegurar que la redirección sea a nuestro dominio
    return NextResponse.redirect(`${origin}${next}`)
}

