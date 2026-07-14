import { Routes, Route } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import JoinPage from './pages/JoinPage'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NewPasswordPage from './pages/NewPasswordPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/invite/:token" element={<JoinPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/new-password" element={<NewPasswordPage />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App