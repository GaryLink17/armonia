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
            const { error: deleteError } = await supabas
                .from('pending_songs')
                .delete()
                .eq('id', song.id)
            
            if (!deleteError) setPending(pending.filter(p => p.id !== song.id))
    }

    async function handleDiscard(id) {
        
    }

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
                <div>
                    <IconMusic size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay canciones pendientes.</p>
                </div>
            ) : (
                <div>
                    {pending.map(song => (
                        <div>
                            <div>
                                <IconMusic size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <p>{song.title}</p>
                                <p>{song.artist}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}