import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Eye, ExternalLink, MoreHorizontal, X, Send } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from './Avatar'
import { formatCount, timeAgo, getPlatformName, getPlatformColor, getPlatformIcon, getVerificationBadge } from '../lib/utils'
import supabase from '../lib/supabase'

function VerifiedBadge({ user, size = 14 }) {
  const badge = getVerificationBadge(user)
  if (!badge) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={badge.color} />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
    </svg>
  )
}

export default function PostCard({ post, onUpdate }) {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.user_liked || false)
  const [likes, setLikes] = useState(post.likes_count || 0)
  const [showOptions, setShowOptions] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [imgError, setImgError] = useState(false)

  const badge = getVerificationBadge(post.users)
  const platform = post.platform || 'other'
  const platformColor = getPlatformColor(platform)
  const platformIcon = getPlatformIcon(platform)

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

  const openLink = () => window.open(post.link, '_blank')

  const loadComments = async () => {
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('*, users(username, full_name, is_verified, verification_color, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setComments(data || [])
    setLoadingComments(false)
  }

  const toggleComments = () => {
    if (!showComments) loadComments()
    setShowComments(!showComments)
  }

  const submitComment = async () => {
    if (!commentText.trim() || !currentUser) return
    const { data } = await supabase.from('comments').insert({
      user_id: currentUser.id,
      post_id: post.id,
      content: commentText.trim()
    }).select('*, users(username, full_name, is_verified, verification_color, avatar_url)').single()
    if (data) {
      setComments(prev => [data, ...prev])
      setCommentText('')
      await supabase.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', post.id)
    }
  }

  // Build thumbnail URL using microlink for non-YouTube
  const thumbnailUrl = post.thumbnail_url && !imgError ? post.thumbnail_url : null
  const microlinkUrl = post.link ? `https://api.microlink.io/?url=${encodeURIComponent(post.link)}&screenshot=true&meta=false&embed=screenshot.url` : null

  return (
    <div className="post-card fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar user={post.users} size={40} onClick={() => navigate(`/profile/${post.users?.username}`)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              onClick={() => navigate(`/profile/${post.users?.username}`)}>
              {post.users?.full_name || post.users?.username}
            </span>
            <VerifiedBadge user={post.users} size={14} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            @{post.users?.username} · {timeAgo(post.created_at)}
          </div>
        </div>
        <MoreHorizontal size={20} style={{ color: 'var(--text-3)', cursor: 'pointer' }} onClick={() => setShowOptions(!showOptions)} />
      </div>

      {/* Caption */}
      {post.caption && (
        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.5, color: 'var(--text-2)' }}>{post.caption}</p>
      )}

      {/* Thumbnail */}
      <div className="post-thumbnail" style={{ cursor: 'pointer', overflow: 'hidden', borderRadius: 12, position: 'relative', minHeight: 200, background: '#111' }} onClick={openLink}>
        {thumbnailUrl && !imgError ? (
          <img src={thumbnailUrl} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgError(true)} />
        ) : microlinkUrl ? (
          <img src={microlinkUrl} alt="Post preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => {}} />
        ) : (
          <div style={{
            width: '100%', minHeight: 200,
            background: platformColor,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12
          }}>
            <span style={{ fontSize: 48 }}>{platformIcon}</span>
            <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: 17, fontWeight: 700 }}>
              {getPlatformName(platform)} Post
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Tap to view</span>
          </div>
        )}

        {/* Platform badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: platformColor, color: 'white', fontSize: 11, fontWeight: 700,
          padding: '3px 10px', borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          {platformIcon} {getPlatformName(platform)}
        </div>

        {/* View button */}
        <div style={{
          position: 'absolute', bottom: 10, right: 10,
          background: 'rgba(0,0,0,0.7)', borderRadius: 20,
          padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, color: 'white', fontWeight: 600
        }}>
          <ExternalLink size={11} /> View
        </div>
      </div>

      {/* Views */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
        <Eye size={12} style={{ marginTop: 1 }} />
        <span>{formatCount(post.views_count)} views</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <button onClick={handleLike} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: liked ? 'var(--red)' : 'var(--text-3)', fontSize: 14, fontWeight: 600, padding: 0
        }}>
          <Heart size={22} fill={liked ? 'var(--red)' : 'none'} />
          {formatCount(likes)}
        </button>

        <button onClick={toggleComments} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: showComments ? 'var(--primary)' : 'var(--text-3)', fontSize: 14, fontWeight: 600, padding: 0
        }}>
          <MessageCircle size={22} />
          {formatCount(post.comments_count)}
        </button>

        <button onClick={handleShare} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--text-3)', fontSize: 14, fontWeight: 600, padding: 0
        }}>
          <Share2 size={22} />
          {formatCount(post.shares_count)}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Avatar user={currentUser} size={30} />
            <div style={{ flex: 1, display: 'flex', gap: 8, background: 'var(--surface-2)', borderRadius: 20, padding: '6px 12px', alignItems: 'center' }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitComment()}
                placeholder="Add a comment..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-1)', fontSize: 13 }}
              />
              <button onClick={submitComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}>
                <Send size={16} />
              </button>
            </div>
          </div>

          {/* Comments list */}
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner" /></div>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', padding: 12 }}>No comments yet. Be the first!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <Avatar user={comment.users} size={30} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: comment.users?.is_verified ? 'var(--primary)' : 'var(--text-1)' }}>
                      {comment.users?.full_name || comment.users?.username}
                    </span>
                    <VerifiedBadge user={comment.users} size={12} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '2px 0' }}>{comment.content}</p>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(comment.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
