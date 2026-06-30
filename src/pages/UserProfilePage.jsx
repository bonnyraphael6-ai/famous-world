import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import supabase from '../lib/supabase'
import { formatCount, getVerificationBadge } from '../lib/utils'

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

export default function UserProfilePage() {
  const { username } = useParams()
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showFollowers, setShowFollowers] = useState(false)
  const [tab, setTab] = useState('posts')

  useEffect(() => { loadProfile() }, [username])

  const loadProfile = async () => {
    setLoading(true)
    const { data: userData } = await supabase.from('users').select('*').eq('username', username).single()
    if (userData) {
      setUser(userData)
      const { data: postsData } = await supabase.from('posts').select('*, users(*)').eq('user_id', userData.id).order('created_at', { ascending: false })
      setPosts(postsData || [])
      if (currentUser) {
        const { data: followData } = await supabase.from('follows').select('id').eq('follower_id', currentUser.id).eq('following_id', userData.id).single()
        setIsFollowing(!!followData)
      }
    }
    setLoading(false)
  }

  const loadFollowers = async () => {
    const { data } = await supabase.from('follows').select('users!follows_follower_id_fkey(*)').eq('following_id', user.id).limit(100)
    setFollowers(data?.map(d => d.users) || [])
    setShowFollowers(true)
  }

  const handleFollow = async () => {
    if (!currentUser || !user) return
    if (isFollowing) {
      await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', user.id)
      await supabase.from('users').update({ followers_count: Math.max(0, (user.followers_count || 0) - 1) }).eq('id', user.id)
      setIsFollowing(false)
      setUser(prev => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) }))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: user.id })
      await supabase.from('users').update({ followers_count: (user.followers_count || 0) + 1 }).eq('id', user.id)
      await supabase.from('users').update({ following_count: (currentUser.following_count || 0) + 1 }).eq('id', currentUser.id)
      await supabase.from('notifications').insert({ user_id: user.id, from_user_id: currentUser.id, type: 'follow' })
      setIsFollowing(true)
      setUser(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }))
    }
  }

  const handleClaimCelebrity = () => {
    navigate('/messages', { state: { toUser: 'famousworldsupport', message: `Hi, I want to claim the @${username} celebrity account on Famous World.` } })
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><div className="spinner" /></div>

  if (!user) {
    return (
      <div className="page">
        <div className="header">
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <span style={{ fontWeight: 700 }}>Profile</span>
          <div />
        </div>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>👤</p>
          <p style={{ fontSize: 16, marginBottom: 8 }}>This account hasn't been claimed yet</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>This username is reserved for @{username}</p>
          <button className="btn btn-primary" onClick={handleClaimCelebrity}>
            Claim This Account
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === user.id
  const isCelebrity = user.is_celebrity || false

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user.full_name || user.username}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>@{user.username}</div>
        </div>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <Avatar user={user} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(posts.length)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Posts</div>
              </div>
              <div style={{ cursor: 'pointer' }} onClick={loadFollowers}>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(user.followers_count || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Followers</div>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(user.total_likes || 0)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Likes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Name + verified badge */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{user.full_name || user.username}</span>
            <VerifiedBadge user={user} size={16} />
            {user.is_special_account && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700,
                background: user.special_account_type === 'official' ? 'linear-gradient(135deg, #FFD700, #FFA000)' : 'linear-gradient(135deg, #1DA1F2, #0056C0)',
                color: user.special_account_type === 'official' ? '#000' : 'white'
              }}>
                {user.special_account_type === 'official' ? '⭐ OFFICIAL' : '💬 SUPPORT'}
              </span>
            )}
          </div>
          {user.category && <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>{user.category}</div>}
          {user.bio && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 6 }}>{user.bio}</p>}
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>🌍 {user.country}</div>
        </div>

        {/* Claim banner for celebrity accounts */}
        {isCelebrity && !isOwnProfile && (
          <div style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>⭐ This is a reserved celebrity account</span>
            <button onClick={handleClaimCelebrity} style={{ background: 'var(--primary)', border: 'none', borderRadius: 8, padding: '5px 12px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Claim</button>
          </div>
        )}

        {!isOwnProfile && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`} style={{ flex: 1 }} onClick={handleFollow}>
              {isFollowing ? 'Following' : 'Follow'}
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/messages', { state: { toUser: user.username } })}>
              <MessageCircle size={16} /> Message
            </button>
          </div>
        )}
      </div>

      <div className="tabs">
        <div className="tab active">Posts</div>
      </div>

      {posts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 14 }}>No posts yet</p>
        </div>
      ) : posts.map(post => <PostCard key={post.id} post={post} />)}

      {/* Followers Modal */}
      {showFollowers && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--surface-1)', width: '100%', maxHeight: '70vh', borderRadius: '20px 20px 0 0', padding: 20, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Followers</span>
              <button onClick={() => setShowFollowers(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            {followers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-3)' }}>No followers yet</p>}
            {followers.map(f => f && (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, cursor: 'pointer' }}
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
