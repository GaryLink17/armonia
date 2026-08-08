import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconArrowLeft,
  IconCalendar,
  IconGripVertical,
  IconMusic,
  IconPlus,
  IconTrash,
  IconEdit,
} from '@tabler/icons-react'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function SetlistDetail({ setlist, group, onBack, onEdit }) {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPicker, setShowPicker] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchSongs()
  }, [setlist.id])

  async function fetchSongs() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('setlist_songs')
      .select('id, position, songs(id, title, artist, original_key, ministry_key)')
      .eq('setlist_id', setlist.id)
      .order('position', { ascending: true })

    if (error) {
      setError('No se pudieron cargar las canciones.')
    } else {
      setSongs(data)
    }

    setLoading(false)
  }

  async function handleRemoveSong(setlistSongId) {
    const { error } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('id', setlistSongId)

    if (!error) setSongs(songs.filter(s => s.id !== setlistSongId))
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = songs.findIndex(s => s.id === active.id)
    const newIndex = songs.findIndex(s => s.id === over.id)
    const reordered = arrayMove(songs, oldIndex, newIndex)

    setSongs(reordered)

    // Actualizar posiciones en Supabase
    await Promise.all(
      reordered.map((s, i) =>
        supabase.from('setlist_songs').update({ position: i }).eq('id', s.id)
      )
    )
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'Sin fecha'
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return <LoadingSpinner message="Cargando setlist..." />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <IconArrowLeft size={16} />
        Volver a setlists
      </button>

      <div className="bg-violet-600 rounded-2xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{setlist.name}</h2>
            <div className="flex items-center gap-1 mt-1 text-violet-200 text-xs">
              <IconCalendar size={12} />
              {formatDate(setlist.date)}
            </div>
            <p className="text-violet-200 text-xs mt-1">
              {songs.length} canción{songs.length !== 1 ? 'es' : ''}
            </p>
          </div>
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white"
          >
            <IconEdit size={16} />
          </button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <IconMusic size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay canciones en este setlist.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={songs.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2 mb-4">
              {songs.map((s, i) => (
                <SortableSongRow
                  key={s.id}
                  item={s}
                  index={i}
                  onRemove={handleRemoveSong}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <button
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-3 text-sm text-violet-600 hover:bg-violet-50 transition-colors"
      >
        <IconPlus size={16} />
        Agregar canción
      </button>

      {showPicker && (
        <SongPicker
          group={group}
          setlistId={setlist.id}
          existingSongIds={songs.map(s => s.songs.id)}
          onClose={() => setShowPicker(false)}
          onAdded={fetchSongs}
        />
      )}
    </div>
  )
}

function SortableSongRow({ item, index, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3"
    >
      <div
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing"
      >
        <IconGripVertical size={18} />
      </div>
      <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 text-xs font-medium text-violet-600">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.songs.title}</p>
        <p className="text-xs text-gray-500 truncate">{item.songs.artist}</p>
      </div>
      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block">
        {item.songs.original_key} → {item.songs.ministry_key}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"
      >
        <IconTrash size={15} />
      </button>
    </div>
  )
}

function SongPicker({ group, setlistId, existingSongIds, onClose, onAdded }) {
  const [songs, setSongs] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(null)

  useEffect(() => {
    async function fetchSongs() {
      const { data } = await supabase
        .from('songs')
        .select('*')
        .eq('group_id', group.group_id)
        .order('title', { ascending: true })

      if (data) setSongs(data)
      setLoading(false)
    }
    fetchSongs()
  }, [])

  const filtered = songs.filter(s =>
    !existingSongIds.includes(s.id) &&
    ((s.title || '').toLowerCase().includes(search.toLowerCase()) ||
     (s.artist || '').toLowerCase().includes(search.toLowerCase()))
  )

  async function handleAdd(song) {
    setAdding(song.id)

    const position = existingSongIds.length
    const { error } = await supabase.from('setlist_songs').insert({
      setlist_id: setlistId,
      song_id: song.id,
      position,
    })

    if (!error) {
      onAdded()
      onClose()
    }

    setAdding(null)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Agregar canción</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Cerrar</button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar canción..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500"
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <LoadingSpinner message="Cargando canciones..." />
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No hay canciones disponibles.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(song => (
                <div
                  key={song.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-violet-200 hover:bg-violet-50 cursor-pointer transition-colors"
                  onClick={() => handleAdd(song)}
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <IconMusic size={16} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
                    <p className="text-xs text-gray-500 truncate">{song.artist}</p>
                  </div>
                  {adding === song.id ? (
                    <div className="w-5 h-5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                  ) : (
                    <IconPlus size={16} className="text-violet-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}