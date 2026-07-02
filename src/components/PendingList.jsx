import { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';
import { IconPlus, IconMusic, IconCheck, IconX, IconBrandYoutube } from "@tabler/icons-react";

export default function PendingList({ group }) {
    const [pending, setPending] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const isAdmin = group.role === 'admin'

    useEffect(() => {
        fetchPending()
    }, [group.group_id])

    async function fetchPending() {
        const { data, error } = await supabase
            .from('pending_songs')
            .select('*')
            .eq('group_id', group.group_id)
            .order('created_at', { ascending: false })

        if (!error) setPending(data)
            setLoading(false)
    }

    async function handleApprove(song) {
        // primero insertamos en el repertorio oficial
        const {error: insertError} = await supabase
            .from('songs')
            .insert({
                group_id: song.group_id,
                title: song.title,
                artist:song.artist,
                youtube_url: song.youtube_url,
                original_key: 'C',
                ministry_key: 'C',
                created_by: song.suggested_by,
            })

            if (insertError) return

            //Luego la eliminamos de pendientes
            const { error: deleteError } = await supabase
                .from('pending_songs')
                .delete()
                .eq('id', song.id)
            
            if (!deleteError) setPending(pending.filter(p => p.id !== song.id))
    }

    async function handleDiscard(id) {
        const { error } = await supabase.from('pending_songs').delete().eq('id', id)
        if (!error) setPending(pending.filter(p => p.id !== id))
    }

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    )

    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Pendientes</h2>
                    <p className="text-sm text-gray-500">{pending.length} sugerencia{pending.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700"

                >
                    <IconPlus size={16} />
                    Sugerir
                </button>
            </div>

            {pending.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <IconMusic size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay canciones pendientes.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {pending.map(song => (
                        <div key={song.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                                <IconMusic size={20} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                {song.youtube_url && (
                                    <a
                                        href={song.youtube_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500"
                                    >
                                        <IconBrandYoutube size={18} />
                                    </a>
                                )}
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(song)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600"
                                            title="Aprobar"
                                        >
                                            <IconCheck size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDiscard(song.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                                            title="Descartar"
                                        >
                                            <IconX size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <PendingForm 
                    group={group}
                    onClose={() => setShowForm(false)}
                    onSaved={fetchPending}
                />
            )}
        </div>
    )
}

function PendingForm({group, onClose, onSaved}) {
    const [form, setForm] = useState({title:'', artist:'', youtube_url:''})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data: {user} } = await supabase.auth.getUser()

        const { error } = await supabase.from('pending_songs').insert({
            ...form,
            group_id: group.group_id,
            suggested_by: user.id,
        })

        if (error) {
            setError(error.message)
        } else {
            onSaved()
            onClose()
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Sugerir cancion</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Nombre de la cancion</label>
                        <input 
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500" 
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Artista / Grupo</label>
                        <input 
                            name="artist"
                            value={form.artist}
                            onChange={handleChange}
                            className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-violet-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 mb-1 block">Link de Youtube</label>
                        <input
                            name="youtube_url"
                            value={form.youtube_url}
                            onChange={handleChange}
                            className="border border-gray-200 w-full px-3 py-2 text-sm rounded-lg outline-none focus:border-violet-500"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 text-sm py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Sugerir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
