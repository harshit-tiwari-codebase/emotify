const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

const buildUrl = (path) => `${API_BASE_URL}${path}`

const parseResponse = async (response) => {
  let payload = null

  try {
    payload = await response.json()
  } catch (error) {
    payload = null
  }

  if (!response.ok) {
    throw new Error(payload?.message || "Auth request failed")
  }

  return payload
}

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  return parseResponse(response)
}

export const registerRequest = (payload) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const loginRequest = (payload) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  })

export const logoutRequest = () =>
  request("/api/auth/logout", {
    method: "GET",
  })

export const fetchCurrentUser = () => request("/api/auth/get-me", { method: "GET" })
