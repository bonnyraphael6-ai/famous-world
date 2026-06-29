import React, { useState, useContext } from 'react'
import { ArrowLeft, Shield, HelpCircle, FileText, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { refreshCurrentUser } from '../lib/auth'

export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    full_name: currentUser?.full_name || '',
    bio: currentUser?.bio || '',
    avatar_url: currentUser?.avatar_url || ''
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [section, setSection] = useState('main')

  const saveProfile = async () => {
    setSaving(true)
    const { error } = await supabase.from('users').update({
      full_name: form.full_name,
      bio: form.bio,
      avatar_url: form.avatar_url
    }).eq('id', currentUser.id)

    if (!error) {
      const refreshed = await refreshCurrentUser()
      if (refreshed) setCurrentUser(refreshed)
      setMessage('Profile updated!')
      setEditing(false)
    }
    setSaving(false)
    setTimeout(() => setMessage(''), 3000)
  }

  const requestVerification = async () => {
    const { error } = await supabase.from('verification_requests').insert({
      user_id: currentUser.id,
      status: 'pending',
      badge_color: 'blue'
    })
    if (!error) setMessage('Verification request submitted! We will review it soon.')
    setTimeout(() => setMessage(''), 4000)
  }

  if (section === 'terms') {
    return (
      <div className="page">
        <div className="header">
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => setSection('main')} />
          <span style={{ fontWeight: 700 }}>Terms & Conditions</span>
          <div />
        </div>
        <div style={{ padding: 20, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
          <h2 style={{ marginBottom: 16 }}>Famous World Terms of Service</h2>
          <p><strong>1. Acceptance:</strong> By using Famous World, you agree to these terms.</p>
          <p style={{ marginTop: 12 }}><strong>2. Content:</strong> You are responsible for all content you post. Only share content you have rights to.</p>
          <p style={{ marginTop: 12 }}><strong>3. Prohibited:</strong> No spam, hate speech, adult content, or illegal activities.</p>
          <p style={{ marginTop: 12 }}><strong>4. Famous Coins:</strong> Coins are earned through engagement and are non-transferable.</p>
          <p style={{ marginTop: 12 }}><strong>5. Multiple Accounts:</strong> One account per person. Multiple accounts may be suspended.</p>
          <p style={{ marginTop: 12 }}><strong>6. Verification:</strong> Verification is at Famous World's discretion and can be revoked.</p>
          <p style={{ marginTop: 12 }}><strong>7. Termination:</strong> We reserve the right to suspend accounts that violate these terms.</p>
          <p style={{ marginTop: 20, color: 'var(--text-3)' }}>Last updated: January 2025</p>
        </div>
      </div>
    )
  }

  if (section === 'privacy') {
    return (
      <div className="page">
        <div className="header">
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => setSection('main')} />
          <span style={{ fontWeight: 700 }}>Privacy Policy</span>
          <div />
        </div>
        <div style={{ padding: 20, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.8 }}>
          <h2 style={{ marginBottom: 16 }}>Privacy Policy</h2>
          <p><strong>Data We Collect:</strong> Username, email/phone, country, and content you post.</p>
          <p style={{ marginTop: 12 }}><strong>How We Use It:</strong> To provide and improve Famous World services.</p>
          <p style={{ marginTop: 12 }}><strong>Data Security:</strong> Your data is stored securely and never sold to third parties.</p>
          <p style={{ marginTop: 12 }}><strong>Your Rights:</strong> You can delete your account at any time.</p>
          <p style={{ marginTop: 20, color: 'var(--text-3)' }}>Last updated: January 2025</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>Settings</span>
        <div />
      </div>

      {message && (
        <div style={{ 
          margin: 16, padding: 12, background: 'rgba(0,200,81,0.1)', 
          border: '1px solid rgba(0,200,81,0.3)', borderRadius: 10, 
          color: 'var(--green)', fontSize: 14 
        }}>
          {message}
        </div>
      )}

      {/* Profile Section */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <Avatar user={currentUser} size={64} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{currentUser?.full_name || currentUser?.username}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)' }}>@{currentUser?.username}</div>
          </div>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Display Name</label>
              <input className="input" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Bio</label>
              <textarea className="input" style={{ height: 80, resize: 'none' }} value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} maxLength={150} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Avatar URL</label>
              <input className="input" placeholder="https://..." value={form.avatar_url}
                onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline btn-block" onClick={() => setEditing(true)}>Edit Profile</button>
        )}
      </div>

      {/* Options */}
      <div>
        {[
          { icon: Shield, label: 'Request Verification Badge', action: requestVerification },
          { icon: HelpCircle, label: 'Help & Support', action: () => navigate('/profile/famousworldsupport') },
          { icon: FileText, label: 'Terms & Conditions', action: () => setSection('terms') },
          { icon: FileText, label: 'Privacy Policy', action: () => setSection('privacy') },
        ].map(({ icon: Icon, label, action }) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px', borderBottom: '1px solid var(--border)',
            cursor: 'pointer'
          }} onClick={action}>
            <Icon size={20} color="var(--text-3)" />
            <span style={{ flex: 1, fontSize: 15 }}>{label}</span>
            <ChevronRight size={16} color="var(--text-3)" />
          </div>
        ))}
      </div>

      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
        Famous World v1.0 • Made with ❤️
      </div>
    </div>
  )
}
