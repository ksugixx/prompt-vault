import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { googleAuth } from '../api/client'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme: string;
            size: string;
            width: string;
            text: string;
            locale: string;
          }) => void;
        };
      };
    };
  }
}

const Login = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setError('')
    setLoading(true)
    try {
      await googleAuth(response.credential)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { error?: string } } }
        if (axiosErr.response?.status === 403) {
          setError('ユーザー登録の上限に達しています。管理者にお問い合わせください。')
        } else {
          setError(axiosErr.response?.data?.error || '認証に失敗しました')
        }
      } else {
        setError('サーバーに接続できません')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google) return

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '300',
          text: 'signin_with',
          locale: 'ja',
        })
      }
    }

    // Google SDKが既にロード済みならすぐ初期化
    if (window.google) {
      initializeGoogle()
    } else {
      // SDKのロードを待つ
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval)
          initializeGoogle()
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [handleGoogleResponse])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">PromptVault</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Googleアカウントでログイン</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ローディング */}
          {loading && (
            <div className="text-center mb-4">
              <div className="inline-block w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">認証中...</p>
            </div>
          )}

          {/* Google Sign-In ボタン */}
          <div className="flex justify-center">
            <div ref={buttonRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
