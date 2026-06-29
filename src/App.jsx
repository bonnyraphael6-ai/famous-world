import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser } from './lib/auth'

// Pages
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import CreatePostPage from './pages/CreatePostPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import LivePage from './pages/LivePage'
import AdminPage from './pages/AdminPage'
import UserProfilePage from './pages/UserProfilePage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/BottomNav'

export const UserContext = React.createContext(null)

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }

    const user = getCurrentUser()
    setCurrentUser(user)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000' }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #E040FB, #FF6B9D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', marginBottom: 16 }}>
            Famous World
          </div>
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <BrowserRouter>
        <div id="app">
          <Routes>
            <Route path="/auth" element={!currentUser ? <AuthPage /> : <Navigate to="/" />} />
            <Route path="/" element={currentUser ? <HomePage /> : <Navigate to="/auth" />} />
            <Route path="/search" element={currentUser ? <SearchPage /> : <Navigate to="/auth" />} />
            <Route path="/create" element={currentUser ? <CreatePostPage /> : <Navigate to="/auth" />} />
            <Route path="/notifications" element={currentUser ? <NotificationsPage /> : <Navigate to="/auth" />} />
            <Route path="/profile" element={currentUser ? <ProfilePage /> : <Navigate to="/auth" />} />
            <Route path="/profile/:username" element={currentUser ? <UserProfilePage /> : <Navigate to="/auth" />} />
            <Route path="/messages" element={currentUser ? <MessagesPage /> : <Navigate to="/auth" />} />
            <Route path="/live" element={currentUser ? <LivePage /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={currentUser ? <SettingsPage /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={currentUser?.is_admin ? <AdminPage /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          {currentUser && <BottomNav />}
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  )
}

export default App
