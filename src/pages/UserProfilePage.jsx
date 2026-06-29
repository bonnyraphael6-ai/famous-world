import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import supabase from '../lib/supabase'
import { formatCount, getVerificationBadge } from '../lib/utils'

export default function UserProfilePage() {
  const { username } = useParams()
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    setLoading(true)
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userData) {
      setUser(userData)

      const { data: postsData } = await supabase
        .from('posts')
        .select('*, users(*)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
      setPosts(postsData || [])

      if (currentUser) {
        const { data: followData } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', currentUser.id)
          .eq('following_id', userData.id)
          .single()
        setIsFollowing(!!followData)
      }
    }
    setLoading(false)
  }

  const handleFollow = async () => {
    if (!currentUser || !user) return
    if (isFollowing) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', user.id)
      await supabase.from('users').update({ followers_count: Math.max(0, (user.followers_count || 0) - 1) }).eq('id', user.id)
      setIsFollowing(false)
      setUser(prev => ({ ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) }))
    } else {
      await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: user.id })
      await supabase.from('users').update({ followers_count: (user.followers_count || 0) + 1 }).eq('id', user.id)
      await supabase.from('users').update({ following_count: (currentUser.following_count || 0) + 1 }).eq('id', currentUser.id)

      // Notification
      await supabase.from('notifications').insert({
        user_id: user.id,
        from_user_id: currentUser.id,
        type: 'follow'
      })

      setIsFollowing(true)
      setUser(prev => ({ ...prev, followers_count: (prev.followers_count || 0) + 1 }))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <div className="header">
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
          <span style={{ fontWeight: 700 }}>Profile</span>
          <div />
        </div>
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>User not found</div>
      </div>
    )
  }

  const badge = getVerificationBadge(user)
  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>@{user.username}</span>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
          <Avatar user={user} size={80} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
              {[
                { label: 'Posts', value: posts.length },
                { label: 'Followers', value: user.followers_count || 0 },
                { label: 'Following', value: user.following_count || 0 },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{formatCount(value)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>{user.full_name || user.username}</span>
          {badge && (
            <svg width="16" height="16" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill={badge.color} />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
            </svg>
          )}
        </div>

        {user.bio && <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{user.bio}</p>}
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>📍 {user.country}</div>

        {!isOwnProfile && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`btn ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
              style={{ flex: 1 }}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate('/messages')}>
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
      ) : (
        posts.map(post => <PostCard key={post.id} post={post} />)
      )}
    </div>
  )
}
