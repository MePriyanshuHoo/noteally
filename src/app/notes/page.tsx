'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment'
import { FirestoreService } from '@/services/firestoreService'
import { Note } from '@/types/note'
import Link from 'next/link'
import { FileText, Plus, Search, Calendar, Tag, AlertCircle, RefreshCw, Sparkles, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProtectedRoute from '@/components/ProtectedRoute'
import NoteEnrichmentDialog from '@/components/NoteEnrichmentDialog'
import { useRouter } from 'next/navigation'

function NotesContent() {
  const { user, isAuthenticated } = useAuth()
  const { enrichNote, isEnriching, enrichmentError, lastEnrichmentResult, clearError } = useNoteEnrichment()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [selectedNoteForEnrichment, setSelectedNoteForEnrichment] = useState<Note | null>(null)
  const [isEnrichmentDialogOpen, setIsEnrichmentDialogOpen] = useState(false)
  const [isApplyingEnrichment, setIsApplyingEnrichment] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const router = useRouter()

  const fetchNotes = useCallback(async () => {
    if (!user?.uid) {
      setError('No user authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Attempting to fetch notes for user: ${user.uid}`)
      const fetchedNotes = await FirestoreService.getNotes(user.uid)
      setNotes(fetchedNotes)
      console.log(`Successfully fetched ${fetchedNotes.length} notes`)
      setRetryCount(0)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch notes'
      console.error('Error fetching notes:', err)
      
      // Handle specific Firebase errors
      if (errorMessage.includes('ADMIN_ONLY_OPERATION')) {
        setError('Database access denied. Please check your Firebase configuration and security rules.')
      } else if (errorMessage.includes('permission-denied')) {
        setError('Permission denied. Your account may not have proper access rights.')
      } else if (errorMessage.includes('unauthenticated')) {
        setError('Authentication expired. Please refresh the page.')
      } else {
        setError(errorMessage)
      }
      
      setRetryCount(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }, [user?.uid])

  // Fetch notes when user is available and authenticated
  useEffect(() => {
    if (user?.uid && isAuthenticated) {
      fetchNotes()
    }
  }, [user?.uid, isAuthenticated, fetchNotes])

  const handleEnrichNote = async (note: Note) => {
    if (!note.content || note.content.trim().length === 0) {
      setError('Cannot enrich note: Note content is empty')
      return
    }

    setSelectedNoteForEnrichment(note)
    clearError()

    const result = await enrichNote(note)
    if (result) {
      setIsEnrichmentDialogOpen(true)
    }
  }

  const handleApplyEnrichment = async (updates: Partial<Note>) => {
    if (!selectedNoteForEnrichment || !user?.uid) return

    setIsApplyingEnrichment(true)
    try {
      await FirestoreService.updateNote(selectedNoteForEnrichment.id, user.uid, updates)
      
      // Update the local notes state
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === selectedNoteForEnrichment.id 
            ? { ...note, ...updates, updatedAt: new Date() }
            : note
        )
      )

      setIsEnrichmentDialogOpen(false)
      setSelectedNoteForEnrichment(null)
    } catch (err) {
      console.error('Error applying enrichment:', err)
      setError(err instanceof Error ? err.message : 'Failed to apply enrichment')
    } finally {
      setIsApplyingEnrichment(false)
    }
  }

  const handleDeleteNote = async (note: Note) => {
    if (!user?.uid) return

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${note.title}"? This action cannot be undone.`
    )

    if (!confirmDelete) return

    setDeletingNoteId(note.id)
    try {
      await FirestoreService.deleteNote(note.id, user.uid)
      
      // Remove the note from local state
      setNotes(prevNotes => prevNotes.filter(n => n.id !== note.id))
      
      // Clear any error states
      setError(null)
    } catch (err) {
      console.error('Error deleting note:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete note')
    } finally {
      setDeletingNoteId(null)
    }
  }

  const filteredNotes = notes.filter(note => 
    searchTerm === '' || 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Notes</h1>
                {user && (
                  <p className="text-sm text-gray-500">
                    {user.isAnonymous ? 'Anonymous Session' : user.email}
                  </p>
                )}
              </div>
            </div>
            <Link href="/editor">
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Note</span>
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Error handling */}
        {(error || enrichmentError) && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">
                  {error ? 'Error loading notes' : 'Error enriching note'}
                </p>
                <p className="text-sm mt-1">{error || enrichmentError}</p>
                
                {error && retryCount > 2 && (
                  <div className="mt-3 text-xs bg-red-200 rounded p-2">
                    <p className="font-medium">Multiple retry attempts failed.</p>
                    <p>This might indicate a Firebase configuration issue:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Check Firebase Console for error logs</li>
                      <li>Verify Anonymous Auth is enabled</li>
                      <li>Check Firestore security rules</li>
                      <li>Ensure proper environment variables</li>
                    </ul>
                  </div>
                )}
                
                <div className="mt-3 space-x-2">
                  {error && (
                    <Button 
                      onClick={fetchNotes} 
                      variant="outline" 
                      size="sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-red-700 mr-2"></div>
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Try Again ({retryCount + 1})
                        </>
                      )}
                    </Button>
                  )}
                  
                  {enrichmentError && (
                    <Button 
                      onClick={clearError} 
                      variant="outline" 
                      size="sm"
                    >
                      Dismiss
                    </Button>
                  )}
                  
                  <Link href="/editor">
                    <Button variant="outline" size="sm">
                      <FileText className="h-3 w-3 mr-2" />
                      Use Editor Anyway
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Loading your notes...</p>
            </div>
          </div>
        ) : filteredNotes.length === 0 && !error ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? `No notes match "${searchTerm}". Try a different search term.`
                : 'Start by creating your first note from a book photo or typing directly.'
              }
            </p>
            {!searchTerm && (
              <Link href="/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Note
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <Link href={`/notes/${note.id}`}>
                  <div className="cursor-pointer">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {note.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {note.excerpt || 'No preview available'}
                    </p>
                  </div>
                </Link>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {note.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3" />
                      <span>{note.tags.length} tags</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/editor?id=${note.id}`)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-2"
                  >
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleEnrichNote(note)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center gap-2"
                    disabled={isEnriching && selectedNoteForEnrichment?.id === note.id}
                  >
                    {isEnriching && selectedNoteForEnrichment?.id === note.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                        Enriching...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Enrich
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteNote(note)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    disabled={deletingNoteId === note.id}
                  >
                    {deletingNoteId === note.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600"></div>
                        Deleting...
                      </>
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {notes.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            {filteredNotes.length} of {notes.length} notes
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Enrichment Dialog */}
      {selectedNoteForEnrichment && lastEnrichmentResult && (
        <NoteEnrichmentDialog
          isOpen={isEnrichmentDialogOpen}
          onClose={() => {
            setIsEnrichmentDialogOpen(false)
            setSelectedNoteForEnrichment(null)
          }}
          note={selectedNoteForEnrichment}
          enrichmentResult={lastEnrichmentResult}
          onApply={handleApplyEnrichment}
          isApplying={isApplyingEnrichment}
        />
      )}
    </div>
  )
}

export default function NotesPage() {
  return (
    <ProtectedRoute allowAnonymous={true} redirectTo="/auth">
      <NotesContent />
    </ProtectedRoute>
  )
} 