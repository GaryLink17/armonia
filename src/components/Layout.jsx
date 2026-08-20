import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo.svg";
import {
  IconMusic,
  IconClock,
  IconUsers,
  IconLogout,
  IconPlaylist,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/");
  }

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  const navItems = [
    { to: "/dashboard", label: "Repertorio", icon: IconMusic, end: true },
    { to: "/dashboard/setlists", label: "Setlists", icon: IconPlaylist },
    { to: "/dashboard/pendientes", label: "Pendientes", icon: IconClock },
    { to: "/dashboard/grupo", label: "Grupo", icon: IconUsers },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar — solo desktop */}
      <aside className="hidden md:flex flex-col w-52 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm fixed top-0 left-0 h-full z-10">
        <div className="px-4 pt-5 pb-4 text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <img src={logo} alt="Armonia" className="w-8 h-8" />
          Armonia
        </div>

        <nav className="flex flex-col gap-1 px-2 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors border-l-2 ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-medium border-blue-600"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-4 flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <IconLogout size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Toggle de tema — solo mobile, flotante */}
      <button
        onClick={toggleTheme}
        className="md:hidden fixed top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-600 dark:text-gray-400"
      >
        {theme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>

      {/* Contenido principal */}
      <div className="md:ml-52 h-screen pb-20 md:pb-0 overflow-x-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Bottom nav — solo mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm flex justify-around py-2 z-10">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
                isActive ? "text-blue-700 dark:text-blue-400 font-medium" : "text-gray-500 dark:text-gray-400"
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
