import useAuthController from "../hooks/useAuthController"

const AuthPanel = () => {
  const { error, form, isSubmitting, mode, switchMode, submit, updateField } = useAuthController()

  const isRegisterMode = mode === "register"

  return (
    <div className="shell">
      <section className="panel">
        <p className="eyebrow">Emotify auth</p>
        <h1 className="auth-title">{isRegisterMode ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-copy">
          Register or login to unlock the emotion detector. The frontend keeps the session
          cookie and logs you out through the backend API.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`button ${!isRegisterMode ? "button--primary" : "button--ghost"}`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={`button ${isRegisterMode ? "button--primary" : "button--ghost"}`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder={isRegisterMode ? "Choose a username" : "Use username or email"}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder={isRegisterMode ? "Enter your email" : "Optional if username is filled"}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? "Working..." : isRegisterMode ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AuthPanel
