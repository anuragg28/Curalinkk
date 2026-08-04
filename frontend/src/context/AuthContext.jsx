import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { TOKEN_KEY } from '../constants/auth'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(Boolean(token))
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function hydrate() {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await apiRequest('/auth/me', { token })
        if (mounted) {
          setUser(data.user)
          setError('')
        }
      } catch {
        if (mounted) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
          setError('')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    hydrate()

    return () => {
      mounted = false
    }
  }, [token])

  async function signIn(values) {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: values,
    })

    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setError('')
    return data.user
  }

  async function signUp(values) {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: values,
    })

    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
    setError('')
    return data.user
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setError('')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        setError,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
