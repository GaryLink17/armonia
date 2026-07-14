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

    const navigate = useNavigate()

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
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm'>
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-semibold text-gray-900'>Armonia</h1>
                    <p className='text-sm text-gray-900'>
                        {isLogin ? 'Iniciar sesion en tu cuenta' : 'Crea una cuenta'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                    <div>
                        <label className='text-sm text-gray-600 mb-1 block'>Correo</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500'
                            placeholder='Correo'
                        />
                    </div>
                    <div>
                        <label className='text-sm text-gray-600 mb-1 block'>Contraseño</label>
                        <input type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className='border w-full border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-violet-500'
                            placeholder='******'
                        />
                    </div>

                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                    {message && <p className='text-green-600 text-sm'>{message}</p>}


                    <button
                        type="submit"
                        disabled={loading}
                        className='bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 cursor-pointer disabled:opacity-50'
                    >
                        {loading ? 'Cargando...' : isLogin ? 'Iniciar sesion' : 'Registrarse'}
                    </button>
                </form>

                <p className='text-center text-sm text-gray-500 mt-4'>
                    {isLogin ? 'No tienes un cuenta?' : 'Ya tienes una cuenta?'}{' '}
                    <button 
                    onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null) }}
                    className='text-violet-600 font-medium hover:underline cursor-pointer'>
                        {isLogin ? 'Registrate' : 'Inicia sesion'}
                    </button>
                </p>

                {isLogin && (
                    <p className='text-center text-sm text-gray-500 mt-2'>
                        <a 
                            href="/reset-password"
                            className='text-violet-600 font-medium hover:underline'
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}