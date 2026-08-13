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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">¿Cómo te llamamos?</h1>
          <p className="text-sm text-gray-500 mt-1">
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}