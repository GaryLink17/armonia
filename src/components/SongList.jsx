import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import { IconPlus, IconMusic, IconBrandYoutube, IconEdit, IconTrash } from '@tabler/icons-react'
import { href } from "react-router-dom"

export default function SongList({ group }) {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(true)
    const isAdmin = group.role === 'admin'

    useEffect(() => {
        fetchSongs()
    }, [group.group_id])

    async function fetchSongs() {
        const {data, error} = await supabase
            .from('songs')
            .select('*')
            .eq('group_id', group.group_id)
            .order('created_at', {ascending: false})

        if (!error) setSongs(data)
        setLoading(false)
    }

    async function handleDelete(id) {
        const {error} = await supabase.from('songs').delete().eq('id', id)
        if (!error) setSongs(songs.filter(s => s.id !== id))
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Cargando canciones...</p>
        </div>
    )

    return (
        <div className="w-full max-w-2Xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Repertorio</h2>
                    <p className="text-sm text-gray-500">{songs.length} cancion{songs.length !== 1 ? 'es' : ''}</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"
                    >
                        <IconPlus size={16}/>
                        Agregar
                    </button>
                )}
            </div>

            {songs.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <IconMusic size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay canciones en el repertorio.</p>
                </div>
            ) : (
                <div>
                    {songs.map(song => (
                        <div key={song.id}>
                            <div>
                                <IconMusic size={20} />
                            </div>
                            <div>
                                <p>{song.title}</p>
                                <p>{song.artist}</p>
                            </div>
                            <div>
                                <span>
                                    {song.original_key} → {song.ministry_key}
                                </span>
                            </div>
                            <div>
                                {song.youtube_url && (
                                    <a
                                        href={song.youtube_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className=""
                                    >
                                        <IconBrandYoutube size={18} />
                                    </a>
                                )}
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => setShowForm(song)}
                                            className=""
                                        >
                                            <IconEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(song.id)}
                                            className=""
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

            {showForm && (
                <SongForm
                    group={group}
                    song={showForm === true ? null : showForm}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchSongs}
                />
            )}
        </div>
    )
}

function SongForm({ group, song, onClose, onSaved }) {
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

    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B' ]

    function handleChange(e) {
        setForm({...form, [e.target.name]: e.target.value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: { user } } = await supabase.auth.getUser()

        const payload = { ...form, group_id: group.group_id, created_by: user_id }

        let error
        if (song) {
            ({error} = await supabase.from('songs').update(payload).eq('id', song_id))
        } else {
            ({error} = await supabase.from('songs').insert(payload))
        }

        if (error){
            setError(error.message)
        } else {
            onSaved()
            onClose()
        }

        setLoading(false)
    }
}

return (
    <div>

    </div>
)