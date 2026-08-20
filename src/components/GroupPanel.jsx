import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import { useProfile } from "../hooks/useProfile";
import {
  IconLink,
  IconCopy,
  IconCheck,
  IconTrash,
  IconUserCircle,
  IconLogout,
} from "@tabler/icons-react";
import { useToast } from "../context/ToastContext";


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
  const [error, setError] = useState(null);
  const isAdmin = group.role === "admin";
  const { profile, updateDisplayName } = useProfile();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const {showToast} = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- false positive: fetchMembers is a hoisted function declaration, same pattern as fetchSongs/fetchPending elsewhere
    fetchMembers();
  }, [group.group_id]);

  async function fetchMembers() {
    setLoading(true);
    setError(null);

    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("group_id", group.group_id);

    if (memberError || !memberData) {
      setError("No se pudieron cargar los miembros.");
      setLoading(false);
      return;
    }

    const userIds = memberData.map((m) => m.user_id);

    const [{ data: profileData }, { data: displayData }] = await Promise.all([
      supabase.from("user_profiles").select("id, email").in("id", userIds),
      supabase.from("profiles").select("id, display_name").in("id", userIds),
    ]);

    const enriched = memberData.map((m) => ({
      user_id: m.user_id,
      role: m.role,
      email:
        profileData?.find((p) => p.id === m.user_id)?.email || "Sin correo",
      display_name:
        displayData?.find((p) => p.id === m.user_id)?.display_name || null,
    }));

    setMembers(enriched);
    setLoading(false);
  }

  async function handleRemoveMember(userId) {
    const confirm = window.confirm("Seguro que deseas eliminar este miembro?");
    if (!confirm) return;

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", group.group_id)
      .eq("user_id", userId);

    if (!error) {
      setMembers(members.filter((m) => m.user_id !== userId));
      showToast('Miembro eliminado')
    }
  }

  async function handleGenerateLink() {
    setLoadingLink(true);
    const token = generateToken();

    const { error } = await supabase
      .from("invitations")
      .insert({ group_id: group.group_id, token });

    if (!error) {
      const link = `${window.location.origin}/invite/${token}`;
      setInviteLink(link);
    }

    setLoadingLink(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <LoadingSpinner message="Cargando..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {group.groups.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {members.map((m) => (
          <div
            key={m.user_id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-xl"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <IconUserCircle size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                {m.display_name || m.email}
              </p>
            </div>
            <span
              className={`text-sm px-2 py-0.5 rounded-full ${
                m.role === "admin"
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                  : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
              }`}
            >
              {m.role === "admin" ? "Admin" : "Miembro"}
            </span>
            {isAdmin && m.role !== "admin" && (
              <button
                onClick={() => handleRemoveMember(m.user_id)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400"
                title="Eliminar miembro"
              >
                <IconTrash size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconLink size={16} className="text-blue-600 dark:text-blue-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enlace de invitacion
            </p>
          </div>
          {inviteLink ? (
            <div className="flex flex-col gap-2">
              <div className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-3 py-2 text-sm ">
                {inviteLink}
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10"
              >
                {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                {copied ? "Copiado!" : "Copiar enlace"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenerateLink}
              disabled={loadingLink}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
            >
              {loadingLink ? "Generando..." : "Generar enlace"}
            </button>
          )}
        </div>
      )}

      <div className="mt-8">
        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
          Cuenta
        </p>

        {editingName ? (
          <div className="flex flex-col gap-2 mb-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={50}
              className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 dark:focus:border-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingName(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                disabled={savingName || !newName.trim()}
                onClick={async () => {
                  setSavingName(true);
                  await updateDisplayName(newName.trim());
                  setSavingName(false);
                  setEditingName(false);
                  fetchMembers();
                  showToast('Nombre actualizado')
                }}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-600/25 dark:shadow-blue-500/10 disabled:opacity-50"
              >
                {savingName ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setNewName(profile?.display_name || "");
              setEditingName(true);
            }}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-2"
          >
            <IconUserCircle size={16} />
            {profile?.display_name ? "Editar nombre" : "Agregar nombre"}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900 transition-colors"
        >
          <IconLogout size={16} />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
