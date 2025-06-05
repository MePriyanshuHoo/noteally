import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TagInput from '../TagInput'

describe('TagInput', () => {
  const mockOnTagsChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with placeholder text', () => {
    render(
      <TagInput 
        tags={[]} 
        onTagsChange={mockOnTagsChange} 
        placeholder="Add tags..." 
      />
    )
    
    expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument()
  })

  it('displays existing tags', () => {
    const tags = ['javascript', 'react', 'testing']
    render(
      <TagInput 
        tags={tags} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument()
    })
  })

  it('adds a tag when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(
      <TagInput 
        tags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'newtag')
    await user.keyboard('{Enter}')
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['newtag'])
  })

  it('adds a tag when comma is pressed', async () => {
    const user = userEvent.setup()
    render(
      <TagInput 
        tags={[]} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'newtag,')
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['newtag'])
  })

  it('removes a tag when X button is clicked', async () => {
    const user = userEvent.setup()
    const tags = ['tag1', 'tag2']
    render(
      <TagInput 
        tags={tags} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    const removeButtons = screen.getAllByRole('button')
    await user.click(removeButtons[0])
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['tag2'])
  })

  it('prevents duplicate tags', async () => {
    const user = userEvent.setup()
    const tags = ['existing']
    render(
      <TagInput 
        tags={tags} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'existing')
    await user.keyboard('{Enter}')
    
    expect(mockOnTagsChange).not.toHaveBeenCalled()
  })

  it('respects maxTags limit', async () => {
    const tags = ['tag1', 'tag2']
    render(
      <TagInput 
        tags={tags} 
        onTagsChange={mockOnTagsChange}
        maxTags={2}
      />
    )
    
    // When maxTags is reached, input should not be rendered
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.getByText('Maximum 2 tags allowed')).toBeInTheDocument()
  })

  it('shows suggestions when input is focused', async () => {
    const user = userEvent.setup()
    const suggestions = ['suggestion1', 'suggestion2']
    render(
      <TagInput 
        tags={[]} 
        onTagsChange={mockOnTagsChange}
        suggestions={suggestions}
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    
    await waitFor(() => {
      expect(screen.getByText('suggestion1')).toBeInTheDocument()
      expect(screen.getByText('suggestion2')).toBeInTheDocument()
    })
  })

  it('filters suggestions based on input', async () => {
    const user = userEvent.setup()
    const suggestions = ['javascript', 'java', 'python']
    render(
      <TagInput 
        tags={[]} 
        onTagsChange={mockOnTagsChange}
        suggestions={suggestions}
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'java')
    
    await waitFor(() => {
      expect(screen.getByText('javascript')).toBeInTheDocument()
      expect(screen.getByText('java')).toBeInTheDocument()
      expect(screen.queryByText('python')).not.toBeInTheDocument()
    })
  })

  it('is disabled when disabled prop is true', () => {
    render(
      <TagInput 
        tags={['tag1']} 
        onTagsChange={mockOnTagsChange}
        disabled={true}
      />
    )
    
    // Should not show remove buttons when disabled
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('removes last tag when backspace is pressed with empty input', async () => {
    const user = userEvent.setup()
    const tags = ['tag1', 'tag2']
    render(
      <TagInput 
        tags={tags} 
        onTagsChange={mockOnTagsChange} 
      />
    )
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.keyboard('{Backspace}')
    
    expect(mockOnTagsChange).toHaveBeenCalledWith(['tag1'])
  })
}) 