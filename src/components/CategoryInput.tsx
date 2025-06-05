'use client'

import { useState, useRef, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus, Folder } from 'lucide-react'

interface CategoryInputProps {
  categories: string[]
  onCategoriesChange: (categories: string[]) => void
  placeholder?: string
  suggestions?: string[]
  maxCategories?: number
  disabled?: boolean
}

export default function CategoryInput({
  categories,
  onCategoriesChange,
  placeholder = 'Add categories...',
  suggestions = [],
  maxCategories = 5,
  disabled = false
}: CategoryInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
    !categories.includes(suggestion)
  )

  const addCategory = (category: string) => {
    const trimmedCategory = category.trim()
    if (
      trimmedCategory &&
      !categories.includes(trimmedCategory) &&
      categories.length < maxCategories
    ) {
      onCategoriesChange([...categories, trimmedCategory])
      setInputValue('')
      setShowSuggestions(false)
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    onCategoriesChange(categories.filter(category => category !== categoryToRemove))
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addCategory(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && categories.length > 0) {
      removeCategory(categories[categories.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  useEffect(() => {
    if (inputValue && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }, [inputValue, suggestions.length])

  const getCategoryColor = (category: string) => {
    // Generate consistent colors based on category name
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-cyan-100 text-cyan-800'
    ]
    const hash = category.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg min-h-[2.5rem] bg-white focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
        {categories.map((category, index) => (
          <Badge
            key={index}
            variant="secondary"
            className={`flex items-center gap-1 px-2 py-1 text-sm hover:opacity-80 ${getCategoryColor(category)}`}
          >
            <Folder className="h-3 w-3" />
            {category}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeCategory(category)}
                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        
        {!disabled && categories.length < maxCategories && (
          <div className="flex-1 min-w-[120px] relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={categories.length === 0 ? placeholder : ''}
              className="border-none shadow-none focus-visible:ring-0 p-0 h-6"
            />
            
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.slice(0, 5).map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addCategory(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Folder className="h-3 w-3 text-gray-400" />
                      {suggestion}
                    </button>
                  ))
                ) : inputValue && (
                  <button
                    type="button"
                    onClick={() => addCategory(inputValue)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2 text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                    Create &quot;{inputValue}&quot;
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {!disabled && inputValue && categories.length < maxCategories && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => addCategory(inputValue)}
            className="h-6 px-2 text-xs"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {categories.length >= maxCategories && (
        <p className="text-xs text-orange-600">
          Maximum {maxCategories} categories allowed
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        Press Enter or comma to add categories. {categories.length}/{maxCategories} categories used.
      </p>
    </div>
  )
} 