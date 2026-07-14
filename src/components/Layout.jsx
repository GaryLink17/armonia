import { NavLink, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import logo from "../assets/logo.svg"
import {
  IconMusic,
  IconClock,
  IconUsers,
  IconLogout
} from '@tabler/icons-react'

export default function Layout({ children }) {
    const navigate = useNavigate()

    async function handleLogout() {
        await supabase.auth.signOut()
        navigate('/')
    }

    const navItems = [
        { to: '/dashboard', label: 'Repertorio', icon: IconMusic, end: true },
        { to: '/dashboard/pendientes', label: 'Pendientes', icon: IconClock },
        { to: '/dashboard/grupo', label: 'Grupo', icon: IconUsers }
    ]

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sidebar — solo desktop */}
            <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-200 fixed top-0 left-0 h-full z-10">
                <div className="px-4 pt-5 pb-4 text-base font-semibold text-gray-900 flex items-center gap-2">
                    <img src={logo} alt="Armonia" className="w-8 h-8"  />
                    Armonia
                </div>

                <nav className="flex flex-col gap-1 px-2 flex-1">
                    {navItems.map(({ to, label, icon: Icon, end }) =>
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive
                                    ? 'bg-violet-50 text-violet-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    )}
                </nav>

                <div className="px-4 pb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <IconLogout size={18} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="md:ml-52 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
                {children}
            </div>

            {/* Bottom nav — solo mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
                {navItems.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
                                isActive ? 'text-violet-700 font-medium' : 'text-gray-500'
                            }`
                        }
                    >
                        <Icon size={22} />
                        {label}
                    </NavLink>
                ))}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-0.5 px-4 py-1 text-sm text-gray-500"

                >
                    <IconLogout size={22}/>
                    Salir
                </button>
            </nav>
        </div>
    )
}