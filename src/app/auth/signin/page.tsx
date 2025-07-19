/**
 * Sign In Page
 * 
 * Authentication page for users to sign in with OAuth providers
 * Styled for All Star Quiz theme with game-like UI
 */

import { type FC } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { SignInForm } from '@/components/auth/signin-form'
import { MainLayout } from '@/components/layout/main-layout'

const SignInPage: FC = async () => {
  // Redirect if already signed in
  const session = await getServerSession(authOptions)
  if (session) {
    redirect('/')
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
              All Star Quiz
            </h1>
            <p className="text-gray-300 text-lg">
              Join the ultimate survival quiz game
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Sign In to Play
            </h2>
            
            <SignInForm />
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                By signing in, you agree to participate in our quiz challenges
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default SignInPage