import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export function useProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
    setLoading(false)
  }

  async function updateDisplayName(display_name) {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .update({ display_name })
      .eq('id', user.id)

    if (!error) setProfile(prev => ({ ...prev, display_name }))
    return { error }
  }

  return { profile, loading, updateDisplayName, fetchProfile }
}