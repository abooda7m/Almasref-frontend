'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ExcellentUser {
  user_id: number
  full_name: string
  nickname: string
  issues: string[]
}

export default function ExcellentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [excellentByIssue, setExcellentByIssue] = useState<Record<number, ExcellentUser[]>>({})

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    await fetchExcellent()
  }

  const fetchExcellent = async () => {
    // جلب كل المتميزين
    const { data: scores } = await supabase
      .from('leaderboard')
      .select('user_id, excellent_issues')
      .neq('excellent_issues', 'لا يوجد')

    if (!scores) {
      setLoading(false)
      return
    }

    // جلب أسماء المستخدمين
    const userIds = scores.map(s => s.user_id)
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name, nickname')
      .in('id', userIds)

    // تنظيم البيانات حسب العدد
    const byIssue: Record<number, ExcellentUser[]> = {}

    scores.forEach(score => {
      const user = users?.find(u => u.id === score.user_id)
      if (!user || !score.excellent_issues) return

      const issues = score.excellent_issues.split('،').map((s: string) => s.trim())

      issues.forEach((issue: string) => {
        const match = issue.match(/العدد (\d+)/)
        if (!match) return

        const issueNum = parseInt(match[1])
        if (!byIssue[issueNum]) {
          byIssue[issueNum] = []
        }

        byIssue[issueNum].push({
          user_id: score.user_id,
          full_name: user.full_name,
          nickname: user.nickname,
          issues
        })
      })
    })

    setExcellentByIssue(byIssue)
    setLoading(false)
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
            <h1 className="text-2xl font-bold text-almasref-green">المتميزين</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <Star className="w-16 h-16 text-yellow-500 fill-yellow-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-almasref-gray mb-2">
            المتميزون في كل عدد
          </h2>
          <p className="text-gray-600">المتسابقون الذين حصلوا على الدرجة الكاملة</p>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(issue => {
            const users = excellentByIssue[issue] || []
            
            return (
              <div key={issue} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-almasref-green to-almasref-green-dark p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="w-6 h-6 fill-white" />
                    <h3 className="text-xl font-bold">العدد {issue}</h3>
                    <span className="mr-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                      {users.length} متميز
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  {users.length > 0 ? (
                    <div className="space-y-3">
                      {users.map((user, idx) => (
                        <div 
                          key={user.user_id}
                          className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                        >
                          <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-almasref-gray truncate">
                              {user.full_name}
                            </p>
                            <p className="text-sm text-gray-600 truncate">
                              {user.nickname}
                            </p>
                          </div>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p>لا يوجد متميزون بعد</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
