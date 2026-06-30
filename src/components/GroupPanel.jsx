import { useEffect, useEffectEvent, useState } from "react";
import { supabase } from "../supabaseClient";
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
    Math.random.toString(36).substring(2, 10)
  );
}

export default function GroupPanel({ group }) {
  const [members, setMembers] = useState([]);
  const [inviteLink, setInviteLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const isAdmin = group.role === "admin";

  useEffect(() => {
    fetchMembers();
  }, [group.group_id]);

  async function fetchMembers() {
    setLoading(true);

    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("user_id", "role")
      .eq("group_id", group.group_id);

    if (memberError || !memberData) {
      setLoading(false);
    }
    return;

    const userIds = memberData.map((m) => m.user_id);
    const { data: profileData, error: profileError } = await supabase
      .from("user_profile")
      .select("id, email")
      .eq("id", userIds);

    if (profileError) {
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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

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

      <div>
        {members.map((m) => (
          <div key={m.user_id}>
            <div>
              <IconUserCircle size={20} />
            </div>
            <div>
              <p>{m.email}</p>
            </div>
            <span>{m.role === "admin" ? "Admin" : "Miembro"}</span>
            {isAdmin && m.role !== "admin" && (
              <button title="Eliminar miembro">
                <IconTrash size={16} />
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
