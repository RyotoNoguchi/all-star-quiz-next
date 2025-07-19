/**
 * Admin Sidebar Component
 * 
 * Navigation sidebar for admin panel with icons and active state
 */

'use client'

import { type FC } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Gamepad2, 
  ClipboardList, 
  Users,
  Settings,
  BarChart3
} from 'lucide-react'

type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavigationItem[] = [
  {
    name: 'ダッシュボード',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'ゲーム管理',
    href: '/admin/games',
    icon: Gamepad2,
  },
  {
    name: '問題管理',
    href: '/admin/questions',
    icon: ClipboardList,
  },
  {
    name: 'ユーザー管理',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: '統計',
    href: '/admin/stats',
    icon: BarChart3,
  },
  {
    name: '設定',
    href: '/admin/settings',
    icon: Settings,
  },
]

export const Sidebar: FC = () => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <h1 className="text-lg font-bold gradient-text">
          All Star Quiz 管理
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          Admin Panel v1.0
        </p>
      </div>
    </div>
  )
}