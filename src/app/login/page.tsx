import { login } from './actions'
import { Input } from '@/componentes/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/cards'
import { Label } from '@/componentes/ui/label'
import { SubmitButton } from '@/componentes/ui/submit_button'

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
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Contraseña</Label>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <SubmitButton formAction={login} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
