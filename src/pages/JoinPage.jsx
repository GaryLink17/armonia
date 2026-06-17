import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function JoinPage() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [error, setError] = useState(null)

    /* Unirse al grupo */
    useEffect(() => {
        /* Verificar si el usuario esta autenticado */
        async function joinGroup() {

            /* Obtener el usuario autenticado */
            const { data: { user } } = await supabase.auth.getUser()

            
            if (!user) {
                localStorage.setItem('pendingInviteToken', token)
                navigate('/')
                return
            }

            /* Verificar si la invitacion es valida */
            const { data: invitacion, error: inviteError } = await supabase
                .from('invitations')
                .select('group_id')
                .eq('token', token)
                .single()

            /* Si la invitacion no es valida, mostrar un mensaje de error */
            if (inviteError || !invitacion) {
                setError('El enlace de invitacion no es valido.')
                return
            }
            
            /* Agregar el usuario al grupo */
            const { error: memberError } = await supabase /* Si hay un error, mostrar un mensaje de error */
                .from('group_members')
                .insert({ group_id: invitacion.group_id, user_id: user.id, role: 'member' })

            /* Si hay un error, mostrar un mensaje de error */
            if (memberError && memberError.code !== '23505') {
                setError('No se puedo unir al grupo')
                return
            }

            navigate('/dashboard')
        }

        joinGroup()
    }, [token])

    return (
        <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center'>
                <h1 className='text-xl font-semibold text-gray-900 mb-2'>Armonia</h1>
                {error
                    ? <p className='text-red-500 text-sm'>{error}</p>
                    : <p className='text-green-500 text-sm'>Verificando invitacion...</p>
                }
            </div>
        </div>
    )
}