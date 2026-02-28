import LoginForm from './login-form'

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-950">
            {/* Decorative gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse delay-700" />

            {/* Texture overlay (subtle dots) */}
            <div className="absolute inset-x-0 inset-y-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="z-10 w-full px-4 flex items-center justify-center">
                <LoginForm />
            </div>

            <footer className="absolute bottom-10 text-zinc-600 dark:text-zinc-500 text-sm">
                &copy; {new Date().getFullYear()} Agencias New. Todos los derechos reservados.
            </footer>
        </main>
    )
}
