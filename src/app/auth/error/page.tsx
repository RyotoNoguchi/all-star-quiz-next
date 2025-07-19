/**
 * Authentication Error Page
 * 
 * Displays authentication errors with user-friendly messages
 * and options to retry or get help
 */

import { type FC } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'

type Props = {
  searchParams: {
    error?: string
  }
}

const getErrorMessage = (error?: string): string => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Please try again later.'
    case 'AccessDenied':
      return 'Access denied. You do not have permission to sign in.'
    case 'Verification':
      return 'The verification token has expired or has already been used. Please try signing in again.'
    case 'OAuthSignin':
      return 'Error in constructing an authorization URL. Please try again.'
    case 'OAuthCallback':
      return 'Error in handling the response from an OAuth provider. Please try again.'
    case 'OAuthCreateAccount':
      return 'Could not create OAuth account in the database. Please try again.'
    case 'EmailCreateAccount':
      return 'Could not create email account in the database. Please try again.'
    case 'Callback':
      return 'Error in the OAuth callback handler route. Please try again.'
    case 'OAuthAccountNotLinked':
      return 'To confirm your identity, sign in with the same account you used originally.'
    case 'EmailSignin':
      return 'The e-mail could not be sent. Please try again.'
    case 'CredentialsSignin':
      return 'Sign in failed. Check the details you provided are correct.'
    case 'SessionRequired':
      return 'Please sign in to access this page.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

const AuthErrorPage: FC<Props> = ({ searchParams }) => {
  const errorMessage = getErrorMessage(searchParams.error)

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-2">
              Authentication Error
            </h1>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-red-500/30 p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3">
                Sign In Failed
              </h2>
              
              <p className="text-gray-300 text-sm leading-relaxed">
                {errorMessage}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Try Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AuthErrorPage