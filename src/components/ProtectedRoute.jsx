import { useEffect, useState } from "react"
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import SetupProfilePage from './SetupProfilePage'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchProfile()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }

  if (session === undefined || profile === undefined) return null

  if (!session) return <Navigate to="/" />

  if (!profile?.display_name) {
    return <SetupProfilePage onComplete={fetchProfile} />
  }

  return children
}