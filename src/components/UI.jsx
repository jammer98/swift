import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  return <header className="topbar"><div className="nav-wrap"><Link to="/" className="brand"><span className="brand-mark">S</span><span>swift<span className="brand-accent">.</span></span></Link><nav><Link to="/">Find jobs</Link>{user?.role === 'candidate' && <Link to="/my-applications">My applications</Link>}{user?.role === 'employer' && <><Link to="/employer/jobs">My jobs</Link><Link to="/employer/company">Company</Link></>}{user ? <div className="account"><span className="avatar">{user.name?.[0]?.toUpperCase()}</span><span className="account-copy"><b>{user.name}</b><small>{user.role}</small></span><button className="text-button" onClick={logout}>Log out</button></div> : <div className="auth-links"><Link to="/login">Log in</Link><Link className="button button-small" to="/register">Get started</Link></div>}</nav></div></header>
}
export function ProtectedRoute({ roles, children }) { const { user } = useAuth(); const location = useLocation(); if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />; if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />; return children }
export function StatusBadge({ status }) { return <span className={`status status-${status}`}>{status}</span> }
export function Loading() { return <div className="state"><div className="spinner" />Loading...</div> }
export function ErrorMessage({ error, retry }) { return <div className="state error-state"><strong>We couldn't load this.</strong><span>{error?.message || 'Please try again.'}</span>{retry && <button className="button button-secondary" onClick={retry}>Try again</button>}</div> }
export function Empty({ title, text }) { return <div className="empty"><div className="empty-icon">✦</div><h3>{title}</h3>{text && <p>{text}</p>}</div> }
export function Field({ label, children, hint }) { return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label> }
export const fmtDate = value => value ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value)) : '—'
export const salary = (min, max) => min || max ? `${min ? Number(min).toLocaleString() : ''}${min && max ? ' – ' : ''}${max ? Number(max).toLocaleString() : ''}` : null
