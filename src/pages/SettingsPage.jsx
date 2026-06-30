import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Upload } from 'lucide-react'
import { UserContext } from '../App'
import supabase from '../lib/supabase'

const CATEGORIES = [
  'Public Figure', 'Actor / Actress', 'Musician / Artist', 'Comedian',
  'Athlete / Sports', 'Influencer', 'Content Creator', 'Entrepreneur',
  'Model', 'Politician', 'Journalist', 'Activist', 'Gamer', 'Chef / Food',
  'Fashion Designer', 'Photographer', 'Filmmaker', 'Author / Writer', 'Other'
]

export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: currentUser?.full_name || '',
    bio: currentUser?.bio || '',
    avatar_url: currentUser?.avatar_url || '',
    category: currentUser?.category || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { data } = await supabase.from('users').update(form).eq('id', currentUser.id).select().single()
    if (data) {
      setCurrentUser(data)
      localStorage.setItem('fw_user', JSON.stringify(data))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `avatars/${currentUser.id}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        setForm(f => ({ ...f, avatar_url: publicUrl }))
        await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', currentUser.id)
        setCurrentUser(u => ({ ...u, avatar_url: publicUrl }))
      }
    } catch (err) {
      // Fallback if storage not set up
      console.error('Avatar upload error:', err)
    }
    setUploadingAvatar(false)
  }

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700, fontSize: 17 }}>Settings</span>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ padding: 16 }}>
        {/* Avatar upload */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{
              width: 90, height: 90, borderRadius: '50%',
              background: form.avatar_url ? 'transparent' : 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 700, color: 'white',
              overflow: 'hidden', border: '3px solid var(--primary)'
            }}>
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (currentUser?.full_name || currentUser?.username || 'U')[0].toUpperCase()}
            </div>
            <label style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--primary)', borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              {uploadingAvatar ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Camera size={14} color="white" />}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </label>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Tap camera to change photo</p>
        </div>

        {/* Or paste URL */}
        <div className="form-group">
          <label className="form-label">Or paste image URL</label>
          <input className="form-input" placeholder="https://..." value={form.avatar_url}
            onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Full Name / Stage Name</label>
          <input className="form-input" placeholder="Your name" value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            <option value="">Select your category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" rows={3} placeholder="Tell the world about yourself..."
            value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            style={{ resize: 'vertical' }} />
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: 16 }} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { label: '🛡️ Request Verification Badge', action: () => navigate('/messages', { state: { toUser: 'famousworldsupport', message: 'Hi, I would like to request a verification badge for my account.' } }) },
            { label: '❓ Help & Support', action: () => navigate('/messages', { state: { toUser: 'famousworldsupport' } }) },
            { label: '📄 Terms & Conditions', action: () => navigate('/terms') },
            { label: '🔒 Privacy Policy', action: () => navigate('/privacy') },
          ].map(item => (
            <button key={item.label} onClick={item.action} style={{
              background: 'none', border: 'none', padding: '14px 0', textAlign: 'left',
              fontSize: 14, color: 'var(--text-2)', cursor: 'pointer', borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              {item.label}
              <span style={{ color: 'var(--text-3)' }}>›</span>
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)', marginTop: 24 }}>
          Famous World v1.0 • Made with ❤️
        </p>
      </div>
    </div>
  )
}
