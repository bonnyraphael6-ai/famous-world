// Format numbers (1000 -> 1K, 1000000 -> 1M)
export function formatCount(num) {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Get platform from URL
export function detectPlatform(url) {
  if (!url) return 'other'
  const lower = url.toLowerCase()
  if (lower.includes('instagram.com')) return 'instagram'
  if (lower.includes('tiktok.com')) return 'tiktok'
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'twitter'
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook'
  return 'other'
}

// Platform colors
export function getPlatformColor(platform) {
  const colors = {
    instagram: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    tiktok: '#010101',
    youtube: '#FF0000',
    twitter: '#1DA1F2',
    facebook: '#1877F2',
    other: '#666'
  }
  return colors[platform] || colors.other
}

// Platform display name
export function getPlatformName(platform) {
  const names = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitter: 'Twitter/X',
    facebook: 'Facebook',
    other: 'Link'
  }
  return names[platform] || 'Link'
}

// Time ago
export function timeAgo(date) {
  if (!date) return ''
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return Math.floor(diff / 60) + 'm'
  if (diff < 86400) return Math.floor(diff / 3600) + 'h'
  if (diff < 604800) return Math.floor(diff / 86400) + 'd'
  if (diff < 2592000) return Math.floor(diff / 604800) + 'w'
  return Math.floor(diff / 2592000) + 'mo'
}

// Get avatar initials
export function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name[0].toUpperCase()
}

// Calculate live viewers based on followers
export function calcLiveViewers(followers) {
  if (followers >= 10000000) return Math.floor(Math.random() * 500000) + 500000
  if (followers >= 1000000) return Math.floor(Math.random() * 150000) + 50000
  if (followers >= 100000) return Math.floor(Math.random() * 10000) + 5000
  if (followers >= 10000) return Math.floor(Math.random() * 1000) + 100
  if (followers >= 1000) return Math.floor(Math.random() * 100) + 10
  return Math.floor(Math.random() * 20) + 1
}

// Simulate engagement growth
export function calcEngagement(followers, type = 'likes') {
  const base = {
    likes: 0.05,
    comments: 0.01,
    shares: 0.005,
    views: 0.15
  }
  const rate = base[type] || 0.05
  const engagement = Math.floor(followers * rate)
  const variance = Math.floor(engagement * 0.3)
  return engagement + Math.floor(Math.random() * variance * 2) - variance
}

// Get verification badge info
export function getVerificationBadge(user) {
  if (!user?.is_verified) return null
  const color = user.verification_color || 'blue'
  const colors = {
    blue: '#1DA1F2',
    gold: '#FFD700',
    purple: '#9B59B6',
    green: '#00C851',
    red: '#FF3B5C',
    pink: '#FF69B4'
  }
  return { color: colors[color] || colors.blue, label: color }
}

// Fetch link metadata (thumbnail + title)
export async function fetchLinkMeta(url) {
  const platform = detectPlatform(url)
  
  // Generate thumbnail based on platform
  const thumbnails = {
    instagram: `https://og.binnelson.com/api/og?url=${encodeURIComponent(url)}`,
    tiktok: null,
    youtube: getYoutubeThumbnail(url),
    twitter: null,
    facebook: null,
    other: null
  }

  return {
    platform,
    thumbnail_url: thumbnails[platform] || '',
    title: `${getPlatformName(platform)} Post`
  }
}

function getYoutubeThumbnail(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  }
  return ''
}

export function generateDeviceFingerprint() {
  const nav = window.navigator
  const screen = window.screen
  return btoa(`${nav.userAgent}${screen.width}${screen.height}${nav.language}`)
}
