import { IconArrowLeft, IconMusic, IconBrandYoutube, IconEdit } from '@tabler/icons-react'

export default function SongDetail({ song, isAdmin, onBack, onEdit }) {
return (
  <div className="flex flex-col h-full">
    <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
      >
        <IconArrowLeft size={16} />
        Volver al repertorio
      </button>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-6">
        <div className='flex items-start gap-4 mb-6'>
          <div className='w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0'>
            <IconMusic size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className='flex-1 min-w-0'>
            <h2 className='text-xl font-semibold text-gray-900 dark:text-gray-100'>{song.title}</h2>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-0.5'>{song.artist}</p>
          </div>
          {isAdmin && (
            <button
              onClick={onEdit}
              className='flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 shrink-0'
            >
              <IconEdit size={16} />
              Editar
            </button>
          )}
        </div>

        <div className='grid grid-cols-2 gap-3 mb-6'>
          <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-3'>
            <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1'>Tono original</p>
            <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{song.original_key}</p>
          </div>
          <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-3'>
            <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1'>Tono del ministerio</p>
            <p className='text-sm font-semibold text-gray-900 dark:text-gray-100'>{song.ministry_key}</p>
          </div>
        </div>

        {song.lyrics ? (
          <div className='mb-6'>
            <p className='text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3'>Letra</p>
            <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 leading-5 whitespace-pre-wrap text-center'>
              {song.lyrics}
            </div>
          </div>
        ) : (
          <div className='mb-6 text-center py-8 text-gray-400 dark:text-gray-500 text-sm bg-gray-50 dark:bg-gray-800 rounded-xl'>
            No hay letras registradas para esta cancion.
          </div>
        )}

        {song.youtube_url && (
          <div className='flex justify-center'>
            <a
              href={song.youtube_url}
              target='_blank'
              rel="noopener noreferrer"
              className='flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 w-50 text-sm font-medium shadow-sm shadow-red-500/25 transition-colors'
            >
              <IconBrandYoutube size={20} />
              Escuchar en Youtube
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
)
}
