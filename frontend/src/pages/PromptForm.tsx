import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPrompt, updatePrompt } from '../api/client'
import { Prompt, PromptFormData, CATEGORIES, AI_TOOLS } from '../types'

interface PromptFormProps {
  editPrompt?: Prompt | null
  onClose: () => void
}

const PromptForm = ({ editPrompt, onClose }: PromptFormProps) => {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [aiTool, setAiTool] = useState<string>('')
  const [error, setError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // 編集モード時の初期値設定
  useEffect(() => {
    if (editPrompt) {
      setTitle(editPrompt.title)
      setContent(editPrompt.content)
      setCategory(editPrompt.category)
      setTags(editPrompt.tags)
      setAiTool(editPrompt.aiTool || '')
    }
  }, [editPrompt])

  const createMutation = useMutation({
    mutationFn: (data: PromptFormData) => createPrompt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      onClose()
    },
    onError: () => setError('プロンプトの作成に失敗しました'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: PromptFormData) => updatePrompt(editPrompt!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
      onClose()
    },
    onError: () => setError('プロンプトの更新に失敗しました'),
  })

  const loading = createMutation.isPending || updateMutation.isPending

  const handleAddTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!title.trim()) {
      setError('タイトルを入力してください')
      return
    }
    if (title.length > 200) {
      setError('タイトルは200文字以内で入力してください')
      return
    }
    if (!content.trim()) {
      setError('本文を入力してください')
      return
    }
    if (content.length > 10000) {
      setError('本文は10,000文字以内で入力してください')
      return
    }

    const data: PromptFormData = {
      title: title.trim(),
      content,
      category,
      tags,
      aiTool: aiTool || undefined,
    }

    if (editPrompt) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editPrompt ? 'プロンプトを編集' : '新しいプロンプト'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* タイトル */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="プロンプトのタイトル"
                maxLength={200}
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/200</p>
            </div>

            {/* 本文 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  本文 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  {showPreview ? '編集に戻る' : 'プレビュー'}
                </button>
              </div>
              {showPreview ? (
                <div className="w-full min-h-[200px] px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-sm whitespace-pre-wrap">
                  {content || '(本文なし)'}
                </div>
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y text-sm"
                  placeholder="プロンプトの内容（マークダウン対応）"
                  maxLength={10000}
                />
              )}
              <p className="text-xs text-gray-400 mt-1 text-right">{content.length}/10,000</p>
            </div>

            {/* カテゴリ・AIツール */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="aiTool" className="block text-sm font-medium text-gray-700 mb-1">
                  AIツール
                </label>
                <select
                  id="aiTool"
                  value={aiTool}
                  onChange={(e) => setAiTool(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                >
                  <option value="">選択なし</option>
                  {AI_TOOLS.map((tool) => (
                    <option key={tool} value={tool}>{tool}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                タグ（最大10個）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                  placeholder="タグを入力してEnter"
                  disabled={tags.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={tags.length >= 10 || !tagInput.trim()}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ボタン */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : editPrompt ? '更新する' : '作成する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PromptForm
