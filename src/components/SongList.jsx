import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { IconPlus, IconMusic, IconBrandYoutube, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react'
import SongDetail from "./SongDetails"
import LoadingSpinner from "./LoadingSpinner"
import ErrorMessage from "./ErrorMessage"
import { useToast } from "../context/ToastContext"

export default function SongList({ group }) {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)
    const [search, setSearch] = useState('')
    const filteredSongs = songs.filter(s => 
        (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.artist || '').toLowerCase().includes(search.toLowerCase())
    )
    const isAdmin = group.role === 'admin'
    const { showToast } = useToast()


    useEffect(() => {
        fetchSongs()
    }, [group.group_id])

    async function fetchSongs() {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .eq('group_id', group.group_id)
            .order('created_at', { ascending: false })

        if (error) {
            setError('No se puedieron cargar las canciones.')
        } else {
            setSongs(data)
        }

        setLoading(false)
    }

    async function handleDelete(id) {
        const { error } = await supabase.from('songs').delete().eq('id', id)
        if (!error) {
          setSongs(songs.filter(s => s.id !== id))
          showToast('Cancion eliminada')
        }
    }

    if (loading) return <LoadingSpinner message="Cargando Canciones..." />
    if (error) return <ErrorMessage message={error} />

    if (selectedSong) return (
        <SongDetail
            song={selectedSong}
            isAdmin={isAdmin}
            onBack={() => setSelectedSong(null)}
            onEdit={() => { setShowForm(selectedSong); setSelectedSong(null) }}
        />
    )

    return (
  <div className="flex flex-col h-full">
    <div className="w-full max-w-2xl mx-auto px-4 pt-8 pb-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Repertorio</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filteredSongs.length} cancion{filteredSongs.length !== 1 ? 'es' : ''}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10"
          >
            <IconPlus size={16} />
            Agregar
          </button>
        )}
      </div>

      <div className="relative">
        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Busca por nombre o artista"
          className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pb-8">
      {filteredSongs.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <IconMusic size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay canciones en el repertorio.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredSongs.map(song => (
            <div
              key={song.id}
              onClick={() => setSelectedSong(song)}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-blue-200 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <IconMusic size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{song.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  {song.original_key} → {song.ministry_key}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {song.youtube_url && (
                  <a
                    href={song.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <IconBrandYoutube size={18} />
                  </a>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowForm(song) }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(song.id) }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <IconTrash size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {showForm && (
      <SongForm
        group={group}
        song={showForm === true ? null : showForm}
        onClose={() => setShowForm(false)}
        onSaved={fetchSongs}
        onToast={showToast}
      />
    )}
  </div>
)
}

function SongForm({ group, song, onClose, onSaved, onToast }) {
    const [form, setForm] = useState({
        title: song?.title || '',
        artist: song?.artist || '',
        original_key: song?.original_key || '',
        ministry_key: song?.ministry_key || '',
        lyrics: song?.lyrics || '',
        youtube_url: song?.youtube_url || '',
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

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
        if (song) {
            ({ error } = await supabase.from('songs').update(payload).eq('id', song.id))
        } else {
            ({ error } = await supabase.from('songs').insert(payload))
        }

        if (error) {
            setError(error.message)
        } else {
            onSaved()
            onClose()
            onToast(song ? 'Cancion actualizada' : 'Cancion agregada')
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {song ? 'Editar cancion' : 'Agregar cancion'}
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Nombre de la cancion</label>
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="Ej. Quien Podra?"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Artista / Grupo</label>
                        <input
                            name="artist"
                            value={form.artist}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="Ej: Averly Morillo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tono Original</label>
                            <select
                                name="original_key"
                                value={form.original_key}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white"
                            >
                                <option value="">Seleccionar</option>
                                {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Tono de Ejecucion</label>
                            <select
                                name="ministry_key"
                                value={form.ministry_key}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white"
                            >
                                <option value="">Seleccionar</option>
                                {keys.map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Letra <span className="text-gray-400 dark:text-gray-600">(Opcional)</span></label>
                        <textarea
                            name="lyrics"
                            value={form.lyrics}
                            onChange={handleChange}
                            rows={5}
                            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                            placeholder="Escribe o pega la letra aqui"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Link de Youtube <span className="text-gray-400 dark:text-gray-600">(Opcional)</span></label>
                        <input
                            name="youtube_url"
                            value={form.youtube_url}
                            onChange={handleChange}
                            className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
                            placeholder="Link del Video..."
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
                            className="flex-1 bg-blue-600 text-sm text-white rounded-lg py-2 font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : song ? 'Guardar' : 'Agregar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}