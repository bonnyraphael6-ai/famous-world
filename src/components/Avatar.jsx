import React from 'react'
import { getInitials, getVerificationBadge } from '../lib/utils'

export default function Avatar({ user, size = 40, showBadge = true, onClick }) {
  const initials = getInitials(user?.full_name || user?.username || 'U')
  const badge = showBadge ? getVerificationBadge(user) : null

  const style = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: size * 0.35,
    borderRadius: '50%',
    background: user?.avatar_url ? 'transparent' : 'linear-gradient(135deg, #E040FB, #9C27B0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    color: 'white',
    cursor: onClick ? 'pointer' : 'default',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }} onClick={onClick}>
      <div style={style}>
        {user?.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.username}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : initials}
      </div>
      {badge && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: size * 0.35,
          height: size * 0.35,
          background: badge.color,
          borderRadius: '50%',
          border: '2px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width={size * 0.2} height={size * 0.2} viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
      )}
    </div>
  )
}
