import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Search, PlusSquare, Bell, User } from 'lucide-react'
import { UserContext } from '../App'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useContext(UserContext)
  const path = location.pathname

  const items = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusSquare, label: 'Post', path: '/create' },
    { icon: Bell, label: 'Alerts', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' }
  ]

  return (
    <nav className="bottom-nav">
      {items.map(({ icon: Icon, label, path: itemPath }) => (
        <div
          key={itemPath}
          className={`nav-item ${path === itemPath ? 'active' : ''}`}
          onClick={() => navigate(itemPath)}
        >
          {itemPath === '/create' ? (
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #E040FB, #9C27B0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Icon size={22} color="white" />
            </div>
          ) : (
            <>
              <Icon size={24} />
              <span>{label}</span>
            </>
          )}
        </div>
      ))}
    </nav>
  )
}
