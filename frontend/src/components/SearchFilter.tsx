import { useState, useEffect } from 'react'
import { PromptFilters, CATEGORIES, AI_TOOLS } from '../types'

interface SearchFilterProps {
  filters: PromptFilters
  onFilterChange: (filters: PromptFilters) => void
  availableTags: string[]
}

const SearchFilter = ({ filters, onFilterChange, availableTags }: SearchFilterProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // 検索入力のデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchInput || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // 外部からフィルタが変更された場合に同期
  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  const handleClearFilters = () => {
    setSearchInput('')
    onFilterChange({})
  }

  const hasActiveFilters = filters.search || filters.category || filters.tag || filters.aiTool

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
      {/* 検索バー */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="タイトル・本文で検索..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
        />
      </div>

      {/* フィルタ */}
      <div className="flex flex-wrap gap-2">
        {/* カテゴリ */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">カテゴリ</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* タグ */}
        <select
          value={filters.tag || ''}
          onChange={(e) => onFilterChange({ ...filters, tag: e.target.value || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">タグ</option>
          {availableTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

        {/* AIツール */}
        <select
          value={filters.aiTool || ''}
          onChange={(e) => onFilterChange({ ...filters, aiTool: e.target.value || undefined })}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">AIツール</option>
          {AI_TOOLS.map((tool) => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>

        {/* クリアボタン */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilter
