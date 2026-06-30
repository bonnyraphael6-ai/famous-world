import React, { useState, useEffect, useContext, useRef } from 'react'
import { ArrowLeft, Radio, Eye, Send, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import Avatar from '../components/Avatar'
import supabase from '../lib/supabase'
import { formatCount, calcLiveViewers, getVerificationBadge } from '../lib/utils'
import { getBotComment, getRandomBotName, getRandomCelebrityBot } from '../lib/bots'

function VerifiedBadge({ user, size = 12 }) {
  const badge = getVerificationBadge(user)
  if (!badge) return null
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={badge.color} />
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white"/>
    </svg>
  )
}

export default function LivePage() {
  const { currentUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [view, setView] = useState('browse')
  const [liveStreams, setLiveStreams] = useState([])
  const [myStream, setMyStream] = useState(null)
  const [viewers, setViewers] = useState(0)
  const [liveChat, setLiveChat] = useState([])
  const [chatMsg, setChatMsg] = useState('')
  const [liveTitle, setLiveTitle] = useState('')
  const chatEndRef = useRef(null)
  const videoRef = useRef(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => { loadLiveStreams() }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [liveChat])

  useEffect(() => {
    if (view === 'live' && myStream) {
      const interval = setInterval(() => {
        setViewers(prev => {
          const base = calcLiveViewers(currentUser?.followers_count || 0)
          return Math.max(Math.floor(base * 0.5), prev + Math.floor(Math.random() * 8) - 2)
        })
        if (Math.random() > 0.5) {
          const isCeleb = Math.random() > 0.75
          const bot = isCeleb ? getRandomCelebrityBot() : null
          setLiveChat(prev => [...prev.slice(-80), {
            id: Date.now(),
            name: bot ? bot.name : getRandomBotName(false),
            text: getBotComment(isCeleb),
            isCeleb,
            isVerified: isCeleb
          }])
        }
      }, 1800)
      return () => clearInterval(interval)
    }
  }, [view, myStream])

  const loadLiveStreams = async () => {
    const { data } = await supabase.from('live_streams').select('*, users(*)').eq('is_active', true).order('viewers_count', { ascending: false }).limit(20)
    setLiveStreams(data || [])
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setCameraStream(stream)
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch (err) {
      setCameraError(true)
    }
  }

  const goLive = async () => {
    await startCamera()
    const initialViewers = calcLiveViewers(currentUser?.followers_count || 0)
    const { data } = await supabase.from('live_streams').insert({
      user_id: currentUser.id,
      title: liveTitle || `${currentUser.username} is LIVE`,
      viewers_count: initialViewers,
      is_active: true
    }).select().single()
    setMyStream(data)
    setViewers(initialViewers)
    setView('live')
    setLiveChat([
      { id: 1, name: 'Famous World 🌍', text: '🎉 Your stream is live! Welcome everyone!', isCeleb: true, isVerified: true },
      { id: 2, name: getRandomBotName(true), text: 'Tuned in! 🔥', isCeleb: true, isVerified: true }
    ])
  }

  const endStream = async () => {
    if (cameraStream) cameraStream.getTracks().forEach(t => t.stop())
    if (myStream) await supabase.from('live_streams').update({ is_active: false, ended_at: new Date().toISOString() }).eq('id', myStream.id)
    setView('browse')
    setMyStream(null)
    setCameraStream(null)
    loadLiveStreams()
  }

  const sendChat = () => {
    if (!chatMsg.trim()) return
    setLiveChat(prev => [...prev, { id: Date.now(), name: currentUser.full_name || currentUser.username, text: chatMsg, isMe: true }])
    setChatMsg('')
  }

  if (view === 'live') {
    return (
      <div style={{ height: '100vh', background: '#000', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Camera / Video area */}
        <div style={{ flex: 1, position: 'relative', background: '#111', overflow: 'hidden' }}>
          {cameraStream && !cameraError ? (
            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: 'linear-gradient(135deg, #1a0033, #0d001a)' }}>
              <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: 'white' }}>
                {(currentUser?.full_name || currentUser?.username || 'U')[0].toUpperCase()}
              </div>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 700 }}>
                {currentUser?.full_name || currentUser?.username}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>You are LIVE 🔴</span>
            </div>
          )}

          {/* Top bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}>
            <div style={{ background: '#FF0000', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 800, color: 'white', letterSpacing: 1 }}>LIVE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '4px 10px' }}>
              <Eye size={13} color="white" />
              <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{formatCount(viewers)}</span>
            </div>
            <button onClick={endStream} style={{ background: '#FF3B5C', border: 'none', borderRadius: 8, padding: '6px 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>End</button>
          </div>

          {/* Chat overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 12px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', maxHeight: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ overflowY: 'auto', maxHeight: 220, marginBottom: 8 }}>
              {liveChat.map(msg => (
                <div key={msg.id} style={{ marginBottom: 5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: msg.isCeleb ? '#FFD700' : msg.isMe ? 'var(--primary)' : 'rgba(255,255,255,0.9)', flexShrink: 0 }}>
                    {msg.name}
                    {msg.isVerified && ' ✅'}:
                  </span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{msg.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={chatMsg}
                onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Say something..."
                style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '8px 14px', color: 'white', fontSize: 13, outline: 'none' }}
              />
              <button onClick={sendChat} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Send size={16} color="white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="header">
        <ArrowLeft size={24} style={{ cursor: 'pointer' }} onClick={() => navigate(-1)} />
        <span style={{ fontWeight: 700 }}>Live</span>
        <div style={{ width: 24 }} />
      </div>

      {/* Go Live section */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 10 }}>Start your broadcast — anyone can go live!</p>
        <input
          className="form-input"
          placeholder="What's your stream about? (optional)"
          value={liveTitle}
          onChange={e => setLiveTitle(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <button className="btn btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={goLive}>
          <Video size={18} /> Go Live Now
        </button>
      </div>

      {/* Active streams */}
      <div style={{ padding: '12px 16px' }}>
        <p style={{ fontWeight: 700, marginBottom: 12 }}>Live Now</p>
        {liveStreams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
            <p style={{ fontSize: 36, marginBottom: 8 }}>📡</p>
            <p>No one is live right now</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Be the first to go live!</p>
          </div>
        ) : liveStreams.map(stream => (
          <div key={stream.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: 12, background: 'var(--surface-2)', borderRadius: 12 }}>
            <div style={{ position: 'relative' }}>
              <Avatar user={stream.users} size={50} />
              <div style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', background: '#FF0000', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800, color: 'white' }}>LIVE</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{stream.users?.full_name || stream.users?.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{stream.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Eye size={11} /> {formatCount(stream.viewers_count)} watching
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
