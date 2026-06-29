import React, { useState, useEffect, useContext } from 'react'
import { Heart, UserPlus, MessageCircle, Zap } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { timeAgo } from '../lib/utils'

const notifIcon = {
  like: <Heart size={16} fill="var(--red)" color="var(--red)" />,
  follow: <UserPlus size={16} color="#1DA1F2" />,
  comment: <MessageCircle size={16} color="var(--primary)" />,
  coin: <Zap size={16} color="#FFD700" />
}

export default function NotificationsPage() {
  const { currentUser } = useContext(UserContext)
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifs()
  }, [])

  const loadNotifs = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*, from_user:from_user_id(*)')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifs(data || [])
    setLoading(false)

    // Mark all as read
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', currentUser.id)
  }

  // Generate some fake engagement notifs if empty
  const displayNotifs = notifs.length > 0 ? notifs : [
    { id: '1', type: 'follow', content: 'Famous World just followed you 👋', created_at: new Date().toISOString(), from_user: { full_name: 'Famous World', username: 'famousworld', is_verified: true, verification_color: 'gold' } },
    { id: '2', type: 'coin', content: 'You earned 5 Famous Coins from your post!', created_at: new Date(Date.now() - 3600000).toISOString() },
  ]

  return (
    <div className="page">
      <div className="header">
        <span className="logo" style={{ fontSize: 20 }}>Notifications</span>
      </div>

      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <div>
          {displayNotifs.map(notif => (
            <div key={notif.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              background: !notif.is_read ? 'rgba(224,64,251,0.04)' : 'transparent'
            }}>
              {notif.from_user ? (
                <Avatar user={notif.from_user} size={44} />
              ) : (
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA000)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {notifIcon[notif.type] || <Zap size={18} color="white" />}
                </div>
              )}
              <div style={{ flex: 1 }}>
                {notif.from_user && (
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{notif.from_user.full_name || notif.from_user.username} </span>
                )}
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>
                  {notif.content || (
                    notif.type === 'like' ? 'liked your post' :
                    notif.type === 'follow' ? 'started following you' :
                    notif.type === 'comment' ? 'commented on your post' : 'sent you a notification'
                  )}
                </span>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{timeAgo(notif.created_at)}</div>
              </div>
              <div style={{ 
                width: 8, height: 8, borderRadius: '50%',
                background: !notif.is_read ? 'var(--primary)' : 'transparent'
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
