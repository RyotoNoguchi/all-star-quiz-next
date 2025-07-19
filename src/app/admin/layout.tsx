/**
 * Admin Panel Layout
 * 
 * Root layout for all admin pages with role protection
 */

import { type FC, type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Props = {
  children: ReactNode
}

const AdminRootLayout: FC<Props> = async ({ children }) => {
  const session = await getServerSession(authOptions)

  // Redirect if not authenticated
  if (!session) {
    redirect('/auth/signin?callbackUrl=/admin/dashboard')
  }

  // Check user role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  // Redirect if not admin
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    redirect('/?error=insufficient-permissions')
  }

  return <>{children}</>
}

export default AdminRootLayout