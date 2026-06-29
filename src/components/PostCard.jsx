import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Eye, ExternalLink, MoreHorizontal } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from './Avatar'
import { formatCount, timeAgo, getPlatformName, getPlatformColor, getVerificationBadge } from '../lib/utils'
import supabase from '../lib/supabase'

export default function PostCard({ post, onUpdate }) {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.user_liked || false)
  const [likes, setLikes] = useState(post.likes_count || 0)
  const [showOptions, setShowOptions] = useState(false)

  const badge = getVerificationBadge(post.users)
  const platform = post.platform || 'other'
  const platformColor = getPlatformColor(platform)

  const handleLike = async () => {
    if (!currentUser) return
    const newLiked = !liked
    setLiked(newLiked)
    setLikes(prev => newLiked ? prev + 1 : prev - 1)

    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUser.id, post_id: post.id })
      await supabase.from('posts').update({ likes_count: likes + 1 }).eq('id', post.id)
    } else {
      await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('post_id', post.id)
      await supabase.from('posts').update({ likes_count: Math.max(0, likes - 1) }).eq('id', post.id)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Check this out on Famous World', url: post.link })
    } else {
      navigator.clipboard.writeText(post.link)
      alert('Link copied!')
    }
    await supabase.from('posts').update({ shares_count: (post.shares_count || 0) + 1 }).eq('id', post.id)
  }

  const openLink = () => {
    window.open(post.link, '_blank')
  }

  return (
    <div className="post-card fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar 
          user={post.users} 
          size={40} 
          onClick={() => navigate(`/profile/${post.users?.username}`)}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span 
              style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.users?.username}`)}
            >
              {post.users?.full_name || post.users?.username}
            </span>
            {badge && (
              <svg width="14" height="14" viewBox="0 0 24 24" className="verified-icon">
                <circle cx="12" cy="12" r="10" fill={badge.color} />
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
              </svg>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            @{post.users?.username} · {timeAgo(post.created_at)}
          </div>
        </div>
        <MoreHorizontal 
          size={20} 
          style={{ color: 'var(--text-3)', cursor: 'pointer' }}
          onClick={() => setShowOptions(!showOptions)}
        />
      </div>

      {/* Caption */}
      {post.caption && (
        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5, color: 'var(--text-2)' }}>
          {post.caption}
        </p>
      )}

      {/* Thumbnail / Link Preview */}
      <div 
        className="post-thumbnail"
        style={{ cursor: 'pointer' }}
        onClick={openLink}
      >
        {post.thumbnail_url ? (
          <img 
            src={post.thumbnail_url} 
            alt={post.title || 'Post'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div style={{ 
            width: '100%', height: '100%', 
            background: platformColor,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12
          }}>
            <ExternalLink size={40} color="rgba(255,255,255,0.8)" />
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 700 }}>
              {getPlatformName(platform)} Post
            </span>
          </div>
        )}

        {/* Platform badge */}
        <div 
          className="platform-badge"
          style={{ 
            background: platformColor,
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {getPlatformName(platform)}
        </div>

        {/* Play icon overlay hint */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.6)', borderRadius: 20,
          padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: 'white'
        }}>
          <ExternalLink size={10} /> View
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, fontSize: 12, color: 'var(--text-3)' }}>
        <Eye size={12} style={{ marginTop: 1 }} />
        <span>{formatCount(post.views_count)} views</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <button 
          onClick={handleLike}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: liked ? 'var(--red)' : 'var(--text-3)',
            fontSize: 14, fontWeight: 600, padding: 0
          }}
        >
          <Heart size={22} fill={liked ? 'var(--red)' : 'none'} />
          {formatCount(likes)}
        </button>

        <button 
          onClick={() => navigate(`/profile/${post.users?.username}`)}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-3)', fontSize: 14, fontWeight: 600, padding: 0
          }}
        >
          <MessageCircle size={22} />
          {formatCount(post.comments_count)}
        </button>

        <button 
          onClick={handleShare}
          style={{ 
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-3)', fontSize: 14, fontWeight: 600, padding: 0
          }}
        >
          <Share2 size={22} />
          {formatCount(post.shares_count)}
        </button>
      </div>
    </div>
  )
}
