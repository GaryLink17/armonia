import { useEffect, useState } from "react"
import { supabase } from "../supabaseClient"
import CreateGroup from '../components/CreateGroup'

export default function Dashboard() {
    const [group, setGroup] = useState(undefined)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGroup() {
            const { data: { user } } = await supabase.auth.getUser()

            const { data, error } = await supabase
                .from('group_members')
                .select('group_id, role, groups(id, name)')
                .eq('user_id', user.id)
                .single()

                if (error || !data) setGroup(null)
                    else setGroup(data)

                setLoading(false)
        }

        fetchGroup()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
    )

    if (!group) return <CreateGroup onGroupCreated={setGroup} />

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">{group.groups.name}</h1>
                <p className="text-sm text-gray-500 mt-1">Rol: {group.role}</p>
            </div>
        </div>
    )
}