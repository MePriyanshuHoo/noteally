'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreService } from '@/services/firestoreService'
import { Note } from '@/types/note'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  FileText, 
  Edit3, 
  Calendar, 
  Tag, 
  FolderOpen, 
  ArrowLeft, 
  AlertCircle,
  Clock,
  Target,
  Sparkles 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ProtectedRoute from '@/components/ProtectedRoute'

function NoteDetailContent() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const noteId = Array.isArray(params.id) ? params.id[0] : params.id

  const fetchNote = useCallback(async () => {
    if (!noteId || !user?.uid) {
      setError('Missing note ID or user authentication')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const fetchedNote = await FirestoreService.getNote(noteId, user.uid)
      if (fetchedNote) {
        setNote(fetchedNote)
      } else {
        setError('Note not found')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch note'
      console.error('Error fetching note:', err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [noteId, user?.uid])

  useEffect(() => {
    if (noteId && user?.uid && isAuthenticated) {
      fetchNote()
    }
  }, [noteId, user?.uid, isAuthenticated, fetchNote])

  const handleEditNote = () => {
    if (note) {
      router.push(`/editor?id=${note.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/notes">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Notes
                </Button>
              </Link>
            </div>
            
            <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Error loading note</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link href="/notes">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Notes
                </Button>
              </Link>
            </div>
            
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Note not found</h3>
              <p className="text-gray-600">The requested note could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with navigation and edit button */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/notes">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Notes
              </Button>
            </Link>
            
            <Button onClick={handleEditNote} className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit Note
            </Button>
          </div>

          {/* Note content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Note header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {note.title}
                  </h1>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                    </div>

                    {note.ocrConfidence && (
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>OCR Confidence: {Math.round(note.ocrConfidence * 100)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tags and Categories */}
            {(note.tags.length > 0 || note.categories.length > 0) && (
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {note.categories.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen className="h-4 w-4 text-gray-600" />
                        <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {note.categories.map((category) => (
                          <Badge key={category} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Excerpt/Summary */}
            {note.excerpt && (
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-gray-700">Summary</h3>
                </div>
                <p className="text-sm text-gray-600 italic">
                  {note.excerpt}
                </p>
              </div>
            )}

            {/* Note content */}
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Content</h3>
              <div className="prose max-w-none text-gray-900">
                {note.content ? (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {note.content}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No content available</p>
                )}
              </div>
            </div>

            {/* Extracted text (if available from OCR) */}
            {note.extractedText && note.extractedText !== note.content && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Original Extracted Text</h3>
                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {note.extractedText}
                </div>
              </div>
            )}
          </div>

          {/* Action buttons at bottom */}
          <div className="mt-6 flex items-center justify-center">
            <Button onClick={handleEditNote} size="lg" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Edit This Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NoteDetailPage() {
  return (
    <ProtectedRoute allowAnonymous={true} redirectTo="/auth">
      <NoteDetailContent />
    </ProtectedRoute>
  )
} 