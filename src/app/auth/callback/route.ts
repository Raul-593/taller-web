import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    
    // Solo permite rutas internas
    const nextParam = searchParams.get('next') ?? '/dashboard'
    const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/dashboard'

    const redirectToLogin = (message: string) => {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`)
    }
    
    // Supabase rechazo el ingreso
    const providerError = searchParams.get('error')
    if (providerError) {
        const errorCode = searchParams.get('error_code') ?? ''
        const errorDescription = searchParams.get('error_description') ?? ''
        console.error('Auth provider error:', { providerError, errorCode, errorDescription })

        const isSignupBlocked = errorCode === 'signup_disable' || errorDescription.toLocaleLowerCase().includes('signup')

        return redirectToLogin(
            isSignupBlocked
             ? 'Esta cuenta no esta autorizada. Contacta al administrador'
             : 'Ocurrio un error en la autenticacion'
        )
    }

    // No se recibio el codigo de verificacion
    if (!code){
        return redirectToLogin('Ocurrio un error en la autenticacion')
    }

    // Flujo normal de autenticacion
    const supabase =  await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('Auth error in callback:', error)
        return redirectToLogin('Ocurrio un error en la autenticacion')
    }

    // URL a la que se redirige después de completar el proceso de inicio de sesión
    return NextResponse.redirect(`${origin}${next}`)
}

