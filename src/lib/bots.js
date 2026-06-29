import supabase from './supabase'

// Celebrity bots that engage with posts
const CELEBRITY_BOTS = [
  { name: 'Drake', username: 'drake_fw', avatar: '' },
  { name: 'Beyoncé', username: 'beyonce_fw', avatar: '' },
  { name: 'Taylor Swift', username: 'taylorswift_fw', avatar: '' },
  { name: 'Cristiano Ronaldo', username: 'cristiano_fw', avatar: '' },
  { name: 'Selena Gomez', username: 'selenagomez_fw', avatar: '' },
  { name: 'Ariana Grande', username: 'arianagrande_fw', avatar: '' },
  { name: 'Rihanna', username: 'rihanna_fw', avatar: '' },
  { name: 'Cardi B', username: 'cardib_fw', avatar: '' },
  { name: 'The Rock', username: 'therock_fw', avatar: '' },
  { name: 'Nicki Minaj', username: 'nickiminaj_fw', avatar: '' }
]

const REGULAR_BOT_NAMES = [
  'starlight_fan', 'world_viewer', 'famous_lover', 'global_star', 'rising_fame',
  'daily_viewer', 'social_king', 'fame_seeker', 'world_star', 'mega_fan',
  'bright_future', 'shine_on', 'fame_wave', 'star_gazer', 'crowd_cheer'
]

const BOT_COMMENTS = {
  general: [
    '🔥 This is amazing!', 'Love this so much! 💕', 'Keep going! 💪',
    'Wow absolutely incredible 🤩', 'This made my day! 😊', 'Legendary! 👑',
    'You are so talented!', 'Real one! ✅', 'This hits different 🎯',
    'Pure talent right here 🎨', 'Mind blown 🤯', 'Absolutely stunning 😮',
    'This is everything! ❤️‍🔥', 'Keep posting more! 🙏', 'You deserve way more followers',
    'Shared to all my friends!', 'Following for more! 🔔'
  ],
  celebrity: [
    '🔥 This is fire!', 'Love the energy you bring 💕', 'Keep pushing! 💪',
    'The whole world needs to see this 🌍', 'Real talent! ✅',
    'You remind me of myself when I started 👑', 'Big things coming for you! 🚀'
  ]
}

// Simulate bot engagement on a post
export async function simulateBotEngagement(postId, userId, userFollowers = 0) {
  try {
    // Calculate engagement based on followers
    const likeCount = userFollowers === 0 
      ? Math.floor(Math.random() * 50) + 10
      : Math.floor(userFollowers * 0.03) + Math.floor(Math.random() * 50)

    const commentCount = Math.floor(likeCount * 0.2)
    const viewCount = likeCount * 3

    // Add bot likes
    for (let i = 0; i < Math.min(likeCount, 20); i++) {
      const botName = REGULAR_BOT_NAMES[Math.floor(Math.random() * REGULAR_BOT_NAMES.length)]
      // We don't insert individual bot likes to db (too many rows), just update count
    }

    // Update post stats
    await supabase.from('posts').update({
      likes_count: likeCount,
      views_count: viewCount,
      comments_count: commentCount
    }).eq('id', postId)

    // Update user total likes
    await supabase.rpc ? null : await supabase.from('users')
      .select('total_likes')
      .eq('id', userId)
      .single()
      .then(async ({ data }) => {
        if (data) {
          await supabase.from('users').update({ 
            total_likes: (data.total_likes || 0) + likeCount 
          }).eq('id', userId)
        }
      })

    // Add a few bot comments
    const commentComments = []
    const numComments = Math.min(commentCount, 5)
    
    for (let i = 0; i < numComments; i++) {
      const isCeleb = Math.random() > 0.7
      const commenterPool = isCeleb ? CELEBRITY_BOTS : REGULAR_BOT_NAMES
      const commenter = isCeleb 
        ? commenterPool[Math.floor(Math.random() * commenterPool.length)]
        : { name: commenterPool[Math.floor(Math.random() * commenterPool.length)], username: '' }
      
      const commentPool = isCeleb ? BOT_COMMENTS.celebrity : BOT_COMMENTS.general
      const comment = commentPool[Math.floor(Math.random() * commentPool.length)]
      
      commentComments.push({
        user_id: userId, // Using current user as placeholder
        post_id: postId,
        content: comment,
        likes_count: Math.floor(Math.random() * 50)
      })
    }

    if (commentComments.length > 0) {
      await supabase.from('comments').insert(commentComments)
    }

    // Award coins to user (1 coin per 10 likes)
    const coinsEarned = Math.floor(likeCount / 10)
    if (coinsEarned > 0) {
      const { data: user } = await supabase.from('users').select('famous_coins, total_likes').eq('id', userId).single()
      if (user) {
        await supabase.from('users').update({
          famous_coins: (user.famous_coins || 0) + coinsEarned,
          total_likes: (user.total_likes || 0) + likeCount
        }).eq('id', userId)

        await supabase.from('coin_transactions').insert({
          user_id: userId,
          amount: coinsEarned,
          type: 'earned',
          description: `Earned from post engagement`,
          post_id: postId
        })
      }
    }

    // Simulate follower growth (slow and realistic)
    if (Math.random() > 0.5) {
      const newFollowers = Math.floor(Math.random() * 5) + 1
      await supabase.from('users').update({
        followers_count: Math.max(0, userFollowers) + newFollowers
      }).eq('id', userId)
    }

    return { success: true, likeCount, commentCount, viewCount }
  } catch (err) {
    console.error('Bot engagement error:', err)
    return { success: false }
  }
}

// Get bot comments for display
export function getBotComment(isCelebrity = false) {
  const pool = isCelebrity ? BOT_COMMENTS.celebrity : BOT_COMMENTS.general
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomBotName(isCelebrity = false) {
  if (isCelebrity) {
    const bot = CELEBRITY_BOTS[Math.floor(Math.random() * CELEBRITY_BOTS.length)]
    return bot.name
  }
  return REGULAR_BOT_NAMES[Math.floor(Math.random() * REGULAR_BOT_NAMES.length)]
}
