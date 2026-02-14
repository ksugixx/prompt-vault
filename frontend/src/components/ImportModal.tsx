import { useState, useRef } from 'react'
import { parseImportFile, importPrompts } from '../api/client'
import type { PromptFormData, ImportPromptsResponse } from '../types'

interface ImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

const ImportModal = ({ onClose, onSuccess }: ImportModalProps) => {
  const [parsedData, setParsedData] = useState<PromptFormData[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportPromptsResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError('')
    setParsedData(null)
    setResult(null)

    try {
      const data = await parseImportFile(file)
      if (data.length === 0) {
        setError('ファイルにプロンプトが含まれていません')
        return
      }
      if (data.length > 100) {
        setError('一度にインポートできるプロンプトは最大100件です')
        return
      }
      setParsedData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不正なJSON形式です')
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleImport = async () => {
    if (!parsedData) return
    setLoading(true)
    setError('')

    try {
      const res = await importPrompts(parsedData)
      setResult(res)
      if (res.importedCount > 0) {
        onSuccess()
      }
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        setError(axiosErr.response?.data?.error || 'インポートに失敗しました')
      } else {
        setError('サーバーに接続できません')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">プロンプトのインポート</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 結果表示 */}
          {result ? (
            <div className="space-y-4">
              <div className={`p-3 rounded-lg text-sm border ${
                result.failedCount === 0
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
              }`}>
                <p>{result.importedCount}件のプロンプトをインポートしました</p>
                {result.failedCount > 0 && (
                  <p className="mt-1">{result.failedCount}件が失敗しました</p>
                )}
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">エラー詳細:</p>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-0.5">
                    {result.errors.map((e, i) => (
                      <li key={i}>{e.error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  閉じる
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* エラー */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* ファイル選択 */}
              {!parsedData && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <svg className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    JSONファイルをドラッグ＆ドロップ
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    またはクリックしてファイルを選択
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </div>
              )}

              {/* プレビュー */}
              {parsedData && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {parsedData.length}件のプロンプトが見つかりました
                  </p>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                      {parsedData.map((p, i) => (
                        <div key={i} className="px-3 py-2 text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {p.title || <span className="text-red-400 italic">タイトルなし</span>}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {p.category && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{p.category}</span>
                            )}
                            {p.tags && p.tags.length > 0 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {p.tags.slice(0, 3).join(', ')}{p.tags.length > 3 ? ` +${p.tags.length - 3}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedData(null)
                        setError('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="px-5 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      戻る
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={loading}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'インポート中...' : `${parsedData.length}件をインポート`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportModal
