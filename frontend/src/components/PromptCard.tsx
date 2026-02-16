import type { Prompt } from '../types'

interface PromptCardProps {
  prompt: Prompt
  onClick: (prompt: Prompt) => void
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onTogglePin: (prompt: Prompt) => void
  onTagClick: (tag: string) => void
  onCategoryClick: (category: string) => void
}

const AI_TOOL_COLORS: Record<string, string> = {
  Claude: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  ChatGPT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
}

const PromptCard = ({ prompt, onClick, onEdit, onDelete, onTogglePin, onTagClick, onCategoryClick }: PromptCardProps) => {
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
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 transition-opacity duration-300'
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
    })
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-5 cursor-pointer"
      onClick={() => onClick(prompt)}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 mr-2">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(prompt) }}
            className={`shrink-0 p-1 rounded transition-colors ${
              prompt.isPinned
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500'
            }`}
            title={prompt.isPinned ? 'ピン留め解除' : 'ピン留め'}
          >
            <svg className="w-5 h-5" fill={prompt.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 flex-1">
            {prompt.title}
          </h3>
        </div>
        {prompt.aiTool && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other}`}>
            {prompt.aiTool}
          </span>
        )}
      </div>

      {/* 説明 or 本文プレビュー */}
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
        {prompt.description || prompt.content}
      </p>

      {/* カテゴリ・タグ */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={(e) => { e.stopPropagation(); onCategoryClick(prompt.category) }}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        >
          {prompt.category}
        </button>
        {prompt.tags.map((tag) => (
          <button
            key={tag}
            onClick={(e) => { e.stopPropagation(); onTagClick(tag) }}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatDate(prompt.createdAt)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleCopy() }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="コピー"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prompt) }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(prompt.id) }}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PromptCard
