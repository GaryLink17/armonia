import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateGroup({ onGroupCreated }) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleCreate(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Devuelve el usuario que tiene la sesion iniciada
        const { data: { user } } = await supabase.auth.getUser()

        // Crea el grupo
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .insert({ name, created_by: user.id })
            .select() //
            .single()

            // Si hay un error, muestra el mensaje de error y detiene la funcion
            if (groupError) {
                setError(groupError.message)
                setLoading(false)
                return
            }
            // Agrega el usuario al grupo como administrador
            const { error: memberError } = await supabase
                .from('group_members')
                .insert({ group_id: group.id, user_id: user.id, role: 'admin' })
        
            // Si hay un error, muestra el mensaje de error y detiene la funcion
            if (memberError) {
                setError(memberError.message)
                setLoading(false)
                return
            }
        
            // Llama a la funcion onGroupCreated para actualizar el estado del grupo si existe
            onGroupCreated({ group_id: group.id, role: 'admin', groups: group })
            setLoading(false)
    }

    return (
        <div className='relative min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 overflow-hidden'>
            <div className='absolute -top-24 -left-24 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl' />
            <div className='relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 w-full max-w-sm'>
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>Crea un nuevo grupo</h1>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Nombre del grupo</p>
                </div>

                <form onSubmit={handleCreate} className='flex flex-col gap-4'>
                    <div>
                        <label className='text-sm text-gray-600 dark:text-gray-400 mb-1 block'>Nombre del grupo</label>
                        <input
                            type="text" // Tipo de input
                            value={name} // Valor del input
                            onChange={e => setName(e.target.value)} // Funcion para actualizar el estado del input
                            required // Campo requerido
                            className='w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400'
                        />
                    </div>

                    {error && <p className='text-red-500 dark:text-red-400 text-sm'>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className='bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 cursor-pointer disabled:opacity-50'
                    >
                        {loading ? 'Creando grupo...' : 'Crear grupo'}
                    </button>
                </form>
            </div>
        </div>
    )
}