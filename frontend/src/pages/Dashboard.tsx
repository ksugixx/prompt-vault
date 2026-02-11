import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPrompts, deletePrompt, logout, getAuthState } from '../api/client'
import type { Prompt, PromptFilters } from '../types'
import PromptCard from '../components/PromptCard'
import SearchFilter from '../components/SearchFilter'
import PromptForm from './PromptForm'

const Dashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { username } = getAuthState()

  const [filters, setFilters] = useState<PromptFilters>({})
  const [showForm, setShowForm] = useState(false)
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // プロンプト取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['prompts', filters],
    queryFn: () => getPrompts(filters),
  })

  const prompts = data?.prompts || []

  // 削除ミューテーション
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      setDeleteConfirm(null)
    },
  })

  // 利用可能なタグ一覧を集計
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    prompts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [prompts])

  const handleEdit = (prompt: Prompt) => {
    setEditPrompt(prompt)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm)
    }
  }

  const handleTagClick = (tag: string) => {
    setFilters({ ...filters, tag })
  }

  const handleCategoryClick = (category: string) => {
    setFilters({ ...filters, category })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditPrompt(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">PromptVault</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{username}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* 検索・フィルタ */}
        <SearchFilter
          filters={filters}
          onFilterChange={setFilters}
          availableTags={availableTags}
        />

        {/* ローディング */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 mt-2">読み込み中...</p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">データの取得に失敗しました</p>
          </div>
        )}

        {/* プロンプト一覧 */}
        {!isLoading && !error && (
          <>
            {prompts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg mb-2">プロンプトがありません</p>
                <p className="text-gray-400 text-sm">右下のボタンから新しいプロンプトを作成してください</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTagClick={handleTagClick}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* 新規作成フローティングボタン */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all hover:scale-105 flex items-center justify-center z-20"
        title="新しいプロンプトを作成"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* プロンプトフォームモーダル */}
      {showForm && (
        <PromptForm
          editPrompt={editPrompt}
          onClose={handleCloseForm}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">削除の確認</h3>
            <p className="text-sm text-gray-600 mb-6">
              このプロンプトを削除しますか？この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
              >
                {deleteMutation.isPending ? '削除中...' : '削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
