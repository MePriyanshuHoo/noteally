import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import TextEditor from '../TextEditor'

// Mock TipTap modules
const mockEditor = {
  getHTML: jest.fn(() => '<p>Test content</p>'),
  commands: {
    focus: jest.fn(),
    setContent: jest.fn(),
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
        toggleStrike: jest.fn(() => ({ run: jest.fn() })),
        toggleCode: jest.fn(() => ({ run: jest.fn() })),
        toggleHighlight: jest.fn(() => ({ run: jest.fn() })),
        toggleHeading: jest.fn(() => ({ run: jest.fn() })),
        setParagraph: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
        toggleTaskList: jest.fn(() => ({ run: jest.fn() })),
        toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
        setTextAlign: jest.fn(() => ({ run: jest.fn() })),
        toggleSuperscript: jest.fn(() => ({ run: jest.fn() })),
        toggleSubscript: jest.fn(() => ({ run: jest.fn() })),
        undo: jest.fn(() => ({ run: jest.fn() })),
        redo: jest.fn(() => ({ run: jest.fn() })),
        insertTable: jest.fn(() => ({ run: jest.fn() })),
        extendMarkRange: jest.fn(() => ({ setLink: jest.fn(() => ({ run: jest.fn() })) })),
        run: jest.fn()
      }))
    }))
  },
  can: jest.fn(() => ({
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        undo: jest.fn(() => ({ run: jest.fn(() => true) })),
        redo: jest.fn(() => ({ run: jest.fn(() => true) }))
      }))
    }))
  })),
  isActive: jest.fn((format: string) => format === 'bold'),
  getCharacterCount: jest.fn(() => 100),
  storage: {
    characterCount: {
      characters: jest.fn(() => 100),
      words: jest.fn(() => 20)
    }
  }
}

jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
  BubbleMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="bubble-menu">{children}</div>,
  FloatingMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="floating-menu">{children}</div>
}))

describe('TextEditor', () => {
  const defaultProps = {
    content: '<p>Initial content</p>',
    onUpdate: jest.fn(),
    placeholder: 'Start typing...'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the editor with default props', () => {
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    it('renders with custom aria-label', () => {
      render(<TextEditor {...defaultProps} aria-label="Custom editor" />)
      
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })

    it('shows loading state when editor is not ready', () => {
      const tiptapModule = jest.requireMock('@tiptap/react')
      tiptapModule.useEditor.mockReturnValue(null)
      
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByText('Loading editor...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('hides toolbar when not editable', () => {
      render(<TextEditor {...defaultProps} editable={false} />)
      
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes on toolbar', () => {
      render(<TextEditor {...defaultProps} />)
      
      const toolbar = screen.getByRole('toolbar')
      expect(toolbar).toHaveAttribute('aria-label', 'Text formatting toolbar')
    })

    it('has proper ARIA labels on toolbar buttons', () => {
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByLabelText('Toggle bold formatting')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle italic formatting')).toBeInTheDocument()
      expect(screen.getByLabelText('Toggle underline formatting')).toBeInTheDocument()
    })

    it('has aria-pressed attributes on active buttons', () => {
      render(<TextEditor {...defaultProps} />)
      
      const boldButton = screen.getByLabelText('Toggle bold formatting')
      expect(boldButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('shows keyboard shortcuts modal with proper accessibility', async () => {
      const user = userEvent.setup()
      render(<TextEditor {...defaultProps} />)
      
      const shortcutsButton = screen.getByLabelText('Show keyboard shortcuts')
      await user.click(shortcutsButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Close shortcuts panel')).toBeInTheDocument()
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
    })

    it('closes shortcuts modal with Escape key', async () => {
      const user = userEvent.setup()
      render(<TextEditor {...defaultProps} />)
      
      const shortcutsButton = screen.getByLabelText('Show keyboard shortcuts')
      await user.click(shortcutsButton)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })

  describe('Toolbar Functionality', () => {
    it('calls editor commands when toolbar buttons are clicked', async () => {
      const user = userEvent.setup()
      
      render(<TextEditor {...defaultProps} />)
      
      const boldButton = screen.getByLabelText('Toggle bold formatting')
      await user.click(boldButton)
      
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })

    it('handles heading button clicks', async () => {
      const user = userEvent.setup()
      
      render(<TextEditor {...defaultProps} />)
      
      const h1Button = screen.getByLabelText('Convert to heading level 1')
      await user.click(h1Button)
      
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })

    it('handles list button clicks', async () => {
      const user = userEvent.setup()
      
      render(<TextEditor {...defaultProps} />)
      
      const bulletListButton = screen.getByLabelText('Toggle bullet list')
      await user.click(bulletListButton)
      
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })

    it('handles undo/redo buttons', async () => {
      const user = userEvent.setup()
      
      render(<TextEditor {...defaultProps} />)
      
      const undoButton = screen.getByLabelText('Undo last action')
      await user.click(undoButton)
      
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })

    it('disables undo/redo buttons when not available', () => {
      mockEditor.can.mockReturnValue({
        chain: jest.fn(() => ({
          focus: jest.fn(() => ({
            undo: jest.fn(() => ({ run: jest.fn(() => false) })),
            redo: jest.fn(() => ({ run: jest.fn(() => false) }))
          }))
        }))
      })
      
      render(<TextEditor {...defaultProps} />)
      
      const undoButton = screen.getByLabelText('Undo last action')
      const redoButton = screen.getByLabelText('Redo last undone action')
      
      expect(undoButton).toBeDisabled()
      expect(redoButton).toBeDisabled()
    })
  })

  describe('Save Status', () => {
    it('shows saving status', () => {
      render(<TextEditor {...defaultProps} savedStatus="saving" />)
      
      expect(screen.getByText('Saving...')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('shows saved status', () => {
      render(<TextEditor {...defaultProps} savedStatus="saved" />)
      
      expect(screen.getByText('Saved')).toBeInTheDocument()
    })

    it('shows error status', () => {
      render(<TextEditor {...defaultProps} savedStatus="error" />)
      
      expect(screen.getByText('Error saving')).toBeInTheDocument()
    })
  })

  describe('Character Count', () => {
    it('displays character and word count', () => {
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByText('100 characters')).toBeInTheDocument()
      expect(screen.getByText('20 words')).toBeInTheDocument()
    })
  })

  describe('Link Functionality', () => {
    it('prompts for URL when adding link', async () => {
      const user = userEvent.setup()
      const mockPrompt = jest.fn().mockReturnValue('https://example.com')
      global.prompt = mockPrompt
      
      render(<TextEditor {...defaultProps} />)
      
      const linkButton = screen.getByLabelText('Insert or edit link')
      await user.click(linkButton)
      
      expect(mockPrompt).toHaveBeenCalledWith('Enter URL:')
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })

    it('does not add link when URL prompt is cancelled', async () => {
      const user = userEvent.setup()
      const mockPrompt = jest.fn().mockReturnValue(null)
      global.prompt = mockPrompt
      
      render(<TextEditor {...defaultProps} />)
      
      const linkButton = screen.getByLabelText('Insert or edit link')
      await user.click(linkButton)
      
      expect(mockPrompt).toHaveBeenCalled()
    })
  })

  describe('Table Functionality', () => {
    it('inserts table when table button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<TextEditor {...defaultProps} />)
      
      const tableButton = screen.getByLabelText('Insert table')
      await user.click(tableButton)
      
      expect(mockEditor.commands.chain).toHaveBeenCalled()
    })
  })

  describe('Bubble and Floating Menus', () => {
    it('renders bubble menu', () => {
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByTestId('bubble-menu')).toBeInTheDocument()
    })

    it('renders floating menu', () => {
      render(<TextEditor {...defaultProps} />)
      
      expect(screen.getByTestId('floating-menu')).toBeInTheDocument()
    })
  })

  describe('Full Screen Mode', () => {
    it('applies full screen styles when fullScreen prop is true', () => {
      render(<TextEditor {...defaultProps} fullScreen={true} />)
      
      const editorContainer = screen.getByTestId('editor-content').closest('div')
      expect(editorContainer).toHaveClass('h-full', 'flex', 'flex-col')
    })
  })
})