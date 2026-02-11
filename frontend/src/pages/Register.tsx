import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/client'

const Register = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /** パスワード強度の判定 */
  const getPasswordStrength = (): { level: string; color: string; width: string } => {
    if (!password) return { level: '', color: '', width: '0%' }
    if (password.length < 8) return { level: '弱い', color: 'bg-red-500', width: '33%' }

    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^a-zA-Z0-9]/.test(password)

    if (hasLetter && hasNumber && hasSpecial && password.length >= 12) {
      return { level: '強い', color: 'bg-green-500', width: '100%' }
    }
    if (hasLetter && hasNumber) {
      return { level: '普通', color: 'bg-yellow-500', width: '66%' }
    }
    return { level: '弱い', color: 'bg-red-500', width: '33%' }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (username.length < 3 || username.length > 20) {
      setError('ユーザー名は3〜20文字で入力してください')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('ユーザー名は英数字とアンダースコアのみ使用できます')
      return
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('パスワードには英字と数字の両方を含めてください')
      return
    }

    if (password !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setLoading(true)

    try {
      await register({ username, password })
      navigate('/login')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error || '登録に失敗しました')
      } else {
        setError('サーバーに接続できません')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">PromptVault</h1>
            <p className="text-gray-500 mt-2">新しいアカウントを作成</p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="3〜20文字（英数字、アンダースコア）"
              />
              {username && (username.length < 3 || username.length > 20) && (
                <p className="text-xs text-red-500 mt-1">3〜20文字で入力してください</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="8文字以上（英字と数字を含む）"
              />
              {/* パスワード強度表示 */}
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">強度: {strength.level}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード確認
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="パスワードを再入力"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">パスワードが一致しません</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : 'アカウント作成'}
            </button>
          </form>

          {/* ログインリンク */}
          <p className="text-center text-sm text-gray-500 mt-6">
            すでにアカウントをお持ちですか？{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              ログインへ戻る
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
