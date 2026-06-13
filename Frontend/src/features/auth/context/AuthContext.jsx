import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { fetchCurrentUser, loginRequest, logoutRequest, registerRequest } from "../services/authService"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const clearError = useCallback(() => {
    setError("")
  }, [])

  const hydrateSession = useCallback(async () => {
    setIsBootstrapping(true)
    setError("")

    try {
      const response = await fetchCurrentUser()
      setUser(response.user)
    } catch (sessionError) {
      setUser(null)
    } finally {
      setIsBootstrapping(false)
    }
  }, [])

  useEffect(() => {
    hydrateSession()
  }, [hydrateSession])

  const register = useCallback(async (payload) => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await registerRequest(payload)
      setUser(response.user)
      return response
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const login = useCallback(async (payload) => {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await loginRequest(payload)
      setUser(response.user)
      return response
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsSubmitting(true)
    setError("")

    try {
      await logoutRequest()
      setUser(null)
    } catch (requestError) {
      setError(requestError.message)
      throw requestError
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      error,
      isBootstrapping,
      isSubmitting,
      clearError,
      register,
      login,
      logout,
    }),
    [clearError, error, isBootstrapping, isSubmitting, login, logout, register, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
