import type { Prompt } from '../types'

interface PromptCardProps {
  prompt: Prompt
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
  onCategoryClick: (category: string) => void
}

const AI_TOOL_COLORS: Record<string, string> = {
  Claude: 'bg-orange-100 text-orange-700',
  ChatGPT: 'bg-emerald-100 text-emerald-700',
  Gemini: 'bg-blue-100 text-blue-700',
  Other: 'bg-gray-100 text-gray-700',
}

const PromptCard = ({ prompt, onEdit, onDelete, onTagClick, onCategoryClick }: PromptCardProps) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
          {prompt.title}
        </h3>
        {prompt.aiTool && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${AI_TOOL_COLORS[prompt.aiTool] || AI_TOOL_COLORS.Other}`}>
            {prompt.aiTool}
          </span>
        )}
      </div>

      {/* 本文プレビュー */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
        {prompt.content}
      </p>

      {/* カテゴリ・タグ */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => onCategoryClick(prompt.category)}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
        >
          {prompt.category}
        </button>
        {prompt.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {formatDate(prompt.createdAt)}
        </span>
        <div className="flex gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="コピー"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(prompt)}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(prompt.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
