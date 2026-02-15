import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/useAuth'
import { Login } from './components/Login'
import { AccountList } from './components/AccountList'
import { CreateAccount } from './components/CreateAccount'
import { AccountDetail } from './components/AccountDetail'
import { NoteDetail } from './components/NoteDetail'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <AccountList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/new"
        element={
          <ProtectedRoute>
            <CreateAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:id"
        element={
          <ProtectedRoute>
            <AccountDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:accountId/notes/:noteId"
        element={
          <ProtectedRoute>
            <NoteDetail />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
