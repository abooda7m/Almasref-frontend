'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogIn } from 'lucide-react'
import Image from 'next/image'
import Footer from '@/app/components/Footer'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const email = `${phone}@almasrif.local`
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: code,
      })

      if (error) throw error

      router.push('/dashboard')
    } catch (err: any) {
      setError('رقم الجوال أو الكود غير صحيح')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-almasref-green/10 to-almasref-green/5">
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-48 h-48">
                <Image
                  src="/logo.png"
                  alt="المصرف - Almasrif"
                  width={192}
                  height={192}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-gray-600 mt-2">لوحة المتسابقين</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-almasref-gray mb-2">
                رقم الجوال
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-almasref-green focus:border-transparent transition"
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-almasref-gray mb-2">
                كود تسجيل الدخول
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-almasref-green focus:border-transparent transition"
                required
                dir="ltr"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-almasref-green text-white py-3 rounded-xl font-bold hover:bg-almasref-green-dark transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جاري الدخول...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>إذا واجهتك أي مشكلة، تواصل مع الإدارة</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
