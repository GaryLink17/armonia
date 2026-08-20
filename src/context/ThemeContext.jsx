import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

function getStoredTheme() {
  return localStorage.getItem('armonia-theme')
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => getStoredTheme() || getSystemTheme())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (getStoredTheme()) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setThemeState(e.matches ? 'dark' : 'light')

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  function setTheme(next) {
    localStorage.setItem('armonia-theme', next)
    setThemeState(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
