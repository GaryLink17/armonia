import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
}

export default function GroupPanel({ group }) {
  const [members, setMembers] = useState([])
  const [inviteLink, setInviteLink] = useState(null)
  const [loadingLink, setLoadingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchMembers() {
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, role')
        .eq('group_id', group.group_id)

      if (!error) setMembers(data)
    }

    fetchMembers()
  }, [group.group_id])

  async function handleGenerateLink() {
    setLoadingLink(true)
    const token = generateToken()

    const { error } = await supabase
      .from('invitations')
      .insert({ group_id: group.group_id, token })

    if (!error) {
      const link = `${window.location.origin}/invite/${token}`
      setInviteLink(link)
    }

    setLoadingLink(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full px-4 py-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">{group.groups.name}</h2>
      <p className="text-sm text-gray-500 mb-6">{members.length} miembro{members.length !== 1 ? 's' : ''}</p>

      <div className="flex flex-col gap-2 mb-8">
        {members.map((m, i) => (
          <div key={m.user_id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-semibold flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1 text-sm text-gray-700 font-mono truncate">{m.user_id}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-green-100 text-green-700'}`}>
              {m.role === 'admin' ? 'Admin' : 'Miembro'}
            </span>
          </div>
        ))}
      </div>

      {group.role === 'admin' && (
        <div className="border border-dashed border-gray-300 rounded-xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Enlace de invitación</p>
          {inviteLink ? (
            <div className="flex flex-col gap-2">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 font-mono break-all">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className="bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700"
              >
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateLink}
              disabled={loadingLink}
              className="w-full bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              {loadingLink ? 'Generando...' : 'Generar enlace'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}