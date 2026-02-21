import { useState } from 'react'
import { Navigate, useNavigate, Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const { session, loading, signIn } = useAuth()
    const navigate = useNavigate()

    if (loading) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        )
    }

    if (session) return <Navigate to="/" replace />

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        const { error } = await signIn(email, password)
        setSubmitting(false)
        if (error) setError(error.message)
        else navigate('/')
    }

    return (
        <section className="bg-background flex min-h-screen grid grid-rows-[auto_1fr] px-4">
            <div className="mx-auto w-full max-w-7xl border-b py-3">
                <Link
                    to="/hero"
                    aria-label="go home"
                    className="inline-flex items-center gap-2 border-t-2 border-transparent py-3">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Warehouse className="size-4" />
                    </div>
                    <span className="text-foreground text-lg font-semibold">CleanFeed</span>
                </Link>
            </div>

            <div className="m-auto w-full max-w-sm">
                <div className="text-center">
                    <h1 className="font-serif text-4xl font-medium">Welcome back</h1>
                    <p className="text-muted-foreground mt-2 text-sm">Sign in to your account to continue</p>
                </div>
                <Card
                    variant="outline"
                    className="mt-6 p-8">
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5">
                        {error && <p className="text-sm text-destructive text-center">{error}</p>}
                        <div className="space-y-3">
                            <Label
                                htmlFor="email"
                                className="text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="you@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm">
                                    Password
                                </Label>
                            </div>
                            <Input
                                type="password"
                                id="password"
                                name="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <Button className="w-full" type="submit" disabled={submitting}>
                            {submitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </Card>

                <p className="text-muted-foreground mt-6 text-center text-sm">
                    Don't have an account?{' '}
                    <Link
                        to="/login"
                        className="text-primary font-medium hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </section>
    )
}
