export function formatCount(num) {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

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

export function getPlatformIcon(platform) {
  const icons = {
    instagram: '📸',
    tiktok: '🎵',
    youtube: '▶️',
    twitter: '🐦',
    facebook: '👍',
    other: '🔗'
  }
  return icons[platform] || '🔗'
}

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

export function getInitials(name) {
  if (!name) return 'U'
  const parts = name.split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name[0].toUpperCase()
}

export function calcLiveViewers(followers) {
  if (followers >= 10000000) return Math.floor(Math.random() * 500000) + 500000
  if (followers >= 1000000) return Math.floor(Math.random() * 150000) + 50000
  if (followers >= 100000) return Math.floor(Math.random() * 10000) + 5000
  if (followers >= 10000) return Math.floor(Math.random() * 1000) + 100
  if (followers >= 1000) return Math.floor(Math.random() * 100) + 10
  return Math.floor(Math.random() * 20) + 1
}

export function calcEngagement(followers, type = 'likes') {
  const base = { likes: 0.05, comments: 0.01, shares: 0.005, views: 0.15 }
  const rate = base[type] || 0.05
  const engagement = Math.floor(followers * rate)
  const variance = Math.floor(engagement * 0.3)
  return engagement + Math.floor(Math.random() * variance * 2) - variance
}

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

// Fetch real thumbnails using open graph / proxy services
export async function fetchLinkMeta(url) {
  const platform = detectPlatform(url)

  let thumbnail_url = ''

  if (platform === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (match) thumbnail_url = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  } else {
    // Use a CORS-friendly OG image proxy for all platforms
    thumbnail_url = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
  }

  return {
    platform,
    thumbnail_url,
    title: `${getPlatformName(platform)} Post`
  }
}

export function generateDeviceFingerprint() {
  const nav = window.navigator
  const screen = window.screen
  return btoa(`${nav.userAgent}${screen.width}${screen.height}${nav.language}`)
}
