import React, { useState, useEffect, useContext, useRef } from 'react'
import { ArrowLeft, Send, Phone, Video, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { timeAgo } from '../lib/utils'

export default function MessagesPage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeConv) loadMessages(activeConv)
  }, [activeConv])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(*), receiver:receiver_id(*)')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })

    // Get unique conversations
    const convMap = {}
    data?.forEach(msg => {
      const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id
      const otherUser = msg.sender_id === currentUser.id ? msg.receiver : msg.sender
      if (!convMap[otherId]) {
        convMap[otherId] = { user: otherUser, lastMsg: msg }
      }
    })
    setConversations(Object.values(convMap))
    setLoading(false)
  }

  const loadMessages = async (otherUser) => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:sender_id(*)')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])

    // Mark as read
    await supabase.from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherUser.id)
      .eq('receiver_id', currentUser.id)
  }

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return
    const msg = {
      sender_id: currentUser.id,
      receiver_id: activeConv.id,
      content: newMsg.trim(),
      message_type: 'text'
    }
    setMessages(prev => [...prev, { ...msg, id: Date.now(), sender: currentUser, created_at: new Date().toISOString() }])
    setNewMsg('')
    await supabase.from('messages').insert(msg)
  }

  if (activeConv) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <div className="header">
          <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => setActiveConv(null)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, marginLeft: 8 }}>
            <Avatar user={activeConv} size={36} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{activeConv.full_name || activeConv.username}</div>
              <div style={{ fontSize: 11, color: 'var(--green)' }}>● Active</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Phone size={22} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => alert('Voice call feature coming soon!')} />
            <Video size={22} style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => alert('Video call feature coming soon!')} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.map((msg, i) => {
            const isMine = msg.sender_id === currentUser.id
            return (
              <div key={msg.id || i} style={{
                display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                marginBottom: 12
              }}>
                {!isMine && <Avatar user={msg.sender} size={28} showBadge={false} />}
                <div style={{
                  maxWidth: '70%', marginLeft: isMine ? 0 : 8, marginRight: isMine ? 0 : 0,
                  padding: '10px 14px', borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMine ? 'linear-gradient(135deg, #E040FB, #9C27B0)' : 'var(--bg-3)',
                  fontSize: 14, lineHeight: 1.4
                }}>
                  {msg.content}
                  <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>
                    {timeAgo(msg.created_at)}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ 
          padding: '12px 16px 30px', borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.95)', display: 'flex', gap: 10
        }}>
          <input
            className="input" style={{ flex: 1 }}
            placeholder="Message..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} style={{
            background: 'linear-gradient(135deg, #E040FB, #9C27B0)',
            border: 'none', borderRadius: 10, padding: '0 16px', cursor: 'pointer', color: 'white'
          }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="header">
        <span className="logo" style={{ fontSize: 20 }}>Messages</span>
        <Search size={22} style={{ cursor: 'pointer' }} />
      </div>

      {loading ? (
        <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
          <div className="spinner"></div>
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>💬</p>
          <p style={{ fontSize: 16 }}>No messages yet</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Find someone and start chatting!</p>
        </div>
      ) : (
        conversations.map(({ user, lastMsg }) => (
          <div key={user?.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer'
          }} onClick={() => setActiveConv(user)}>
            <Avatar user={user} size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.full_name || user?.username}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {lastMsg.content}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(lastMsg.created_at)}</div>
          </div>
        ))
      )}
    </div>
  )
}
