import { useMemo, useState } from "react"
import { useAuth } from "../context/AuthContext"

const createInitialForm = () => ({
  username: "",
  email: "",
  password: "",
})

const useAuthController = () => {
  const { user, error, isSubmitting, register, login, logout, clearError } = useAuth()
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState(createInitialForm())
  const [validationError, setValidationError] = useState("")

  const updateField = (field, value) => {
    clearError()
    setValidationError("")
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(createInitialForm())
  }

  const switchMode = (nextMode) => {
    clearError()
    setValidationError("")
    setMode(nextMode)
  }

  const submit = async (event) => {
    event.preventDefault()
    clearError()
    setValidationError("")

    const username = form.username.trim()
    const email = form.email.trim()
    const password = form.password.trim()

    if (mode === "register") {
      if (!username || !email || !password) {
        setValidationError("Username, email, and password are required.")
        return
      }

      await register({ username, email, password })
      resetForm()
      return
    }

    if (!username && !email) {
      setValidationError("Enter a username or email.")
      return
    }

    if (!password) {
      setValidationError("Password is required.")
      return
    }

    await login({ username: username || undefined, email: email || undefined, password })
    resetForm()
  }

  return useMemo(
    () => ({
      user,
      error: validationError || error,
      isSubmitting,
      mode,
      form,
      switchMode,
      updateField,
      submit,
      logout,
    }),
    [error, form, isSubmitting, logout, mode, submit, updateField, user, validationError],
  )
}

export default useAuthController
