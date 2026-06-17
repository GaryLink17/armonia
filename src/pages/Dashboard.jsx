import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import CreateGroup from '../components/CreateGroup'
import GroupPanel from '../components/GroupPanel'
import SongList from '../components/SongList'

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
    <Routes>
      <Route path="/" element={<SongList group={group} />} />
      <Route path="/pendientes" element={<div className="p-6 text-gray-500 text-sm">Próximamente — Canciones pendientes</div>} />
      <Route path="/grupo" element={<GroupPanel group={group} />} />
    </Routes>
  )
}