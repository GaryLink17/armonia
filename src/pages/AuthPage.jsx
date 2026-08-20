import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [installPrompt, setInstallPrompt] = useState(null)
    const [showInstallBanner, setShowInstallBanner] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault()
            setInstallPrompt(e)
            setShowInstallBanner(true)
        })
    }, [])

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const pendingToken = localStorage.getItem('pendingInviteToken')
                if (pendingToken) {
                    localStorage.removeItem('pendingInviteToken')
                    navigate(`/invite/${pendingToken}`)
                } else {
                    navigate('/dashboard')
                }
            }
        })
    }, [])

    async function handleInstall() {
        if (!installPrompt) return
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        if (outcome === 'accepted') setShowInstallBanner(false)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({email, password})
            if (error) {
                setError("Correo o contraseña incorrectos.")
            } else {
                const pendingToken = localStorage.getItem('pendingInviteToken')
                if (pendingToken) {
                    localStorage.removeItem('pendingInviteToken')
                    navigate(`/invite/${pendingToken}`)
                } else {
                    navigate('/dashboard')
                }
            }
        } else {
            const pendingToken = localStorage.getItem('pendingInviteToken')
            const redirectTo = pendingToken
                ? `${window.location.origin}/invite/${pendingToken}`
                : window.location.origin

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: redirectTo }
            })
            if (error) setError(error.message)
                else setMessage('Revisa tu correo para confirmar tu cuenta.')
        }
        setLoading(false)
    }

    return (
        <div className='relative min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 overflow-hidden'>
            <div className='absolute -top-24 -left-24 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl' />
            <div className='absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl' />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 w-full max-w-sm'>
                {showInstallBanner && (
                    <div className='bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl p-4 mb-4 flex items-center gap-3'>
                        <img src="/logo-192.png" alt="Armonia" className='w-10 h-10 rounded-xl'/>
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-medium text-blue-900 dark:text-blue-200'>Instalar Armonia</p>
                            <p className='text-xs text-blue-600 dark:text-blue-400'>Agregala a tu pantalla de inicio</p>
                        </div>
                        <button
                            onClick={handleInstall}
                            className='bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25'
                        >
                            Instalar
                        </button>
                    </div>
                )}
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>Armonia</h1>
                    <p className='text-sm text-gray-900 dark:text-gray-300'>
                        {isLogin ? 'Iniciar sesion en tu cuenta' : 'Crea una cuenta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div>
                        <label className='text-sm text-gray-600 dark:text-gray-400 mb-1 block'>Correo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className='w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400'
                            placeholder='Correo'
                        />
                    </div>
                    <div>
                        <label className='text-sm text-gray-600 dark:text-gray-400 mb-1 block'>Contraseña</label>
                        <input type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className='border w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 outline-none focus:border-blue-500 dark:focus:border-blue-400'
                            placeholder='******'
                        />
                    </div>

                    {error && <p className='text-red-500 dark:text-red-400 text-sm'>{error}</p>}
                    {message && <p className='text-green-600 dark:text-green-400 text-sm'>{message}</p>}


                    <button
                        type="submit"
                        disabled={loading}
                        className='bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 cursor-pointer disabled:opacity-50'
                    >
                        {loading ? 'Cargando...' : isLogin ? 'Iniciar sesion' : 'Registrarse'}
                    </button>
                </form>

                <p className='text-center text-sm text-gray-500 dark:text-gray-400 mt-4'>
                    {isLogin ? 'No tienes un cuenta?' : 'Ya tienes una cuenta?'}{' '}
                    <button
                    onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }}
                    className='text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer'>
                        {isLogin ? 'Registrate' : 'Inicia sesion'}
                    </button>
                </p>

                {isLogin && (
                    <p className='text-center text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        <a
                            href="/reset-password"
                            className='text-blue-600 dark:text-blue-400 font-medium hover:underline'
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}