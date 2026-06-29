import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Grid, Heart, Coins, Shield, LogOut, Radio } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import supabase from '../lib/supabase'
import { formatCount, getVerificationBadge } from '../lib/utils'
import { logout, refreshCurrentUser } from '../lib/auth'

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')
  const [user, setUser] = useState(currentUser)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const refreshed = await refreshCurrentUser()
    if (refreshed) {
      setUser(refreshed)
      setCurrentUser(refreshed)
    }
    
    const { data } = await supabase
      .from('posts')
      .select('*, users(*)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
  }

  const badge = getVerificationBadge(user)

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <span style={{ fontWeight: 700, fontSize: 17 }}>@{user?.username}</span>
        <div style={{ display: 'flex', gap: 14 }}>
          {user?.is_admin && (
            <Shield size={22} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/admin')} />
          )}
          <Settings size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/settings')} />
        </div>
      </div>

      {/* Profile info */}
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <Avatar user={user} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
              {[
                { label: 'Posts', value: user?.total_posts || posts.length },
                { label: 'Followers', value: user?.followers_count || 0 },
                { label: 'Following', value: user?.following_count || 0 },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(value)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Name + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{user?.full_name || user?.username}</span>
          {badge && (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill={badge.color} />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
            </svg>
          )}
          {user?.is_special_account && (
            <span style={{ 
              fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
              background: user.special_account_type === 'official' ? 'linear-gradient(135deg, #FFD700, #FFA000)' : 'linear-gradient(135deg, #1DA1F2, #0056C0)',
              color: user.special_account_type === 'official' ? '#000' : 'white'
            }}>
              {user.special_account_type === 'official' ? '⭐ OFFICIAL' : '💬 SUPPORT'}
            </span>
          )}
        </div>

        {user?.bio && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{user.bio}</p>}
        
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
          📍 {user?.country} · Joined {new Date(user?.joined_date || user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>

        {/* Total likes */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
            <Heart size={14} fill="var(--red)" color="var(--red)" />
            <span>{formatCount(user?.total_likes || 0)} likes</span>
          </div>
          <div className="coin-badge">
            🪙 {formatCount(user?.famous_coins || 0)} coins
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/settings')}>
            Edit Profile
          </button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/live')}>
            <Radio size={14} /> Go Live
          </button>
          <button onClick={handleLogout} style={{ 
            background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.2)',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: 'var(--red)'
          }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          <Grid size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Posts
        </div>
        <div className={`tab ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>
          <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Liked
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📸</p>
          <p style={{ fontSize: 16 }}>No posts yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Share your first link to get started!</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} onUpdate={loadProfile} />)
      )}
    </div>
  )
}
