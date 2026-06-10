import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function CreateGroup() {
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
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm'>
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-semibold text-gray-900'>Crea un nuevo grupo</h1>
                    <p className='text-sm text-gray-500 mt-1'>Nombre del grupo</p>
                </div>

                <form onSubmit={handleCreate} className='flex flex-col gap-4'>
                    <div>
                        <label className='text-sm text-gray-600 mb-1 block'>Nombre del grupo</label>
                        <input 
                            type="text" // Tipo de input
                            value={name} // Valor del input
                            onChange={e => setName(e.target.value)} // Funcion para actualizar el estado del input
                            required // Campo requerido
                            className='w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500'
                        />
                    </div>

                    {error && <p className='text-red-500 text-sm'>{error}</p>}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className='bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 cursor-pointer disabled:opacity-50'
                    >
                        {loading ? 'Creando grupo...' : 'Crear grupo'}
                    </button>
                </form>
            </div>
        </div>
    )
}