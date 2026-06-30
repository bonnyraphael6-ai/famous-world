import React, { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Send, Search, Edit } from 'lucide-react'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { timeAgo, getVerificationBadge } from '../lib/utils'

function VerifiedBadge({ user, size = 13 }) {
  const badge = getVerificationBadge(user)
  if (!badge) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={badge.color} />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
    </svg>
  )
}

export default function MessagesPage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [view, setView] = useState('inbox') // inbox | chat
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadConversations()
    // Handle deep link from profile/settings
    if (location.state?.toUser) {
      openConvByUsername(location.state.toUser, location.state?.message)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*), receiver:users!messages_receiver_id_fkey(*)')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false })

    if (!data) return
    // Group by conversation partner
    const convMap = {}
    data.forEach(msg => {
      const partner = msg.sender_id === currentUser.id ? msg.receiver : msg.sender
      if (!partner) return
      if (!convMap[partner.id]) {
        convMap[partner.id] = { partner, lastMsg: msg, unread: 0 }
      }
      if (!msg.is_read && msg.receiver_id === currentUser.id) convMap[partner.id].unread++
    })
    setConversations(Object.values(convMap))
  }

  const openConvByUsername = async (username, prefillMsg) => {
    const { data: user } = await supabase.from('users').select('*').eq('username', username).single()
    if (user) {
      openConversation(user)
      if (prefillMsg) setText(prefillMsg)
    }
  }

  const openConversation = async (partner) => {
    setActiveConv(partner)
    setView('chat')
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${partner.id}),and(sender_id.eq.${partner.id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    // Mark as read
    await supabase.from('messages').update({ is_read: true })
      .eq('receiver_id', currentUser.id).eq('sender_id', partner.id)
  }

  const sendMessage = async () => {
    if (!text.trim() || !activeConv) return
    const newMsg = {
      sender_id: currentUser.id,
      receiver_id: activeConv.id,
      content: text.trim(),
      is_read: false
    }
    const { data } = await supabase.from('messages').insert(newMsg).select().single()
    if (data) {
      setMessages(prev => [...prev, data])
      setText('')
      loadConversations()
    }
  }

  const searchUsers = async (q) => {
    setSearchQuery(q)
    if (!q.trim()) { setSearchResults([]); return }
    setSearching(true)
    const { data } = await supabase.from('users').select('*')
      .ilike('username', `%${q}%`).limit(10)
    setSearchResults(data || [])
    setSearching(false)
  }

  // INBOX VIEW
  if (view === 'inbox') {
    return (
      <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontWeight: 800, fontSize: 20 }}>{currentUser?.username}</span>
            <Edit size={22} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('new')} />
          </div>
          {/* Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 12, padding: '10px 14px', marginBottom: 14 }}>
            <Search size={16} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => searchUsers(e.target.value)}
              placeholder="Search"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--text-1)' }}
            />
          </div>
        </div>

        {/* Search results */}
        {searchQuery.trim() ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {searchResults.map(user => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                onClick={() => { setSearchQuery(''); openConversation(user) }}>
                <Avatar user={user} size={48} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{user.full_name || user.username}</span>
                    <VerifiedBadge user={user} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>@{user.username}</span>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && !searching && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>No users found</div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>💬</p>
                <p style={{ fontWeight: 700, fontSize: 16 }}>Your Messages</p>
                <p style={{ fontSize: 13, marginTop: 6 }}>Send a message to start a conversation</p>
              </div>
            ) : conversations.map(({ partner, lastMsg, unread }) => (
              <div key={partner.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: unread > 0 ? 'rgba(224,64,251,0.04)' : 'transparent' }}
                onClick={() => openConversation(partner)}>
                <div style={{ position: 'relative' }}>
                  <Avatar user={partner} size={54} />
                  {unread > 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>{unread}</div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: unread > 0 ? 800 : 600, fontSize: 14 }}>{partner.full_name || partner.username}</span>
                      <VerifiedBadge user={partner} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{timeAgo(lastMsg.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unread > 0 ? 600 : 400 }}>
                    {lastMsg.sender_id === currentUser.id ? 'You: ' : ''}{lastMsg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // CHAT VIEW - Instagram style
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Chat header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)' }}>
        <ArrowLeft size={24} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => { setView('inbox'); setActiveConv(null); loadConversations() }} />
        <Avatar user={activeConv} size={38} onClick={() => navigate(`/profile/${activeConv?.username}`)} />
        <div style={{ flex: 1, minWidth: 0 }} onClick={() => navigate(`/profile/${activeConv?.username}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{activeConv?.full_name || activeConv?.username}</span>
            <VerifiedBadge user={activeConv} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>@{activeConv?.username}</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
            <Avatar user={activeConv} size={64} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, marginBottom: 4 }}>{activeConv?.full_name || activeConv?.username}</p>
            <p style={{ fontSize: 13 }}>@{activeConv?.username}</p>
            <p style={{ fontSize: 13, marginTop: 12 }}>Start a conversation</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUser.id
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              {!isMe && <Avatar user={activeConv} size={28} style={{ marginRight: 8, alignSelf: 'flex-end', flexShrink: 0 }} />}
              <div style={{
                maxWidth: '72%',
                padding: '10px 14px',
                borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: isMe ? 'var(--primary)' : 'var(--surface-2)',
                color: isMe ? 'white' : 'var(--text-1)',
                fontSize: 14, lineHeight: 1.4
              }}>
                {msg.content}
                <div style={{ fontSize: 10, marginTop: 4, opacity: 0.65, textAlign: 'right' }}>
                  {timeAgo(msg.created_at)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-1)' }}>
        <Avatar user={currentUser} size={32} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 24, padding: '8px 16px', border: '1px solid var(--border)' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Message..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-1)' }}
          />
        </div>
        <button onClick={sendMessage} disabled={!text.trim()} style={{
          background: text.trim() ? 'var(--primary)' : 'transparent',
          border: 'none', borderRadius: '50%', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
        }}>
          <Send size={16} color={text.trim() ? 'white' : 'var(--text-3)'} />
        </button>
      </div>
    </div>
  )
}
