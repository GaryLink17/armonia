import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage' 
import {
  IconLink,
  IconCopy,
  IconCheck,
  IconTrash,
  IconUserCircle,
} from "@tabler/icons-react";

function generateToken() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function GroupPanel({ group }) {
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)
  const isAdmin = group.role === "admin";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- false positive: fetchMembers is a hoisted function declaration, same pattern as fetchSongs/fetchPending elsewhere
    fetchMembers();
  }, [group.group_id]);

  async function fetchMembers() {
    setLoading(true);
    setError(null)

    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("group_id", group.group_id);

    if (memberError || !memberData) {
      setError('No se puedieron cargar los miembros.')
      setLoading(false)
      return;
    }

    const userIds = memberData.map((m) => m.user_id);
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, email")
      .in("id", userIds);

    if (profileError) {
      setError('No pudieron cargarse los perfiles de los miembros.')
      setLoading(false);
      return;
    }

    const enriched = memberData.map((m) => ({
      user_id: m.user_id,
      role: m.role,
      email: profileData.find((p) => p.id === m.user_id)?.email || "Sin correo",
    }));

    setMembers(enriched)
    setLoading(false)
  }

  async function handleRemoveMember(userId) {
    const confirm = window.confirm("Seguro que deseas eliminar este miembro?")
    if (!confirm) return

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', group.group_id)
      .eq('user_id', userId)

    if (!error) setMembers(members.filter(m => m.user_id !== userId))
  }

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

  if (loading) return <LoadingSpinner message="Cargando..." />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {group.groups.name}
        </h2>
        <p className="text-sm text-gray-500">
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {members.map((m) => (
          <div 
            key={m.user_id}
            className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl"
          >
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
              <IconUserCircle size={20} className="text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 truncate">{m.email}</p>
            </div>
            <span className={`text-sm px-2 py-0.5 rounded-full ${
              m.role === 'admin'
                ? 'bg-violet-100 text-violet-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {m.role === "admin" ? "Admin" : "Miembro"}
            </span>
            {isAdmin && m.role !== "admin" && (
              <button 
                onClick={() => handleRemoveMember(m.user_id)} 
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                title="Eliminar miembro"
              >
                <IconTrash size={16}  />
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="border border-gray-300 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconLink size={16} className="text-violet-600" />
            <p className="text-sm font-medium text-gray-700">Enlace de invitacion</p>
          </div>
          {inviteLink ? (
            <div className="flex flex-col gap-2">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm ">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-violet-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-violet-700"
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                {copied ? 'Copiado!' : 'Copiar enlace'}
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
  );
}
