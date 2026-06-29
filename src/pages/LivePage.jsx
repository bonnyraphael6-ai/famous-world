import React, { useState, useEffect, useContext } from 'react'
import { ArrowLeft, Radio, Eye, X, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { formatCount, calcLiveViewers, getVerificationBadge } from '../lib/utils'
import { getBotComment, getRandomBotName } from '../lib/bots'

export default function LivePage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [view, setView] = useState('browse') // browse | live | watching
  const [liveStreams, setLiveStreams] = useState([])
  const [myStream, setMyStream] = useState(null)
  const [viewers, setViewers] = useState(0)
  const [liveChat, setLiveChat] = useState([])
  const [chatMsg, setChatMsg] = useState('')
  const [liveTitle, setLiveTitle] = useState('')

  useEffect(() => {
    loadLiveStreams()
  }, [])

  useEffect(() => {
    if (view === 'live' && myStream) {
      // Simulate viewer growth
      const interval = setInterval(() => {
        setViewers(prev => {
          const base = calcLiveViewers(currentUser?.followers_count || 0)
          const newCount = Math.max(0, prev + Math.floor(Math.random() * 10) - 2)
          return Math.max(newCount, Math.floor(base * 0.5))
        })
        // Add bot comments
        if (Math.random() > 0.6) {
          const isCeleb = Math.random() > 0.8
          const botComment = {
            id: Date.now(),
            name: getRandomBotName(isCeleb),
            text: getBotComment(isCeleb),
            isCeleb
          }
          setLiveChat(prev => [...prev.slice(-50), botComment])
        }
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [view, myStream])

  const loadLiveStreams = async () => {
    const { data } = await supabase
      .from('live_streams')
      .select('*, users(*)')
      .eq('is_active', true)
      .order('viewers_count', { ascending: false })
      .limit(20)
    setLiveStreams(data || [])
  }

  const goLive = async () => {
    const initialViewers = calcLiveViewers(currentUser?.followers_count || 0)
    const { data } = await supabase.from('live_streams').insert({
      user_id: currentUser.id,
      title: liveTitle || 'Live Stream',
      viewers_count: initialViewers,
      is_active: true
    }).select().single()

    setMyStream(data)
    setViewers(initialViewers)
    setView('live')

    // Add welcome bot comments
    setLiveChat([
      { id: 1, name: 'Famous World', text: '🎉 Your stream is live! Welcome everyone!', isCeleb: true },
      { id: 2, name: getRandomBotName(true), text: 'Tuned in! 🔥', isCeleb: true }
    ])
  }

  const endStream = async () => {
    if (myStream) {
      await supabase.from('live_streams').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', myStream.id)
    }
    setView('browse')
    setMyStream(null)
    loadLiveStreams()
  }

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setLiveChat(prev => [...prev, { id: Date.now(), name: currentUser.username, text: chatMsg, isMe: true }])
    setChatMsg('')
  }

  if (view === 'live') {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Live background */}
        <div style={{ flex: 1, background: 'linear-gradient(135deg, #1a0033, #0d001a)', position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <Avatar user={currentUser} size={100} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{currentUser?.full_name || currentUser?.username}</div>
              <div style={{ fontSize: 14, color: 'var(--text-3)' }}>You are LIVE 🔴</div>
            </div>
          </div>

          {/* Top bar */}
          <div style={{ position: 'absolute', top: 20, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="live-badge">LIVE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: 20 }}>
              <Eye size={14} />
              <span style={{ fontWeight: 700 }}>{formatCount(viewers)}</span>
            </div>
            <button onClick={endStream} style={{ background: 'rgba(255,59,92,0.8)', border: 'none', borderRadius: 20, padding: '6px 14px', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
              End
            </button>
          </div>

          {/* Chat overlay */}
          <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, padding: '0 16px', maxHeight: 200, overflowY: 'auto' }}>
            {liveChat.slice(-15).map(msg => (
              <div key={msg.id} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: msg.isCeleb ? '#FFD700' : msg.isMe ? 'var(--primary)' : '#fff', fontSize: 13 }}>
                  {msg.name}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', marginLeft: 6 }}>{msg.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat input */}
        <div style={{ padding: '10px 16px 30px', background: 'rgba(0,0,0,0.95)', display: 'flex', gap: 10 }}>
          <input className="input" style={{ flex: 1 }} placeholder="Say something..." value={chatMsg}
            onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} />
          <button onClick={sendChat} style={{ background: 'var(--primary)', border: 'none', borderRadius: 10, padding: '0 16px', color: 'white', cursor: 'pointer' }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700, fontSize: 17 }}>Live</span>
        <div style={{ width: 24 }} />
      </div>

      {/* Go Live section */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Start your live stream</h3>
        <input className="input" placeholder="Stream title (optional)" value={liveTitle}
          onChange={e => setLiveTitle(e.target.value)} style={{ marginBottom: 12 }} />
        <button className="btn btn-primary btn-block" style={{ height: 48 }} onClick={goLive}>
          <Radio size={18} /> Go Live Now
        </button>
      </div>

      {/* Live now */}
      <div style={{ padding: '16px 16px 8px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>🔴 Live Now</h3>
      </div>

      {liveStreams.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
          <p>No one is live right now</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Be the first to go live!</p>
        </div>
      ) : (
        liveStreams.map(stream => {
          const badge = getVerificationBadge(stream.users)
          return (
            <div key={stream.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer'
            }}>
              <div style={{ position: 'relative' }}>
                <Avatar user={stream.users} size={52} />
                <div className="live-badge" style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', fontSize: 8, padding: '1px 4px' }}>
                  LIVE
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontWeight: 700 }}>{stream.users?.full_name || stream.users?.username}</span>
                  {badge && (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill={badge.color} />
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
                    </svg>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{stream.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Eye size={12} /> {formatCount(stream.viewers_count)} watching
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
