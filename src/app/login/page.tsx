import { login, signup, signInWithGoogle } from './actions'
import { Input } from '@/componentes/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/cards'
import { Label } from '@/componentes/ui/label'
import { SubmitButton } from '@/componentes/ui/submit_button'
import { Button } from '@/componentes/ui/button'
import { Globe } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const error = searchParams.error;
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Ingresa tu email y contraseña para acceder al sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                            {error}
                        </div>
                    )}
                    <form>
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                </div>
                                <Input id="password" name="password" type="password"/>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <SubmitButton formAction={login}>Iniciar Sesión</SubmitButton>
                                <SubmitButton formAction={signup} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Registrarse</SubmitButton>
                            </div>
                            
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        O continuar con
                                    </span>
                                </div>
                            </div>
                            
                            <Button variant="outline" formAction={signInWithGoogle} className="w-full">
                                <Globe className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
