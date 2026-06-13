import FaceExpression from './features/components/FaceExpression'
import AuthPanel from './features/auth/components/AuthPanel'
import { AuthProvider, useAuth } from './features/auth/context/AuthContext'
import './App.css'

const App = () => {
  const { user, isBootstrapping, isSubmitting, logout } = useAuth()

  if (isBootstrapping) {
    return (
      <div className="shell shell--loading">
        <div className="panel panel--loading">
          <p className="eyebrow">Emotify</p>
          <h1 className="auth-title">Loading your session...</h1>
          <p className="auth-copy">Checking whether you already have an active auth cookie.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPanel />
  }

  return (
    <div className="app-stage">
      <header className="app-toolbar">
        <div>
          <p className="eyebrow">Signed in</p>
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>

        <button type="button" className="button button--ghost" onClick={logout} disabled={isSubmitting}>
          {isSubmitting ? 'Logging out...' : 'Logout'}
        </button>
      </header>

      <FaceExpression />
    </div>
  )
}

const AppRoot = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
)

export default AppRoot
