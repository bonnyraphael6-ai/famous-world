import supabase from './supabase'

// Simple hash function (in production use bcrypt on server side)
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'famousworld_salt_2024')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function registerUser({ username, email, phone, password, fullName, country }) {
  try {
    // Check if username taken
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username.toLowerCase())
      .single()

    if (existingUser) {
      return { error: 'Username is already taken. Please choose another.' }
    }

    // Check email if provided
    if (email) {
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()
      if (existingEmail) return { error: 'Email already registered.' }
    }

    const passwordHash = await hashPassword(password)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username: username.toLowerCase(),
        email: email ? email.toLowerCase() : null,
        phone: phone || null,
        full_name: fullName,
        password_hash: passwordHash,
        country: country || '',
        famous_coins: 50,
        followers_count: 0,
        following_count: 0,
        total_likes: 0,
        total_posts: 0
      })
      .select()
      .single()

    if (error) return { error: error.message }

    // Store session
    localStorage.setItem('fw_user', JSON.stringify(user))
    localStorage.setItem('fw_user_id', user.id)

    return { user }
  } catch (err) {
    return { error: err.message }
  }
}

export async function loginUser({ identifier, password }) {
  try {
    const passwordHash = await hashPassword(password)
    
    // Try login with username, email, or phone
    let query = supabase.from('users').select('*')
    
    if (identifier.includes('@')) {
      query = query.eq('email', identifier.toLowerCase())
    } else if (identifier.startsWith('+') || /^\d+$/.test(identifier)) {
      query = query.eq('phone', identifier)
    } else {
      query = query.eq('username', identifier.toLowerCase())
    }

    const { data: user, error } = await query.eq('password_hash', passwordHash).single()

    if (error || !user) {
      return { error: 'Invalid username or password.' }
    }

    // Update last active
    await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', user.id)

    localStorage.setItem('fw_user', JSON.stringify(user))
    localStorage.setItem('fw_user_id', user.id)

    return { user }
  } catch (err) {
    return { error: err.message }
  }
}

export function getCurrentUser() {
  try {
    const stored = localStorage.getItem('fw_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('fw_user')
  localStorage.removeItem('fw_user_id')
}

export async function refreshCurrentUser() {
  const userId = localStorage.getItem('fw_user_id')
  if (!userId) return null

  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
  if (user) {
    localStorage.setItem('fw_user', JSON.stringify(user))
    return user
  }
  return null
}
