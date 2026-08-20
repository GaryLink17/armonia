import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'

export default function SetupProfilePage({ onComplete }) {
  const { updateDisplayName } = useProfile()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    const { error } = await updateDisplayName(name.trim())

    if (error) {
      setError('No se pudo guardar el nombre. Intenta de nuevo.')
    } else {
      onComplete()
    }

    setLoading(false)
  }

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">¿Cómo te llamamos?</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Ingresa un nombre para que los demás miembros puedan identificarte.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Tu nombre"
            maxLength={50}
            required
            autoFocus
            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
          />

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}