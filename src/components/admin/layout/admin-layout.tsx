/**
 * Admin Layout Component
 * 
 * Main layout for admin panel with sidebar and header
 */

'use client'

import { type FC, type ReactNode } from 'react'
import { UserButton } from '@/components/auth/user-button'
import { Sidebar } from './sidebar'

type Props = {
  children: ReactNode
  title?: string
  description?: string
}

export const AdminLayout: FC<Props> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <UserButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}