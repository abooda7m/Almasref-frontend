'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Trophy, Target, Star, Award, LogOut, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface UserData {
  id: number
  full_name: string
  nickname: string
  phone: string
}

interface LeaderboardData {
  user_id: number
  issue_1: number
  issue_2: number
  issue_3: number
  issue_4: number
  issue_5: number
  issue_6: number
  issue_7: number
  issue_8: number
  total_score: number
  participation_count: number
  excellent_issues: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [rank, setRank] = useState<number>(0)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Extract phone from email (format: phone@almasrif.local)
    const phone = user.email?.split('@')[0]

    if (!phone) {
      router.push('/login')
      return
    }

    // جلب بيانات المستخدم من رقم الهاتف
    const { data: userInfo } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!userInfo) {
      router.push('/login')
      return
    }

    const userId = userInfo.id

    // جلب بيانات النقاط
    const { data: scores } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', userId)
      .single()

    // حساب الترتيب
    const { data: allScores } = await supabase
      .from('leaderboard')
      .select('user_id, total_score')
      .order('total_score', { ascending: false })

    const userRank = allScores?.findIndex(s => s.user_id === userId) ?? -1

    setUserData(userInfo)
    setLeaderboardData(scores)
    setRank(userRank + 1)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getExcellentCount = () => {
    if (!leaderboardData?.excellent_issues || leaderboardData.excellent_issues === 'لا يوجد') {
      return 0
    }
    return leaderboardData.excellent_issues.split('،').filter(item => item.trim()).length
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
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-almasref-green">المصرف</h1>
            <div className="flex gap-3">
              <Link 
                href="/leaderboard"
                className="px-4 py-2 text-almasref-gray hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span className="hidden sm:inline">المتصدرين</span>
              </Link>
              <Link 
                href="/excellent"
                className="px-4 py-2 text-almasref-gray hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
              >
                <Star className="w-5 h-5" />
                <span className="hidden sm:inline">المتميزين</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-almasref-green to-almasref-green-dark text-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-2">
            مرحباً، {userData?.full_name}
          </h2>
          <p className="text-almasref-green-light text-lg">{userData?.nickname}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            title="مجموع النقاط"
            value={leaderboardData?.total_score?.toLocaleString('ar-SA') || '0'}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            title="عدد المشاركات"
            value={leaderboardData?.participation_count?.toString() || '0'}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Star className="w-8 h-8" />}
            title="الأعداد المتميز فيها"
            value={getExcellentCount().toString()}
            color="bg-purple-500"
          />
          <StatCard
            icon={<Award className="w-8 h-8" />}
            title="الترتيب العام"
            value={rank > 0 ? `#${rank}` : '-'}
            color="bg-almasref-green"
          />
        </div>

        {/* Issues Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-almasref-gray">نقاطك في كل عدد</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((issue) => (
              <IssueCard
                key={issue}
                issue={issue}
                score={leaderboardData?.[`issue_${issue}` as keyof LeaderboardData] as number || 0}
              />
            ))}
          </div>
        </div>

        {/* Excellence Badge */}
        {leaderboardData?.excellent_issues !== 'لا يوجد' && leaderboardData?.excellent_issues && (
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-8 h-8 text-white fill-white" />
              <h3 className="text-2xl font-bold text-white">
                🎉 مبروك! أنت متميز في
              </h3>
            </div>
            <p className="text-white text-xl font-semibold">
              {leaderboardData?.excellent_issues}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
      <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white mb-4 shadow-md`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1 font-medium">{title}</p>
      <p className="text-3xl font-bold text-almasref-gray">{value}</p>
    </div>
  )
}

function IssueCard({ issue, score }: { issue: number, score: number }) {
  const isExcellent = score === 800000 || (issue === 1 && score === 400000) || (issue === 3 && score === 600000)
  
  return (
    <div className={`border-2 rounded-xl p-4 text-center transition hover:scale-105 ${
      isExcellent 
        ? 'border-yellow-400 bg-yellow-50' 
        : 'border-gray-200 bg-white'
    }`}>
      {isExcellent && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mx-auto mb-2" />}
      <p className="text-sm text-gray-600 mb-2 font-semibold">العدد {issue}</p>
      <p className="text-xl font-bold text-almasref-gray">
        {score.toLocaleString('ar-SA')}
      </p>
    </div>
  )
}
