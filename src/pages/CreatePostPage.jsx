import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Link, Loader } from 'lucide-react'
import { UserContext } from '../App'
import supabase from '../lib/supabase'
import { detectPlatform, fetchLinkMeta, getPlatformName, getPlatformColor } from '../lib/utils'
import { simulateBotEngagement } from '../lib/bots'

export default function CreatePostPage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleLinkChange = async (val) => {
    setLink(val)
    setPreview(null)
    if (val.startsWith('http') && val.length > 15) {
      setLoadingPreview(true)
      const meta = await fetchLinkMeta(val)
      setPreview(meta)
      setLoadingPreview(false)
    }
  }

  const handlePost = async () => {
    if (!link.trim()) return setError('Please paste a link to post')
    if (!link.startsWith('http')) return setError('Please enter a valid URL starting with http')

    setLoading(true)
    setError('')

    const platform = detectPlatform(link)
    const meta = preview || await fetchLinkMeta(link)

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: currentUser.id,
        link: link.trim(),
        platform,
        thumbnail_url: meta.thumbnail_url || '',
        title: meta.title || `${getPlatformName(platform)} Post`,
        caption: caption.trim(),
        likes_count: 0,
        views_count: 0,
        comments_count: 0,
        shares_count: 0
      })
      .select()
      .single()

    if (postError) {
      setLoading(false)
      return setError(postError.message)
    }

    // Update post count
    await supabase.from('users').update({ 
      total_posts: (currentUser.total_posts || 0) + 1 
    }).eq('id', currentUser.id)

    // Trigger bot engagement (delayed)
    setTimeout(async () => {
      await simulateBotEngagement(post.id, currentUser.id, currentUser.followers_count || 0)
    }, 2000)

    setSuccess(true)
    setLoading(false)

    setTimeout(() => navigate('/'), 2000)
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ fontSize: 60 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>Post Shared!</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Your post is now live on Famous World</p>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Redirecting to home...</div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700, fontSize: 17 }}>New Post</span>
        <button 
          className="btn btn-primary btn-sm"
          onClick={handlePost}
          disabled={loading || !link}
        >
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Share'}
        </button>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Info */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(224,64,251,0.1), rgba(156,39,176,0.1))',
          border: '1px solid rgba(224,64,251,0.2)',
          borderRadius: 12, padding: 16
        }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>
            📎 Paste a link from <strong style={{ color: 'var(--primary)' }}>Instagram, TikTok, YouTube, Twitter/X, or Facebook</strong>. 
            Your post will appear instantly to other users!
          </p>
        </div>

        {/* Link input */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>
            POST LINK *
          </label>
          <div style={{ position: 'relative' }}>
            <Link size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input
              className="input"
              style={{ paddingLeft: 38 }}
              placeholder="https://www.instagram.com/p/..."
              value={link}
              onChange={e => handleLinkChange(e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        {loadingPreview && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
            <div className="spinner" style={{ width: 20, height: 20 }}></div>
            Loading preview...
          </div>
        )}
        {preview && !loadingPreview && (
          <div style={{ background: 'var(--bg-2)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              height: 180,
              background: getPlatformColor(preview.platform),
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {preview.thumbnail_url ? (
                <img src={preview.thumbnail_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🔗</div>
                  <div style={{ fontWeight: 700 }}>{getPlatformName(preview.platform)} Post</div>
                </div>
              )}
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ 
                display: 'inline-block', padding: '2px 10px', borderRadius: 20,
                background: getPlatformColor(preview.platform),
                fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 6
              }}>
                {getPlatformName(preview.platform)}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Post preview loaded ✓</p>
            </div>
          </div>
        )}

        {/* Caption */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8, display: 'block' }}>
            CAPTION (optional)
          </label>
          <textarea
            className="input"
            style={{ height: 100, resize: 'none', lineHeight: 1.5 }}
            placeholder="Write a caption..."
            value={caption}
            onChange={e => setCaption(e.target.value)}
            maxLength={500}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {caption.length}/500
          </div>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)',
            borderRadius: 10, padding: 12, color: 'var(--red)', fontSize: 14
          }}>
            {error}
          </div>
        )}

        <button 
          className="btn btn-primary btn-block" 
          style={{ height: 52, fontSize: 16, marginTop: 8 }}
          onClick={handlePost}
          disabled={loading || !link}
        >
          {loading ? 'Sharing...' : '🚀 Share to Famous World'}
        </button>

        <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
          By posting, you agree to our Terms & Conditions. Make sure you have rights to share this content.
        </p>
      </div>
    </div>
  )
}
