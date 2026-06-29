import React, { useState, useEffect, useContext } from 'react'
import { Bell, MessageCircle, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import PostCard from '../components/PostCard'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'

export default function HomePage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('forYou')

  useEffect(() => {
    fetchPosts()
  }, [tab])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('posts')
        .select('*, users(*)')
        .order('created_at', { ascending: false })
        .limit(30)

      if (tab === 'following' && currentUser) {
        // Get followed user IDs
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id)
        const ids = follows?.map(f => f.following_id) || []
        if (ids.length > 0) {
          query = query.in('user_id', ids)
        } else {
          setPosts([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query
      if (!error) setPosts(data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div className="logo">Famous World</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Radio size={22} style={{ cursor: 'pointer', color: 'var(--red)' }} onClick={() => navigate('/live')} />
          <MessageCircle size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/messages')} />
          <Bell size={22} style={{ cursor: 'pointer' }} onClick={() => navigate('/notifications')} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab ${tab === 'forYou' ? 'active' : ''}`} onClick={() => setTab('forYou')}>
          For You
        </div>
        <div className={`tab ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>
          Following
        </div>
      </div>

      {/* Posts feed */}
      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          {tab === 'following' ? (
            <>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No posts from people you follow yet</p>
              <p style={{ fontSize: 13 }}>Go explore and follow some people!</p>
            </>
          ) : (
            <>
              <p style={{ fontSize: 16, marginBottom: 8 }}>No posts yet</p>
              <p style={{ fontSize: 13 }}>Be the first to post on Famous World!</p>
            </>
          )}
        </div>
      ) : (
        posts.map(post => (
          <PostCard key={post.id} post={post} onUpdate={fetchPosts} />
        ))
      )}
    </div>
  )
}
