import { NavLink, useNavigate } from "react-router-dom"
import { supabase } from "../supabaseClient"
import {
  IconMusic,
  IconClock,
  IconUsers,
  IconLogout,
  IconMusicHeart
} from '@tabler/icons-react'
import { navigatorLock } from "@supabase/supabase-js"

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
        <div className="min-h-screen bg-gray-50 flex">

            <aside className="hidden md:flex flex-col w-52 bg-white border-r border-gray-200 fixed h-full">
                <div className="px-4 pt-5 pb-4 text-base font-semibold text-gray-900 flex items-center gap-2">
                    <IconMusicHeart size={22} className="text-violet-600" />
                    Armonia
                </div>

                <nav className="flex flex-col gap-1 px-2 flex-1">
                    {navItems.map(({to, label, icon: Icon, end}) => 
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
                            <Icon size={18}/>
                            {label}
                        </NavLink>
                    )}
                </nav>

                <div className="px-4 pb-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </aside>
            
            <main className="flex-1 md:ml-52 pb-20 md:pb-0">
                {children}
            </main>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-10">
                {navItems.map(({to, label, icon: Icon, end}) => (
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
            </nav>
        </div>
    )

}