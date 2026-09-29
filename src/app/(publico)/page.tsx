import { Button } from "@/componentes/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/cards"
import Link from "next/link"
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Analytics />
          <CardTitle>Bienvenido a la Página de 593 Cycling Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600 dark:text-zinc-400">
            Toda la información necesaria se cuentra en las paginas internas del sistema.
          </p>
          <p>Aqui debe estar el logo del taller</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/dashboard">
            <Button>Comencemos</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
