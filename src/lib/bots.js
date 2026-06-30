import supabase from './supabase'

const CELEBRITY_BOTS = [
  { name: 'Drake', username: 'drake' },
  { name: 'Beyonce', username: 'beyonce' },
  { name: 'Taylor Swift', username: 'taylorswift' },
  { name: 'Cristiano Ronaldo', username: 'cristiano' },
  { name: 'Selena Gomez', username: 'selenagomez' },
  { name: 'Ariana Grande', username: 'arianagrande' },
  { name: 'Rihanna', username: 'rihanna' },
  { name: 'Cardi B', username: 'cardib' },
  { name: 'Dwayne Johnson', username: 'therock' },
  { name: 'Nicki Minaj', username: 'nickiminaj' },
  { name: 'Elon Musk', username: 'elonmusk' },
  { name: 'Kim Kardashian', username: 'kimkardashian' },
  { name: 'Kylie Jenner', username: 'kyliejenner' },
  { name: 'Justin Bieber', username: 'justinbieber' },
  { name: 'Eminem', username: 'eminem' },
  { name: 'LeBron James', username: 'lebronjames' },
  { name: 'Lionel Messi', username: 'messi' },
  { name: 'Neymar Jr', username: 'neymarjr' },
  { name: 'Shakira', username: 'shakira' },
  { name: 'Billie Eilish', username: 'billieeilish' },
  { name: 'Post Malone', username: 'postmalone' },
  { name: 'Davido', username: 'davido' },
  { name: 'Burna Boy', username: 'burnaboy' },
  { name: 'Wizkid', username: 'wizkid' },
  { name: 'Tiwa Savage', username: 'tiwasavage' },
  { name: 'Sarkodie', username: 'sarkodie' },
  { name: 'Tems', username: 'tems' },
  { name: 'Ayra Starr', username: 'ayrastarr' },
  { name: 'Bad Bunny', username: 'badbunny' },
  { name: 'J Balvin', username: 'jbalvin' },
  { name: 'Karol G', username: 'karolg' },
  { name: 'Lil Baby', username: 'lilbaby' },
  { name: 'SZA', username: 'sza' },
  { name: 'Doja Cat', username: 'dojacat' },
  { name: 'Harry Styles', username: 'harrystyles' },
  { name: 'BTS Official', username: 'bts_official' },
  { name: 'Kizz Daniel', username: 'kizzdaniel' },
  { name: 'Omah Lay', username: 'omahlay' },
  { name: 'Fireboy DML', username: 'fireboy' },
  { name: 'Patoranking', username: 'patoranking' },
]

const REGULAR_BOT_NAMES = [
  'starlight_fan', 'world_viewer', 'famous_lover', 'global_star', 'rising_fame',
  'daily_viewer', 'social_king', 'fame_seeker', 'world_star', 'mega_fan',
  'bright_future', 'shine_on', 'fame_wave', 'star_gazer', 'crowd_cheer',
  'hype_king', 'love_life22', 'xo_vibe', 'topfan99', 'globalstar',
  'trueviewer', 'fan_army1', 'dope_vibes', 'fire_content', 'lit_feed',
  'real_supporter', 'fan_club2B', 'viral_queen', 'hottest_feed', 'night_owl',
  'musiclover99', 'artworld22', 'thebigfan', 'contentking', 'viraltop',
]

const BOT_COMMENTS = {
  general: [
    'This is amazing!', 'Love this so much', 'Keep going!',
    'Wow absolutely incredible', 'This made my day', 'Legendary',
    'You are so talented', 'Real one', 'This hits different',
    'Pure talent right here', 'Mind blown', 'Absolutely stunning',
    'This is everything', 'Keep posting more', 'You deserve way more followers',
    'Shared to all my friends', 'Following for more',
    'We love to see it', 'Nothing but respect', 'W post',
    'Not me watching this 10 times', 'This went crazy', 'Big W energy',
    'Best content on here', 'This slaps', 'Insane talent',
  ],
  celebrity: [
    'This is fire', 'Love the energy you bring', 'Keep pushing',
    'The whole world needs to see this', 'Real talent',
    'You remind me of myself when I started', 'Big things coming for you',
    'Respect', 'My people right here', 'World class right here',
    'This goes crazy', 'Certified hit', 'Top tier content',
  ]
}

// Strategy: views first, then 40-50% likes, 30% comments, 15% shares
export async function simulateBotEngagement(postId, userId, userFollowers = 0) {
  try {
    const baseViews = userFollowers === 0
      ? Math.floor(Math.random() * 400) + 100  // 100-500 views for 0 followers
      : Math.floor(userFollowers * 0.15) + Math.floor(Math.random() * 500)

    const likeCount = Math.floor(baseViews * (0.40 + Math.random() * 0.10)) // 40-50%
    const commentCount = Math.floor(baseViews * 0.30)
    const shareCount = Math.floor(baseViews * 0.15)

    await supabase.from('posts').update({
      likes_count: likeCount,
      views_count: baseViews,
      comments_count: commentCount,
      shares_count: shareCount
    }).eq('id', postId)

    // Add bot comments (verified celebrities + regular)
    const numComments = Math.min(Math.floor(commentCount * 0.01) + 3, 10)
    const commentInserts = []
    for (let i = 0; i < numComments; i++) {
      const isCeleb = Math.random() > 0.55
      const pool = isCeleb ? BOT_COMMENTS.celebrity : BOT_COMMENTS.general
      const bot = isCeleb ? CELEBRITY_BOTS[Math.floor(Math.random() * CELEBRITY_BOTS.length)] : null
      commentInserts.push({
        user_id: userId,
        post_id: postId,
        content: pool[Math.floor(Math.random() * pool.length)],
        likes_count: Math.floor(Math.random() * 200),
        bot_name: bot ? bot.name : REGULAR_BOT_NAMES[Math.floor(Math.random() * REGULAR_BOT_NAMES.length)],
        bot_verified: isCeleb
      })
    }
    if (commentInserts.length > 0) {
      await supabase.from('comments').insert(commentInserts)
    }

    // Award coins (1 coin per 10 likes)
    const coinsEarned = Math.floor(likeCount / 10)
    if (coinsEarned > 0) {
      const { data: user } = await supabase.from('users').select('famous_coins, total_likes').eq('id', userId).single()
      if (user) {
        await supabase.from('users').update({
          famous_coins: (user.famous_coins || 0) + coinsEarned,
          total_likes: (user.total_likes || 0) + likeCount
        }).eq('id', userId)
        await supabase.from('coin_transactions').insert({
          user_id: userId, amount: coinsEarned, type: 'earned',
          description: 'Earned from post engagement', post_id: postId
        }).catch(() => {})
      }
    }

    // Simulate follower growth
    if (Math.random() > 0.4) {
      const newFollowers = Math.floor(Math.random() * 8) + 1
      await supabase.from('users').update({
        followers_count: Math.max(0, userFollowers) + newFollowers
      }).eq('id', userId)
    }

    return { success: true, likeCount, commentCount, baseViews }
  } catch (err) {
    console.error('Bot engagement error:', err)
    return { success: false }
  }
}

export function getBotComment(isCelebrity = false) {
  const pool = isCelebrity ? BOT_COMMENTS.celebrity : BOT_COMMENTS.general
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomBotName(isCelebrity = false) {
  if (isCelebrity) return CELEBRITY_BOTS[Math.floor(Math.random() * CELEBRITY_BOTS.length)].name
  return REGULAR_BOT_NAMES[Math.floor(Math.random() * REGULAR_BOT_NAMES.length)]
}

export function getRandomCelebrityBot() {
  return CELEBRITY_BOTS[Math.floor(Math.random() * CELEBRITY_BOTS.length)]
}
