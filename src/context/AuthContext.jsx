import { createContext, useContext, useState } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('swift_user') || 'null'))
  const persist = data => { localStorage.setItem('swift_token', data.token); localStorage.setItem('swift_user', JSON.stringify(data.user)); setUser(data.user) }
  const login = async body => persist(await api.login(body))
  const register = async body => persist(await api.register(body))
  const logout = () => { localStorage.removeItem('swift_token'); localStorage.removeItem('swift_user'); setUser(null) }
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
