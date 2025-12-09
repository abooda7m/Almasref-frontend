import { Heart, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto py-8 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
            <span>صُنع بـ</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>بواسطة</span>
          </div>

          <a
            href="https://www.linkedin.com/in/abdulrahman-alkholaifi-1a3a1b279?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border-2 border-gray-200 hover:border-almasref-green text-almasref-gray hover:text-almasref-green transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Linkedin className="w-5 h-5 text-[#0A66C2] group-hover:scale-110 transition-transform duration-300" />
            <span className="font-semibold">Abdulrahman Alkholaifi</span>
          </a>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-gray-600 font-medium">
              Data engineer and Full Stack Developer
            </p>
            <p className="text-xs text-gray-400">
              © 2024 المصرف - جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
