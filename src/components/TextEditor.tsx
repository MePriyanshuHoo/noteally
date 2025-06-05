'use client'

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import Focus from '@tiptap/extension-focus'
import CharacterCount from '@tiptap/extension-character-count'
import { useEffect, useRef, useState, useCallback } from 'react'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  CheckSquare,
  Link as LinkIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Type,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Keyboard,
  X,
} from 'lucide-react'

interface TextEditorProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  className?: string
  editable?: boolean
  fullScreen?: boolean
  savedStatus?: 'saved' | 'saving' | 'unsaved' | 'error'
  'aria-label'?: string
  'aria-describedby'?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
  'aria-label'?: string
  className?: string
}

const ToolbarButton = ({ 
  onClick, 
  isActive, 
  disabled, 
  children, 
  title, 
  'aria-label': ariaLabel,
  className = ''
}: ToolbarButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-label={ariaLabel || title}
    aria-pressed={isActive}
    className={`
      inline-flex items-center justify-center w-8 h-8 rounded text-sm font-medium transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
      ${isActive 
        ? 'bg-blue-100 text-blue-700 border border-blue-300 shadow-sm' 
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
      }
      ${disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'cursor-pointer'
      }
      ${className}
    `}
  >
    {children}
  </button>
)

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-300 mx-1" role="separator" aria-orientation="vertical" />
)

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const KeyboardShortcutsModal = ({ isOpen, onClose }: KeyboardShortcutsModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    { key: 'Ctrl+B', action: 'Bold' },
    { key: 'Ctrl+I', action: 'Italic' },
    { key: 'Ctrl+U', action: 'Underline' },
    { key: 'Ctrl+Shift+S', action: 'Strikethrough' },
    { key: 'Ctrl+E', action: 'Code' },
    { key: 'Ctrl+Shift+H', action: 'Highlight' },
    { key: 'Ctrl+K', action: 'Link' },
    { key: 'Ctrl+1', action: 'Heading 1' },
    { key: 'Ctrl+2', action: 'Heading 2' },
    { key: 'Ctrl+3', action: 'Heading 3' },
    { key: 'Ctrl+Shift+7', action: 'Ordered list' },
    { key: 'Ctrl+Shift+8', action: 'Bullet list' },
    { key: 'Ctrl+Shift+9', action: 'Task list' },
    { key: 'Ctrl+Shift+B', action: 'Blockquote' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Shift+Z', action: 'Redo' },
    { key: 'Tab', action: 'Indent list item' },
    { key: 'Shift+Tab', action: 'Outdent list item' },
    { key: '/', action: 'Slash commands (at start of line)' },
    { key: 'Ctrl+A', action: 'Select all' },
  ]

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close shortcuts panel"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{action}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TextEditor({ 
  content = '', 
  placeholder = 'Type "/" for commands, or start writing...', 
  onUpdate,
  className = '',
  editable = true,
  fullScreen = false,
  savedStatus = 'saved',
  'aria-label': ariaLabel = 'Rich text editor',
  'aria-describedby': ariaDescribedby
}: TextEditorProps) {
  const isUpdatingContentRef = useRef(false)
  const lastExternalContentRef = useRef(content)
  const [showShortcuts, setShowShortcuts] = useState(false)


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'prose-bullet-list',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'prose-ordered-list',
          },
        },
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
          HTMLAttributes: {
            class: 'prose-heading',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'prose-blockquote',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'prose-code-block',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'prose-link',
          rel: 'noopener noreferrer',
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'prose-highlight',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'prose-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList.configure({
        HTMLAttributes: {
          class: 'prose-task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'prose-task-item',
        },
      }),
      Typography,
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      CharacterCount,
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        'aria-label': ariaLabel,
        'aria-describedby': ariaDescribedby || '',
        'role': 'textbox',
        'aria-multiline': 'true',
        'spellcheck': 'true',
      },
    },
    onUpdate: ({ editor }) => {
      if (onUpdate && !isUpdatingContentRef.current) {
        const newContent = editor.getHTML()
        lastExternalContentRef.current = newContent
        onUpdate(newContent)
      }
    },
  })

  useEffect(() => {
    if (editor && content !== lastExternalContentRef.current) {
      const currentContent = editor.getHTML()
      if (content !== currentContent) {
        isUpdatingContentRef.current = true
        editor.commands.setContent(content, false)
        lastExternalContentRef.current = content
        setTimeout(() => {
          isUpdatingContentRef.current = false
        }, 10)
      }
    }
  }, [content, editor])

  const addLink = useCallback(() => {
    if (!editor) return
    
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])

  const insertTable = useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const toggleTaskList = useCallback(() => {
    if (!editor) return
    editor.chain().focus().toggleTaskList().run()
  }, [editor])

  if (!editor) {
    return (
      <div 
        className="flex items-center justify-center p-8 text-gray-500"
        role="status"
        aria-live="polite"
      >
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
        Loading editor...
      </div>
    )
  }

  return (
    <div 
      className={`${fullScreen ? 'h-full flex flex-col' : ''} border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm ${className}`}
    >
      {/* Floating Menu for slash commands */}
      {editable && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              <Heading1 size={16} className="mr-2" />
              Heading 1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              <Heading2 size={16} className="mr-2" />
              Heading 2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              <List size={16} className="mr-2" />
              Bullet List
            </button>
            <button
              onClick={toggleTaskList}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              <CheckSquare size={16} className="mr-2" />
              Task List
            </button>
            <button
              onClick={insertTable}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-100 rounded text-sm"
            >
              <TableIcon size={16} className="mr-2" />
              Table
            </button>
          </div>
        </FloatingMenu>
      )}

      {/* Bubble Menu for text selection */}
      {editable && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-1 bg-gray-900 text-white p-2 rounded-lg shadow-lg">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
              className="text-white hover:bg-gray-700 border-gray-600"
            >
              <Bold size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
              className="text-white hover:bg-gray-700 border-gray-600"
            >
              <Italic size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add Link"
              className="text-white hover:bg-gray-700 border-gray-600"
            >
              <LinkIcon size={14} />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
              className="text-white hover:bg-gray-700 border-gray-600"
            >
              <Palette size={14} />
            </ToolbarButton>
          </div>
        </BubbleMenu>
      )}

      {/* Main Toolbar */}
      {editable && (
        <div 
          className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50 flex-wrap"
          role="toolbar"
          aria-label="Text formatting toolbar"
        >
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
              aria-label="Toggle bold formatting"
            >
              <Bold size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
              aria-label="Toggle italic formatting"
            >
              <Italic size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
              aria-label="Toggle underline formatting"
            >
              <UnderlineIcon size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough (Ctrl+Shift+S)"
              aria-label="Toggle strikethrough formatting"
            >
              <Strikethrough size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code (Ctrl+E)"
              aria-label="Toggle inline code formatting"
            >
              <Code size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight (Ctrl+Shift+H)"
              aria-label="Toggle text highlighting"
            >
              <Palette size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Subscript/Superscript */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive('superscript')}
              title="Superscript"
              aria-label="Toggle superscript"
            >
              <SuperscriptIcon size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive('subscript')}
              title="Subscript"
              aria-label="Toggle subscript"
            >
              <SubscriptIcon size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1 (Ctrl+1)"
              aria-label="Convert to heading level 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2 (Ctrl+2)"
              aria-label="Convert to heading level 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3 (Ctrl+3)"
              aria-label="Convert to heading level 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Paragraph"
              aria-label="Convert to paragraph"
            >
              <Type size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List (Ctrl+Shift+8)"
              aria-label="Toggle bullet list"
            >
              <List size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List (Ctrl+Shift+7)"
              aria-label="Toggle numbered list"
            >
              <ListOrdered size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={toggleTaskList}
              isActive={editor.isActive('taskList')}
              title="Task List (Ctrl+Shift+9)"
              aria-label="Toggle task list"
            >
              <CheckSquare size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote (Ctrl+Shift+B)"
              aria-label="Toggle blockquote"
            >
              <Quote size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
              aria-label="Align text left"
            >
              <AlignLeft size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
              aria-label="Align text center"
            >
              <AlignCenter size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
              aria-label="Align text right"
            >
              <AlignRight size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justify"
              aria-label="Justify text"
            >
              <AlignJustify size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Insert Elements */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add Link (Ctrl+K)"
              aria-label="Insert or edit link"
            >
              <LinkIcon size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={insertTable}
              title="Insert Table"
              aria-label="Insert table"
            >
              <TableIcon size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo (Ctrl+Z)"
              aria-label="Undo last action"
            >
              <Undo size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo last undone action"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          {/* Keyboard Shortcuts */}
          <ToolbarButton
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard size={16} />
          </ToolbarButton>

          {/* Save Status */}
          {onUpdate && (
            <div className="ml-auto flex items-center text-xs text-gray-500" role="status" aria-live="polite">
              {savedStatus === 'saving' && (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span>Saving...</span>
                </div>
              )}
              {savedStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-600">
                  <span>✓</span>
                  <span>Saved</span>
                </div>
              )}
              {savedStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600">
                  <span>⚠</span>
                  <span>Error saving</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Content */}
      <div 
        className={`prose prose-sm max-w-none p-6 ${fullScreen ? 'flex-1 overflow-y-auto' : 'min-h-[300px]'} 
        [&_.ProseMirror]:outline-none [&_.ProseMirror]:h-full 
        [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] 
        [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left 
        [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 
        [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none 
        [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
        [&_.prose-task-list]:list-none [&_.prose-task-list]:pl-0
        [&_.prose-task-item]:flex [&_.prose-task-item]:items-start [&_.prose-task-item]:gap-2
        [&_.prose-highlight]:bg-yellow-200 [&_.prose-highlight]:px-1 [&_.prose-highlight]:rounded
        [&_.prose-link]:text-blue-600 [&_.prose-link]:underline [&_.prose-link:hover]:text-blue-800
        [&_.prose-table]:border-collapse [&_.prose-table]:border [&_.prose-table]:border-gray-300
        [&_.prose-table_td]:border [&_.prose-table_td]:border-gray-300 [&_.prose-table_td]:p-2
        [&_.prose-table_th]:border [&_.prose-table_th]:border-gray-300 [&_.prose-table_th]:p-2 [&_.prose-table_th]:bg-gray-50
        [&_.has-focus]:ring-2 [&_.has-focus]:ring-blue-500 [&_.has-focus]:ring-opacity-50
        `}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      {editable && (
        <div 
          className="flex items-center justify-between px-6 py-3 text-xs text-gray-500 bg-gray-50 border-t border-gray-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            <span>{editor.storage.characterCount.characters()} characters</span>
            <span>{editor.storage.characterCount.words()} words</span>
          </div>
          <div className="text-right">
            <span>Type &ldquo;/&rdquo; for quick commands • Press Ctrl+/ for shortcuts</span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}