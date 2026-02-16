import { useEffect } from 'react'
import Markdown from 'react-markdown'
import type { Prompt } from '../types'

interface PromptDetailModalProps {
  prompt: Prompt
  onClose: () => void
  onEdit: (prompt: Prompt) => void
}

const AI_TOOL_COLORS: Record<string, string> = {
  Claude: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ChatGPT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

const PromptDetailModal = ({ prompt, onClose, onEdit }: PromptDetailModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content)
      showToast('クリップボードにコピーしました')
    } catch {
      showToast('コピーに失敗しました')
    }
  }

  const showToast = (message: string) => {
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-[60] transition-opacity duration-300'
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="p-6 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 mr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {prompt.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {prompt.aiTool && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other}`}>
                  {prompt.aiTool}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* カテゴリ・タグ */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {prompt.category}
            </span>
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 本文（スクロール可能） */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <Markdown>{prompt.content}</Markdown>
          </div>
        </div>

        {/* フッター */}
        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-0.5">
              <p>作成: {formatDate(prompt.createdAt)}</p>
              {prompt.updatedAt !== prompt.createdAt && (
                <p>更新: {formatDate(prompt.updatedAt)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                コピー
              </button>
              <button
                onClick={() => onEdit(prompt)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                編集
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptDetailModal
