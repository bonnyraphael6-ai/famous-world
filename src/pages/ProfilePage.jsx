import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Grid, Heart, Shield, LogOut, Radio } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import supabase from '../lib/supabase'
import { formatCount, getVerificationBadge } from '../lib/utils'
import { logout, refreshCurrentUser } from '../lib/auth'

function VerifiedBadge({ user, size = 16 }) {
  const badge = getVerificationBadge(user)
  if (!badge) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={badge.color} />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
    </svg>
  )
}

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('posts')
  const [user, setUser] = useState(currentUser)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const refreshed = await refreshCurrentUser()
    if (refreshed) { setUser(refreshed); setCurrentUser(refreshed) }
    const { data } = await supabase.from('posts').select('*, users(*)').eq('user_id', currentUser.id).order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const loadFollowers = async () => {
    const { data } = await supabase.from('follows').select('users!follows_follower_id_fkey(*)').eq('following_id', currentUser.id).limit(100)
    setFollowers(data?.map(d => d.users) || [])
    setShowFollowers(true)
  }

  const loadFollowing = async () => {
    const { data } = await supabase.from('follows').select('users!follows_following_id_fkey(*)').eq('follower_id', currentUser.id).limit(100)
    setFollowing(data?.map(d => d.users) || [])
    setShowFollowing(true)
  }

  const handleLogout = () => { logout(); setCurrentUser(null) }

  return (
    <div className="page">
      <div className="header">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{user?.full_name || user?.username}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>@{user?.username}</span>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {user?.is_admin && <Shield size={22} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => navigate('/admin')} />}
          <Settings size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/settings')} />
        </div>
      </div>

      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <Avatar user={user} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(user?.total_posts || posts.length)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Posts</div>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={loadFollowers}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(user?.followers_count || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Followers</div>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={loadFollowing}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(user?.total_likes || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Name + badge + category */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{user?.full_name || user?.username}</span>
            <VerifiedBadge user={user} size={16} />
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
          {user?.category && <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{user.category}</div>}
          {user?.bio && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 6 }}>{user.bio}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-3)' }}>
            <span>🌍 {user?.country}</span>
            <span>·</span>
            <div className="coin-badge" style={{ fontSize: 12 }}>🪙 {formatCount(user?.famous_coins || 0)} coins</div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/settings')}>Edit Profile</button>
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
          <Grid size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Posts
        </div>
        <div className={`tab ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>
          <Heart size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Liked
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📸</p>
          <p style={{ fontSize: 16 }}>No posts yet</p>
        </div>
      ) : posts.map(post => <PostCard key={post.id} post={post} onUpdate={loadProfile} />)}

      {/* Followers Modal */}
      {showFollowers && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--surface-1)', width: '100%', maxHeight: '70vh', borderRadius: '20px 20px 0 0', padding: 20, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Followers</span>
              <button onClick={() => setShowFollowers(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {followers.map(f => f && (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}
                onClick={() => { setShowFollowers(false); navigate(`/profile/${f.username}`) }}>
                <Avatar user={f} size={42} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{f.full_name || f.username}</span>
                    <VerifiedBadge user={f} size={13} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>@{f.username}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
