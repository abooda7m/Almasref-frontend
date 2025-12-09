'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface TopUser {
  user_id: number
  full_name: string
  nickname: string
  total_score: number
  participation_count: number
  excellent_issues: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    await fetchTopUsers()
  }

  const fetchTopUsers = async () => {
    // جلب Top 10
    const { data: scores } = await supabase
      .from('leaderboard')
      .select('user_id, total_score, participation_count, excellent_issues')
      .order('total_score', { ascending: false })
      .limit(10)

    if (!scores) return

    // جلب أسماء المستخدمين
    const userIds = scores.map(s => s.user_id)
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, nickname')
      .in('id', userIds)

    // دمج البيانات
    const combined = scores.map(score => {
      const user = users?.find(u => u.id === score.user_id)
      return {
        user_id: score.user_id,
        full_name: user?.full_name || '',
        nickname: user?.nickname || '',
        total_score: score.total_score,
        participation_count: score.participation_count,
        excellent_issues: score.excellent_issues
      }
    })

    setTopUsers(combined)
    setLoading(false)
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-8 h-8 text-yellow-500 fill-yellow-500" />
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400 fill-gray-400" />
    if (rank === 3) return <Award className="w-8 h-8 text-amber-600 fill-amber-600" />
    return <span className="text-2xl font-bold text-gray-400">#{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600'
    if (rank === 2) return 'from-gray-300 to-gray-500'
    if (rank === 3) return 'from-amber-500 to-amber-700'
    return 'from-almasref-green to-almasref-green-dark'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-almasref-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-almasref-gray">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ArrowRight className="w-6 h-6 text-almasref-gray" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-almasref-green">المتصدرين</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-almasref-green mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-almasref-gray mb-2">
            قائمة الشرف
          </h2>
          <p className="text-gray-600">أفضل 10 متسابقين</p>
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {topUsers.map((user, index) => {
            const rank = index + 1
            const excellentCount = user.excellent_issues === 'لا يوجد' ? 0 : user.excellent_issues.split('،').length

            return (
              <div
                key={user.user_id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition ${
                  rank <= 3 ? 'border-2 border-yellow-400' : ''
                }`}
              >
                <div className={`h-2 bg-gradient-to-r ${getRankColor(rank)}`}></div>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                      {getMedalIcon(rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-almasref-gray">
                        {user.full_name}
                      </h3>
                      <p className="text-gray-600">{user.nickname}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-left">
                      <div className="text-3xl font-bold text-almasref-green mb-1">
                        {user.total_score.toLocaleString('ar-SA')}
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>مشاركات: {user.participation_count}</span>
                        <span>متميز: {excellentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty State */}
        {topUsers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">لا توجد بيانات بعد</p>
          </div>
        )}
      </main>
    </div>
  )
}
