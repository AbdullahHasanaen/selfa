import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { ToastProvider } from './context/ToastProvider'
import ToastContainer from './components/ui/ToastContainer'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import LoginPage from './pages/LoginPage'
import GroupTemplatesPage from './pages/GroupTemplatesPage'
import GroupsPage from './pages/GroupsPage'
import UsersPage from './pages/UsersPage'
import DefaultsPage from './pages/DefaultsPage'
import EmergencyFundPage from './pages/EmergencyFundPage'
import FinancePage from './pages/FinancePage'
import { isAuthenticated } from './utils/auth'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated() ? <Navigate to="/finance" replace /> : <LoginPage />}
          />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/finance" replace />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="group-templates" element={<GroupTemplatesPage />} />
            <Route path="groups" element={<GroupsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="defaults" element={<DefaultsPage />} />
            <Route path="emergency-fund" element={<EmergencyFundPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/finance" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
