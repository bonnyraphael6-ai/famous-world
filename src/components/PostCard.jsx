import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Eye, ExternalLink, MoreHorizontal, Send } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from './Avatar'
import { formatCount, timeAgo, getPlatformName, getPlatformColor, getVerificationBadge } from '../lib/utils'
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

function getPlatformEmbed(url, platform) {
  if (platform === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=0`
  }
  return null
}

export default function PostCard({ post, onUpdate }) {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [liked, setLiked] = useState(post.user_liked || false)
  const [likes, setLikes] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const platform = post.platform || 'other'
  const platformColor = getPlatformColor(platform)
  const embedUrl = getPlatformEmbed(post.link, platform)
  // YouTube thumbnail directly
  const ytThumb = platform === 'youtube' && post.link
    ? (() => { const m = post.link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/); return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null })()
    : null
  const thumbSrc = ytThumb || post.thumbnail_url || null

  const handleLike = async () => {
    if (!currentUser) return
    const newLiked = !liked
    setLiked(newLiked)
    setLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))
    if (newLiked) {
      await supabase.from('likes').insert({ user_id: currentUser.id, post_id: post.id })
      await supabase.from('posts').update({ likes_count: likes + 1 }).eq('id', post.id)
    } else {
      await supabase.from('likes').delete().eq('user_id', currentUser.id).eq('post_id', post.id)
      await supabase.from('posts').update({ likes_count: Math.max(0, likes - 1) }).eq('id', post.id)
    }
  }

  const handleShare = async () => {
    if (navigator.share) await navigator.share({ title: 'Famous World', url: post.link })
    else { navigator.clipboard?.writeText(post.link); alert('Link copied!') }
    await supabase.from('posts').update({ shares_count: (post.shares_count || 0) + 1 }).eq('id', post.id)
  }

  const loadComments = async () => {
    setLoadingComments(true)
    const { data } = await supabase.from('comments')
      .select('*, users(username, full_name, is_verified, verification_color, avatar_url)')
      .eq('post_id', post.id).order('created_at', { ascending: false }).limit(50)
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
      user_id: currentUser.id, post_id: post.id, content: commentText.trim()
    }).select('*, users(username, full_name, is_verified, verification_color, avatar_url)').single()
    if (data) {
      setComments(prev => [data, ...prev])
      setCommentText('')
      await supabase.from('posts').update({ comments_count: (post.comments_count || 0) + 1 }).eq('id', post.id)
    }
  }

  return (
    <div className="post-card fade-in">
      {/* Header - Instagram style: avatar | name + username | time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Avatar user={post.users} size={38} onClick={() => navigate(`/profile/${post.users?.username}`)} />
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/profile/${post.users?.username}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{post.users?.username}</span>
            <VerifiedBadge user={post.users} size={14} />
          </div>
          {post.caption && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 1 }}>{post.users?.full_name}</p>}
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{timeAgo(post.created_at)}</span>
      </div>

      {/* Caption */}
      {post.caption && <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-1)', marginBottom: 10 }}>{post.caption}</p>}

      {/* Media preview */}
      <div style={{ borderRadius: 12, overflow: 'hidden', background: '#111', position: 'relative', minHeight: 200 }}>
        {platform === 'youtube' && ytThumb ? (
          // YouTube: show thumbnail with play button, tap to open
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => window.open(post.link, '_blank')}>
            <img src={ytThumb} alt="YouTube" style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, background: 'rgba(255,0,0,0.9)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '18px solid white', marginLeft: 4 }} />
              </div>
            </div>
            <div style={{ position: 'absolute', top: 8, left: 8, background: '#FF0000', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>YouTube</div>
          </div>
        ) : thumbSrc && !imgError ? (
          <div style={{ cursor: 'pointer' }} onClick={() => window.open(post.link, '_blank')}>
            <img src={thumbSrc} alt="Post" style={{ width: '100%', display: 'block', objectFit: 'cover', minHeight: 180 }}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)} />
            <div style={{ position: 'absolute', top: 8, left: 8, background: platformColor, color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
              {getPlatformName(platform)}
            </div>
          </div>
        ) : (
          // Fallback colored card
          <div style={{ minHeight: 200, background: platformColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}
            onClick={() => window.open(post.link, '_blank')}>
            <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ExternalLink size={26} color="white" />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{getPlatformName(platform)}</span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Tap to view</span>
          </div>
        )}
      </div>

      {/* Actions - Instagram style */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, marginBottom: 6 }}>
        <button onClick={handleLike} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: liked ? '#FF3B5C' : 'var(--text-1)', padding: 0, fontSize: 14, fontWeight: 600 }}>
          <Heart size={24} fill={liked ? '#FF3B5C' : 'none'} strokeWidth={liked ? 0 : 2} />
        </button>
        <button onClick={toggleComments} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-1)', padding: 0 }}>
          <MessageCircle size={24} strokeWidth={2} />
        </button>
        <button onClick={handleShare} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-1)', padding: 0 }}>
          <Share2 size={24} strokeWidth={2} />
        </button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-3)', fontSize: 12 }}>
          <Eye size={14} /> {formatCount(post.views_count)}
        </div>
      </div>

      {/* Likes count */}
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{formatCount(likes)} likes</div>

      {/* Comments count tap to expand */}
      {post.comments_count > 0 && !showComments && (
        <button onClick={toggleComments} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, color: 'var(--text-3)', cursor: 'pointer', marginBottom: 4 }}>
          View all {formatCount(post.comments_count)} comments
        </button>
      )}

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: 8 }}>
          {loadingComments ? <div className="spinner" style={{ margin: '10px auto' }} /> : (
            comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <Avatar user={c.users} size={28} onClick={() => navigate(`/profile/${c.users?.username}`)} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{c.bot_name || c.users?.username}</span>
                  {(c.bot_verified || c.users?.is_verified) && <VerifiedBadge user={c.users || { is_verified: c.bot_verified, verification_color: 'blue' }} size={12} />}
                  {' '}
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{c.content}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(c.created_at)}</div>
                </div>
              </div>
            ))
          )}
          {/* Comment input */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <Avatar user={currentUser} size={28} />
            <input value={commentText} onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitComment()}
              placeholder="Add a comment..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-1)' }} />
            {commentText.trim() && (
              <button onClick={submitComment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>Post</button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
