import { useState, useCallback, useEffect, useRef } from 'react'
import { FirestoreService } from '@/services/firestoreService'
import { Note } from '@/types/note'

interface UseNoteOptions {
  noteId?: string
  initialContent?: string
  autoSaveDelay?: number
}

interface UseNoteReturn {
  note: Note | null
  content: string
  isLoading: boolean
  isSaving: boolean
  isError: boolean
  error: string | null
  savedStatus: 'saved' | 'saving' | 'unsaved' | 'error'
  updateContent: (content: string) => void
  saveNote: () => Promise<void>
  createNewNote: (title?: string) => Promise<string | null>
}

export function useNote(userId: string | null, options: UseNoteOptions = {}): UseNoteReturn {
  const { noteId, initialContent = '', autoSaveDelay = 2000 } = options
  
  const [note, setNote] = useState<Note | null>(null)
  const [content, setContent] = useState(initialContent)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved')
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)
  const [hasUserEdited, setHasUserEdited] = useState(false)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  
  // Keep track of the last saved content to avoid unnecessary saves
  const lastSavedContentRef = useRef<string>('')

  // Load existing note
  useEffect(() => {
    if (noteId && userId && !initialLoadComplete) {
      setIsLoading(true)
      FirestoreService.getNote(noteId, userId)
        .then((loadedNote) => {
          if (loadedNote) {
            setNote(loadedNote)
            // Only set content from database if user hasn't started editing
            if (!hasUserEdited) {
              setContent(loadedNote.content)
              lastSavedContentRef.current = loadedNote.content
            }
            setSavedStatus('saved')
          }
        })
        .catch((err) => {
          setError(err.message)
          setIsError(true)
          setSavedStatus('error')
        })
        .finally(() => {
          setIsLoading(false)
          setInitialLoadComplete(true)
        })
    } else if (!noteId) {
      // For new notes, mark as initial load complete immediately
      setInitialLoadComplete(true)
    }
  }, [noteId, userId, hasUserEdited, initialLoadComplete])

  const updateContent = useCallback((newContent: string) => {
    setContent(newContent)
    setHasUserEdited(true)
    setError(null)
    setIsError(false)
  }, [])

  const saveNote = useCallback(async () => {
    if (!userId || !note || content === lastSavedContentRef.current) return

    setIsSaving(true)
    setSavedStatus('saving')
    setError(null)
    setIsError(false)

    try {
      // Generate title from content if not set
      const title = note.title || generateTitleFromContent(content)
      
      await FirestoreService.updateNote(note.id, userId, {
        title,
        content,
        excerpt: generateExcerpt(content)
      })

      // Update local note state
      setNote(prev => prev ? {
        ...prev,
        title,
        content,
        excerpt: generateExcerpt(content),
        updatedAt: new Date()
      } : null)

      lastSavedContentRef.current = content
      setSavedStatus('saved')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save note'
      setError(errorMessage)
      setIsError(true)
      setSavedStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [userId, note, content])

  // Auto-save functionality
  useEffect(() => {
    if (!userId || !note || content === lastSavedContentRef.current || !hasUserEdited) return

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    setSavedStatus('unsaved')

    // Set new timeout for auto-save
    const timeout = setTimeout(() => {
      saveNote()
    }, autoSaveDelay)

    setAutoSaveTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [content, userId, note, autoSaveDelay, saveNote, hasUserEdited, autoSaveTimeout])

  const createNewNote = useCallback(async (title?: string): Promise<string | null> => {
    if (!userId) return null

    setIsSaving(true)
    setSavedStatus('saving')
    setError(null)
    setIsError(false)

    try {
      const noteTitle = title || generateTitleFromContent(content) || 'Untitled Note'
      const noteId = await FirestoreService.createNote(userId, {
        title: noteTitle,
        content,
        excerpt: generateExcerpt(content),
        tags: [],
        categories: []
      })

      const newNote: Note = {
        id: noteId,
        title: noteTitle,
        content,
        excerpt: generateExcerpt(content),
        tags: [],
        categories: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setNote(newNote)
      lastSavedContentRef.current = content
      setSavedStatus('saved')
      setInitialLoadComplete(true)
      return noteId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create note'
      setError(errorMessage)
      setIsError(true)
      setSavedStatus('error')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [userId, content])

  return {
    note,
    content,
    isLoading,
    isSaving,
    isError,
    error,
    savedStatus,
    updateContent,
    saveNote,
    createNewNote
  }
}

// Helper functions
function generateTitleFromContent(content: string): string {
  // Remove HTML tags and get first line or sentence
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  if (!textContent) return 'Untitled Note'
  
  // Get first sentence or first 50 characters
  const firstSentence = textContent.split(/[.!?]/)[0]
  if (firstSentence.length > 50) {
    return firstSentence.substring(0, 47) + '...'
  }
  return firstSentence
}

function generateExcerpt(content: string): string {
  // Remove HTML tags and create excerpt
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  if (!textContent) return ''
  
  return textContent.length > 200 
    ? textContent.substring(0, 197) + '...'
    : textContent
} 