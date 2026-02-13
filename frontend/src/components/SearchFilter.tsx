import { useState, useEffect } from 'react'
import type { PromptFilters } from '../types'
import { CATEGORIES, AI_TOOLS } from '../types'

interface SearchFilterProps {
  filters: PromptFilters
  onFilterChange: (filters: PromptFilters) => void
  availableTags: string[]
}

const selectClass = 'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-gray-700 dark:text-gray-100'

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

  const sortValue = `${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`
  const isNonDefaultSort = filters.sortBy && filters.sortBy !== 'createdAt' || filters.sortOrder && filters.sortOrder !== 'desc'
  const hasActiveFilters = filters.search || filters.category || filters.tag || filters.aiTool || isNonDefaultSort

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
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
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>

      {/* フィルタ・ソート */}
      <div className="flex flex-wrap gap-2">
        {/* カテゴリ */}
        <select
          value={filters.category || ''}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value || undefined })}
          className={selectClass}
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
          className={selectClass}
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
          className={selectClass}
        >
          <option value="">AIツール</option>
          {AI_TOOLS.map((tool) => (
            <option key={tool} value={tool}>{tool}</option>
          ))}
        </select>

        {/* ソート */}
        <select
          value={sortValue}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-') as [PromptFilters['sortBy'], PromptFilters['sortOrder']]
            onFilterChange({ ...filters, sortBy, sortOrder })
          }}
          className={selectClass}
        >
          <option value="createdAt-desc">作成日（新しい順）</option>
          <option value="createdAt-asc">作成日（古い順）</option>
          <option value="updatedAt-desc">更新日（新しい順）</option>
          <option value="updatedAt-asc">更新日（古い順）</option>
          <option value="title-asc">タイトル（昇順）</option>
          <option value="title-desc">タイトル（降順）</option>
        </select>

        {/* クリアボタン */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchFilter
