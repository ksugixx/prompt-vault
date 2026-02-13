import { useState, type FormEvent } from 'react'
import { changePassword } from '../api/client'

interface ChangePasswordModalProps {
  onClose: () => void
}

const inputClass = 'w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-700 dark:text-gray-100'

const ChangePasswordModal = ({ onClose }: ChangePasswordModalProps) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  /** パスワード強度の判定 */
  const getPasswordStrength = (): { level: string; color: string; width: string } => {
    if (!newPassword) return { level: '', color: '', width: '0%' }
    if (newPassword.length < 8) return { level: '弱い', color: 'bg-red-500', width: '33%' }

    const hasLetter = /[a-zA-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPassword)

    if (hasLetter && hasNumber && hasSpecial && newPassword.length >= 12) {
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
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('すべてのフィールドを入力してください')
      return
    }

    if (newPassword.length < 8) {
      setError('新しいパスワードは8文字以上で入力してください')
      return
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('新しいパスワードには英字と数字の両方を含めてください')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません')
      return
    }

    setLoading(true)

    try {
      await changePassword({ currentPassword, newPassword, confirmPassword })
      setSuccess(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        const serverError = axiosErr.response?.data?.error
        if (serverError === 'Current password is incorrect') {
          setError('現在のパスワードが正しくありません')
        } else {
          setError(serverError || 'パスワードの変更に失敗しました')
        }
      } else {
        setError('サーバーに接続できません')
      }
    } finally {
      setLoading(false)
    }
  }

  const strength = getPasswordStrength()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">パスワード変更</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 成功メッセージ */}
          {success ? (
            <div className="text-center py-4">
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">
                パスワードを変更しました
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors text-sm font-medium"
              >
                閉じる
              </button>
            </div>
          ) : (
            <>
              {/* エラーメッセージ */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 現在のパスワード */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    現在のパスワード
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>

                {/* 新しいパスワード */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    新しいパスワード
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="8文字以上（英字と数字を含む）"
                  />
                  {/* パスワード強度表示 */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">強度: {strength.level}</p>
                    </div>
                  )}
                </div>

                {/* 新しいパスワード（確認） */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    新しいパスワード（確認）
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="新しいパスワードを再入力"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">パスワードが一致しません</p>
                  )}
                </div>

                {/* ボタン */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '変更中...' : '変更する'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangePasswordModal
