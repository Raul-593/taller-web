import { login } from './actions'
import { Button } from '@/componentes/ui/button'
import { Input } from '@/componentes/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/componentes/ui/cards'
import { Label } from '@/componentes/ui/label'

export default function LoginPage() {
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
                            <Button formAction={login} className="w-full">
                                Iniciar Sesión
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
