import supabase from './supabase'

// Global celebrity bots with verified status
const CELEBRITY_BOTS = [
  { name: 'Drake', username: 'drake' },
  { name: 'Beyoncé', username: 'beyonce' },
  { name: 'Taylor Swift', username: 'taylorswift' },
  { name: 'Cristiano Ronaldo', username: 'cristiano' },
  { name: 'Selena Gomez', username: 'selenagomez' },
  { name: 'Ariana Grande', username: 'arianagrande' },
  { name: 'Rihanna', username: 'rihanna' },
  { name: 'Cardi B', username: 'cardib' },
  { name: 'The Rock', username: 'therock' },
  { name: 'Nicki Minaj', username: 'nickiminaj' },
  { name: 'Elon Musk', username: 'elonmusk' },
  { name: 'Kim Kardashian', username: 'kimkardashian' },
  { name: 'Kylie Jenner', username: 'kyliejenner' },
  { name: 'Justin Bieber', username: 'justinbieber' },
  { name: 'Eminem', username: 'eminem' },
  { name: 'Lebron James', username: 'lebronjames' },
  { name: 'Messi', username: 'messi' },
  { name: 'Neymar Jr', username: 'neymar' },
  { name: 'Shakira', username: 'shakira' },
  { name: 'BTS', username: 'bts_official' },
  { name: 'Billie Eilish', username: 'billieeilish' },
  { name: 'Post Malone', username: 'postmalone' },
  { name: 'Chloe Bailey', username: 'chloebailey' },
  { name: 'Davido', username: 'davido' },
  { name: 'Burna Boy', username: 'burnaboy' },
  { name: 'Wizkid', username: 'wizkid' },
  { name: 'Tiwa Savage', username: 'tiwasavage' },
  { name: 'Stonebwoy', username: 'stonebwoy' },
  { name: 'Sarkodie', username: 'sarkodie' },
  { name: 'Sho Madjozi', username: 'shomadjozi' },
  { name: 'Master KG', username: 'masterkg' },
  { name: 'Ckay', username: 'ckay' },
  { name: 'Omah Lay', username: 'omahlay' },
  { name: 'Tems', username: 'tems' },
  { name: 'Ayra Starr', username: 'ayrastarr' },
  { name: 'Fireboy DML', username: 'fireboyDML' },
  { name: 'Kizz Daniel', username: 'kizzdaniel' },
  { name: 'Patoranking', username: 'patoranking' },
  { name: 'Bad Bunny', username: 'badbunny' },
  { name: 'J Balvin', username: 'jbalvin' },
  { name: 'Daddy Yankee', username: 'daddyyankee' },
  { name: 'Karol G', username: 'karolg' },
  { name: 'Lil Baby', username: 'lilbaby' },
  { name: 'Gunna', username: 'gunna' },
  { name: 'Future', username: 'future' },
  { name: 'Tyler The Creator', username: 'tylerthecreator' },
  { name: 'SZA', username: 'sza' },
  { name: 'Doja Cat', username: 'dojacat' },
  { name: 'Lizzo', username: 'lizzo' },
  { name: 'Harry Styles', username: 'harrystyles' },
]

const REGULAR_BOT_NAMES = [
  'starlight_fan', 'world_viewer', 'famous_lover', 'global_star', 'rising_fame',
  'daily_viewer', 'social_king', 'fame_seeker', 'world_star', 'mega_fan',
  'bright_future', 'shine_on', 'fame_wave', 'star_gazer', 'crowd_cheer',
  'hype_king', 'love_life_22', 'xo_vibe', 'topfan99', 'globalstar2025',
  'trueviewer', 'fan_army1', 'dope_vibes', 'fire_content', 'lit_feed',
  'real_supporter', 'fan_club_2B', 'viral_queen', 'hottest_feed', 'night_owl_fan',
]

const BOT_COMMENTS = {
  general: [
    '🔥 This is amazing!', 'Love this so much! 💕', 'Keep going! 💪',
    'Wow absolutely incredible 🤩', 'This made my day! 😊', 'Legendary! 👑',
    'You are so talented!', 'Real one! ✅', 'This hits different 🎯',
    'Pure talent right here 🎨', 'Mind blown 🤯', 'Absolutely stunning 😮',
    'This is everything! ❤️‍🔥', 'Keep posting more! 🙏', 'You deserve way more followers',
    'Shared to all my friends!', 'Following for more! 🔔', 'GOD BLESS 🙏',
    'We love to see it 🌟', 'Nothing but respect 🫡', 'W post fr 💯',
    'Not me watching this 10 times 😭', 'This went crazy 🔥🔥', 'Big W energy 💪',
  ],
  celebrity: [
    '🔥 This is fire!', 'Love the energy you bring 💕', 'Keep pushing! 💪',
    'The whole world needs to see this 🌍', 'Real talent! ✅',
    'You remind me of myself when I started 👑', 'Big things coming for you! 🚀',
    'Respect! 🙌', 'My people right here 💯', 'World class right here 🌟',
  ]
}

export async function simulateBotEngagement(postId, userId, userFollowers = 0) {
  try {
    const likeCount = userFollowers === 0
      ? Math.floor(Math.random() * 50) + 10
      : Math.floor(userFollowers * 0.03) + Math.floor(Math.random() * 50)

    const commentCount = Math.floor(likeCount * 0.2)
    const viewCount = likeCount * 3

    await supabase.from('posts').update({
      likes_count: likeCount,
      views_count: viewCount,
      comments_count: commentCount
    }).eq('id', postId)

    const numComments = Math.min(commentCount, 7)
    const commentInserts = []
    for (let i = 0; i < numComments; i++) {
      const isCeleb = Math.random() > 0.6
      const commentPool = isCeleb ? BOT_COMMENTS.celebrity : BOT_COMMENTS.general
      commentInserts.push({
        user_id: userId,
        post_id: postId,
        content: commentPool[Math.floor(Math.random() * commentPool.length)],
        likes_count: Math.floor(Math.random() * 50),
        bot_name: isCeleb
          ? CELEBRITY_BOTS[Math.floor(Math.random() * CELEBRITY_BOTS.length)].name
          : REGULAR_BOT_NAMES[Math.floor(Math.random() * REGULAR_BOT_NAMES.length)],
        bot_verified: isCeleb
      })
    }
    if (commentInserts.length > 0) {
      await supabase.from('comments').insert(commentInserts)
    }

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
        })
      }
    }

    if (Math.random() > 0.5) {
      const newFollowers = Math.floor(Math.random() * 5) + 1
      await supabase.from('users').update({ followers_count: Math.max(0, userFollowers) + newFollowers }).eq('id', userId)
    }

    return { success: true, likeCount, commentCount, viewCount }
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
