import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { IconPlus, IconPlaylist, IconTrash, IconCalendar, IconMusic } from '@tabler/icons-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'
import SetlistDetail from './SetlistDetail'
import { useToast } from "../context/ToastContext";

export default function SetlistList({ group }) {
  const [setlists, setSetlists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedSetlist, setSelectedSetlist] = useState(null)
  const {showToast} = useToast();

  useEffect(() => {
    fetchSetlists()
  }, [group.group_id])

  async function fetchSetlists() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('setlists')
      .select('*, setlist_songs(count)')
      .eq('group_id', group.group_id)
      .order('date', { ascending: false })

    if (error) {
      setError('No se pudieron cargar los setlists.')
    } else {
      setSetlists(data)
    }

    setLoading(false)
  }

  async function handleDelete(id) {
    const confirm = window.confirm('¿Eliminar este setlist?')
    if (!confirm) return
    const { error } = await supabase.from('setlists').delete().eq('id', id)
    if (!error) {
      setSetlists(setlists.filter(s => s.id !== id))
      showToast('Setlist eliminado')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Sin fecha'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return <LoadingSpinner message="Cargando setlists..." />
  if (error) return <ErrorMessage message={error} />

  if (selectedSetlist) {
    return (
      <>
        <SetlistDetail
          setlist={selectedSetlist}
          group={group}
          onBack={() => setSelectedSetlist(null)}
          onEdit={() => setShowForm(selectedSetlist)}
        />
        {showForm && (
          <SetlistForm
            group={group}
            setlist={showForm === true ? null : showForm}
            onClose={() => setShowForm(false)}
            onSaved={() => {
              fetchSetlists();
              setShowForm(false);
              setSelectedSetlist(null);
            }}
          />
        )}
      </>
    );
  }

return (
  <div className="flex flex-col h-full">
    <div className="w-full max-w-2xl mx-auto px-4 pt-8 pb-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Setlists</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {setlists.length} setlist{setlists.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10"
        >
          <IconPlus size={16} />
          Nuevo
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pb-8">
      {setlists.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <IconPlaylist size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay setlists creados aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {setlists.map((setlist) => (
            <div
              key={setlist.id}
              onClick={() => setSelectedSetlist(setlist)}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md rounded-xl p-4 cursor-pointer hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <IconPlaylist size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {setlist.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <IconCalendar size={12} />
                        {formatDate(setlist.date)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <IconMusic size={12} />
                        {setlist.setlist_songs[0].count} canción
                        {setlist.setlist_songs[0].count !== 1 ? "es" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(setlist.id);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {showForm && (
      <SetlistForm
        group={group}
        setlist={showForm === true ? null : showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => {
          fetchSetlists();
          setShowForm(false);
          setSelectedSetlist(null);
        }}
        onToast={showToast}
      />
    )}
  </div>
)
}

function SetlistForm({ group, setlist, onClose, onSaved, onToast }) {
  const [form, setForm] = useState({
    name: setlist?.name || '',
    date: setlist?.date || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...form, group_id: group.group_id, created_by: user.id }

    let error
    if (setlist) {
      ({ error } = await supabase.from('setlists').update(payload).eq('id', setlist.id))
    } else {
      ({ error } = await supabase.from('setlists').insert(payload))
    }

    if (error) {
      setError(error.message)
    } else {
      onSaved()
      onClose()
      onToast(setlist ? 'Setlist actualizado' : 'Setlist creado')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {setlist ? 'Editar setlist' : 'Nuevo setlist'}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
              placeholder="Ej. Canciones del domingo"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Fecha <span className="text-gray-400 dark:text-gray-600">(Opcional)</span></label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : setlist ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}