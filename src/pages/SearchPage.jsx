import React, { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { formatCount, getVerificationBadge } from '../lib/utils'

export default function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [celebrities, setCelebrities] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCelebrities()
  }, [])

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(searchUsers, 400)
      return () => clearTimeout(timer)
    } else {
      setResults([])
    }
  }, [query])

  const loadCelebrities = async () => {
    const { data } = await supabase
      .from('celebrity_accounts')
      .select('*')
      .order('followers_estimate', { ascending: false })
      .limit(20)
    setCelebrities(data || [])
  }

  const searchUsers = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)
    setResults(data || [])
    setLoading(false)
  }

  return (
    <div className="page">
      <div className="header">
        <span className="logo">Search</span>
      </div>

      {/* Search bar */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40, paddingRight: 40 }}
            placeholder="Search people..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <X size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', cursor: 'pointer' }}
              onClick={() => setQuery('')} />
          )}
        </div>
      </div>

      {/* Results */}
      {query.length >= 2 ? (
        <div>
          {loading ? (
            <div style={{ padding: 30, display: 'flex', justifyContent: 'center' }}>
              <div className="spinner"></div>
            </div>
          ) : results.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
              No users found for "{query}"
            </div>
          ) : (
            results.map(user => <UserRow key={user.id} user={user} onClick={() => navigate(`/profile/${user.username}`)} />)
          )}
        </div>
      ) : (
        <>
          {/* Famous People section */}
          <div style={{ padding: '16px 16px 8px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-2)' }}>🌟 Famous People on Famous World</h3>
          </div>
          {celebrities.map(celeb => (
            <div key={celeb.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/profile/${celeb.username}`)}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #E040FB, #FF6B9D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, color: 'white'
              }}>
                {celeb.full_name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{celeb.full_name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="#1DA1F2" />
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                  </svg>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{celeb.username} · {celeb.followers_estimate} followers</div>
              </div>
              {!celeb.is_claimed && (
                <div style={{ 
                  fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 700,
                  background: 'rgba(224,64,251,0.15)', color: 'var(--primary)',
                  border: '1px solid rgba(224,64,251,0.3)'
                }}>
                  CLAIM
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

function UserRow({ user, onClick }) {
  const badge = getVerificationBadge(user)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
      cursor: 'pointer'
    }} onClick={onClick}>
      <Avatar user={user} size={48} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{user.full_name || user.username}</span>
          {badge && (
            <svg width="14" height="14" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill={badge.color} />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
            </svg>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
          @{user.username} · {formatCount(user.followers_count)} followers
        </div>
      </div>
    </div>
  )
}
