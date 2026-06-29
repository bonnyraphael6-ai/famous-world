import React, { useState, useEffect, useContext } from 'react'
import { ArrowLeft, Users, FileText, Shield, Zap, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import supabase from '../lib/supabase'
import { formatCount } from '../lib/utils'

export default function AdminPage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, posts: 0, coins: 0 })
  const [verRequests, setVerRequests] = useState([])
  const [users, setUsers] = useState([])
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    loadStats()
    loadVerRequests()
    loadUsers()
  }, [])

  const loadStats = async () => {
    const [u, p] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('posts').select('id', { count: 'exact' })
    ])
    setStats({ users: u.count || 0, posts: p.count || 0 })
  }

  const loadVerRequests = async () => {
    const { data } = await supabase.from('verification_requests')
      .select('*, users(*)')
      .eq('status', 'pending')
    setVerRequests(data || [])
  }

  const loadUsers = async () => {
    const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(50)
    setUsers(data || [])
  }

  const approveVerification = async (req, badgeColor = 'blue') => {
    await supabase.from('verification_requests').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', req.id)
    await supabase.from('users').update({ is_verified: true, verification_color: badgeColor }).eq('id', req.user_id)
    loadVerRequests()
    loadUsers()
  }

  const toggleAdmin = async (user) => {
    await supabase.from('users').update({ is_admin: !user.is_admin }).eq('id', user.id)
    loadUsers()
  }

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>Admin Dashboard</span>
        <Shield size={20} color="var(--primary)" />
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['dashboard', 'users', 'verify'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}
            style={{ textTransform: 'capitalize' }}>
            {t === 'verify' ? `Verify (${verRequests.length})` : t}
          </div>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: Users, label: 'Total Users', value: stats.users, color: '#1DA1F2' },
              { icon: FileText, label: 'Total Posts', value: stats.posts, color: 'var(--primary)' },
              { icon: Shield, label: 'Pending Verify', value: verRequests.length, color: '#FFD700' },
              { icon: TrendingUp, label: 'Active Today', value: Math.floor(stats.users * 0.3), color: 'var(--green)' }
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} style={{ background: 'var(--bg-2)', borderRadius: 14, padding: 16, border: '1px solid var(--border)' }}>
                <Icon size={24} color={color} />
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{formatCount(value)}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div>
          {users.map(user => (
            <div key={user.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{user.full_name || user.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{user.username} · {user.country}</div>
                {user.is_verified && <div style={{ fontSize: 11, color: '#1DA1F2' }}>✓ Verified</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleAdmin(user)} style={{
                  fontSize: 11, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
                  background: user.is_admin ? 'var(--primary)' : 'transparent',
                  color: user.is_admin ? 'white' : 'var(--text-3)', cursor: 'pointer'
                }}>
                  {user.is_admin ? 'Admin ✓' : 'Make Admin'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'verify' && (
        <div>
          {verRequests.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>No pending requests</div>
          ) : (
            verRequests.map(req => (
              <div key={req.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{req.users?.full_name || req.users?.username}</div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10 }}>
                  @{req.users?.username} · {req.users?.followers_count || 0} followers · Requested {new Date(req.requested_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['blue', 'gold', 'purple', 'green'].map(color => (
                    <button key={color} onClick={() => approveVerification(req, color)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        background: { blue: '#1DA1F2', gold: '#FFD700', purple: '#9B59B6', green: '#00C851' }[color],
                        color: color === 'gold' ? '#000' : 'white', fontSize: 12, fontWeight: 700
                      }}>
                      {color.charAt(0).toUpperCase() + color.slice(1)} ✓
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
