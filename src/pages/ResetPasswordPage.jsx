import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { IconArrowLeft } from '@tabler/icons-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/new-password`,
    })

    if (error) {
      setError('No se pudo enviar el correo. Verifica la dirección ingresada.')
    } else {
      setMessage('Te enviamos un correo con el enlace para restablecer tu contraseña.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 w-full max-w-sm">
        <a
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
        >
          <IconArrowLeft size={16} />
          Volver al login
        </a>

        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Restablecer contraseña</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Correo</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="tu@correo.com"
            />
          </div>

          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-600 dark:text-green-400 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  )
}