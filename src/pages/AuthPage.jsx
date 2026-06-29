import React, { useState, useContext } from 'react'
import { UserContext } from '../App'
import { registerUser, loginUser } from '../lib/auth'

const COUNTRIES = [
  'Nigeria', 'United States', 'United Kingdom', 'Ghana', 'South Africa', 'Kenya', 
  'India', 'Brazil', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain',
  'Mexico', 'Argentina', 'Indonesia', 'Pakistan', 'Bangladesh', 'Russia', 'Japan',
  'China', 'South Korea', 'Philippines', 'Vietnam', 'Thailand', 'Malaysia', 'Egypt',
  'Ethiopia', 'Tanzania', 'Uganda', 'Rwanda', 'Cameroon', 'Senegal', 'Ivory Coast',
  'Other'
]

export default function AuthPage() {
  const { setCurrentUser } = useContext(UserContext)
  const [mode, setMode] = useState('login') // login | register
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)

  // Register form
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', phone: '', password: '',
    confirmPassword: '', country: '', identifierType: 'email'
  })

  // Login form
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' })

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleRegister = async () => {
    setError('')
    if (!form.username || form.username.length < 3) {
      return setError('Username must be at least 3 characters')
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(form.username)) {
      return setError('Username can only contain letters, numbers, _ and .')
    }
    if (!form.password || form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match')
    }
    if (!form.country) {
      return setError('Please select your country')
    }

    setLoading(true)
    const { user, error } = await registerUser({
      username: form.username,
      email: form.email || null,
      phone: form.phone || null,
      password: form.password,
      fullName: form.fullName || form.username,
      country: form.country
    })
    setLoading(false)

    if (error) return setError(error)
    setCurrentUser(user)
  }

  const handleLogin = async () => {
    setError('')
    if (!loginForm.identifier || !loginForm.password) {
      return setError('Please fill in all fields')
    }
    setLoading(true)
    const { user, error } = await loginUser(loginForm)
    setLoading(false)
    if (error) return setError(error)
    setCurrentUser(user)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '60px 24px 32px', textAlign: 'center' }}>
        <div style={{ 
          fontSize: 42, fontWeight: 900,
          background: 'linear-gradient(135deg, #E040FB, #FF6B9D, #FFD700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: 8
        }}>
          Famous World
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: 15 }}>
          {mode === 'login' ? 'Welcome back! Sign in to continue' : 'Join the world of fame ✨'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', margin: '0 24px', background: 'var(--bg-2)', borderRadius: 12, padding: 4 }}>
        {['login', 'register'].map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); setStep(1) }}
            style={{
              flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 10,
              background: mode === m ? 'var(--primary)' : 'transparent',
              color: mode === m ? 'white' : 'var(--text-3)',
              fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
            }}>
            {m === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        ))}
      </div>

      {/* Form */}
      <div style={{ padding: '24px', flex: 1 }}>
        {error && (
          <div style={{ 
            background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            color: 'var(--red)', fontSize: 14
          }}>
            {error}
          </div>
        )}

        {mode === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>
                Username, Email or Phone
              </label>
              <input 
                className="input"
                placeholder="Enter username, email or phone"
                value={loginForm.identifier}
                onChange={e => setLoginForm(prev => ({ ...prev, identifier: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>
                Password
              </label>
              <input 
                className="input" type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 8, height: 52, fontSize: 16 }} onClick={handleLogin} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step === 1 ? (
              <>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Full Name</label>
                  <input className="input" placeholder="Your full name or stage name" value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Username *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: 700 }}>@</span>
                    <input 
                      className="input" placeholder="yourname" 
                      style={{ paddingLeft: 30 }}
                      value={form.username} 
                      onChange={e => updateForm('username', e.target.value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase())}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Letters, numbers, _ and . only. Cannot be changed later.</p>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Country *</label>
                  <select className="input" value={form.country} onChange={e => updateForm('country', e.target.value)}
                    style={{ cursor: 'pointer' }}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary btn-block" style={{ marginTop: 8, height: 52, fontSize: 16 }}
                  onClick={() => {
                    if (!form.username) return setError('Username is required')
                    if (!form.country) return setError('Country is required')
                    setError(''); setStep(2)
                  }}>
                  Continue
                </button>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Email (optional)</label>
                  <input className="input" type="email" placeholder="your@email.com" value={form.email} onChange={e => updateForm('email', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Phone (optional)</label>
                  <input className="input" type="tel" placeholder="+1234567890" value={form.phone} onChange={e => updateForm('phone', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Password *</label>
                  <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => updateForm('password', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 6, display: 'block', fontWeight: 600 }}>Confirm Password *</label>
                  <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>
                  By signing up you agree to our <span style={{ color: 'var(--primary)' }}>Terms of Service</span> and <span style={{ color: 'var(--primary)' }}>Privacy Policy</span>.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline" style={{ flex: 1, height: 52 }} onClick={() => setStep(1)}>Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, height: 52, fontSize: 16 }} onClick={handleRegister} disabled={loading}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
