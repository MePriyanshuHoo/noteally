import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Note, Tag, Category } from '@/types/note'

// Collection names
const COLLECTIONS = {
  NOTES: 'notes',
  TAGS: 'tags',
  CATEGORIES: 'categories',
  USERS: 'users'
} as const

// Firestore types
export interface FirestoreNote extends Omit<Note, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreTag extends Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreCategory extends Omit<Category, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
  preferences: {
    theme?: 'light' | 'dark'
    language?: string
  }
}

// Helper functions to convert between local and Firestore types
const convertFirestoreNote = (id: string, data: FirestoreNote): Note => ({
  id,
  title: data.title,
  content: data.content,
  excerpt: data.excerpt,
  tags: data.tags,
  categories: data.categories,
  createdAt: data.createdAt.toDate(),
  updatedAt: data.updatedAt.toDate(),
  extractedText: data.extractedText,
  originalImage: data.originalImage,
  ocrConfidence: data.ocrConfidence
})

const convertFirestoreTag = (id: string, data: FirestoreTag): Tag => ({
  id,
  name: data.name,
  color: data.color,
  usageCount: data.usageCount,
  createdAt: data.createdAt.toDate(),
  updatedAt: data.updatedAt.toDate()
})

const convertFirestoreCategory = (id: string, data: FirestoreCategory): Category => ({
  id,
  name: data.name,
  color: data.color,
  usageCount: data.usageCount,
  createdAt: data.createdAt.toDate(),
  updatedAt: data.updatedAt.toDate()
})

export class FirestoreService {
  // Notes operations
  static async createNote(userId: string, noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const notesRef = collection(db, COLLECTIONS.NOTES)
      const firestoreNote: Omit<FirestoreNote, 'createdAt' | 'updatedAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>
        updatedAt: ReturnType<typeof serverTimestamp>
      } = {
        ...noteData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(notesRef, firestoreNote)
      return docRef.id
    } catch (error) {
      console.error('Error creating note:', error)
      throw new Error('Failed to create note')
    }
  }

  static async getNote(noteId: string, userId: string): Promise<Note | null> {
    try {
      const noteRef = doc(db, COLLECTIONS.NOTES, noteId)
      const noteDoc = await getDoc(noteRef)

      if (!noteDoc.exists()) {
        return null
      }

      const data = noteDoc.data() as FirestoreNote
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to note')
      }

      return convertFirestoreNote(noteDoc.id, data)
    } catch (error) {
      console.error('Error getting note:', error)
      throw new Error('Failed to get note')
    }
  }

  static async getNotes(userId: string, limitCount?: number): Promise<Note[]> {
    try {
      const notesRef = collection(db, COLLECTIONS.NOTES)
      let q = query(
        notesRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => 
        convertFirestoreNote(doc.id, doc.data() as FirestoreNote)
      )
    } catch (error) {
      console.error('Error getting notes:', error)
      throw new Error('Failed to get notes')
    }
  }

  static async updateNote(noteId: string, userId: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const noteRef = doc(db, COLLECTIONS.NOTES, noteId)
      
      // Verify ownership first
      const noteDoc = await getDoc(noteRef)
      if (!noteDoc.exists()) {
        throw new Error('Note not found')
      }

      const data = noteDoc.data() as FirestoreNote
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to note')
      }

      await updateDoc(noteRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating note:', error)
      throw new Error('Failed to update note')
    }
  }

  static async deleteNote(noteId: string, userId: string): Promise<void> {
    try {
      const noteRef = doc(db, COLLECTIONS.NOTES, noteId)
      
      // Verify ownership first
      const noteDoc = await getDoc(noteRef)
      if (!noteDoc.exists()) {
        throw new Error('Note not found')
      }

      const data = noteDoc.data() as FirestoreNote
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to note')
      }

      await deleteDoc(noteRef)
    } catch (error) {
      console.error('Error deleting note:', error)
      throw new Error('Failed to delete note')
    }
  }

  static async searchNotes(userId: string, searchTerm: string): Promise<Note[]> {
    try {
      const notesRef = collection(db, COLLECTIONS.NOTES)
      const q = query(
        notesRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const notes = querySnapshot.docs.map(doc => 
        convertFirestoreNote(doc.id, doc.data() as FirestoreNote)
      )

      // Client-side search since Firestore doesn't have full-text search
      const searchTermLower = searchTerm.toLowerCase()
      return notes.filter(note => 
        note.title.toLowerCase().includes(searchTermLower) ||
        note.content.toLowerCase().includes(searchTermLower) ||
        note.extractedText?.toLowerCase().includes(searchTermLower) ||
        note.tags.some((tag: string) => tag.toLowerCase().includes(searchTermLower)) ||
        note.categories.some((category: string) => category.toLowerCase().includes(searchTermLower))
      )
    } catch (error) {
      console.error('Error searching notes:', error)
      throw new Error('Failed to search notes')
    }
  }

  // Tags operations
  static async createTag(userId: string, tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tagsRef = collection(db, COLLECTIONS.TAGS)
      const firestoreTag: Omit<FirestoreTag, 'createdAt' | 'updatedAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>
        updatedAt: ReturnType<typeof serverTimestamp>
      } = {
        ...tagData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(tagsRef, firestoreTag)
      return docRef.id
    } catch (error) {
      console.error('Error creating tag:', error)
      throw new Error('Failed to create tag')
    }
  }

  static async getTags(userId: string): Promise<Tag[]> {
    try {
      const tagsRef = collection(db, COLLECTIONS.TAGS)
      const q = query(
        tagsRef,
        where('userId', '==', userId),
        orderBy('name', 'asc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => 
        convertFirestoreTag(doc.id, doc.data() as FirestoreTag)
      )
    } catch (error) {
      console.error('Error getting tags:', error)
      throw new Error('Failed to get tags')
    }
  }

  static async updateTag(tagId: string, userId: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const tagRef = doc(db, COLLECTIONS.TAGS, tagId)
      
      // Verify ownership
      const tagDoc = await getDoc(tagRef)
      if (!tagDoc.exists()) {
        throw new Error('Tag not found')
      }

      const data = tagDoc.data() as FirestoreTag
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to tag')
      }

      await updateDoc(tagRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      throw new Error('Failed to update tag')
    }
  }

  static async deleteTag(tagId: string, userId: string): Promise<void> {
    try {
      const tagRef = doc(db, COLLECTIONS.TAGS, tagId)
      
      // Verify ownership
      const tagDoc = await getDoc(tagRef)
      if (!tagDoc.exists()) {
        throw new Error('Tag not found')
      }

      const data = tagDoc.data() as FirestoreTag
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to tag')
      }

      await deleteDoc(tagRef)
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw new Error('Failed to delete tag')
    }
  }

  // Categories operations
  static async createCategory(userId: string, categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
      const firestoreCategory: Omit<FirestoreCategory, 'createdAt' | 'updatedAt'> & {
        createdAt: ReturnType<typeof serverTimestamp>
        updatedAt: ReturnType<typeof serverTimestamp>
      } = {
        ...categoryData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(categoriesRef, firestoreCategory)
      return docRef.id
    } catch (error) {
      console.error('Error creating category:', error)
      throw new Error('Failed to create category')
    }
  }

  static async getCategories(userId: string): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
      const q = query(
        categoriesRef,
        where('userId', '==', userId),
        orderBy('name', 'asc')
      )

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => 
        convertFirestoreCategory(doc.id, doc.data() as FirestoreCategory)
      )
    } catch (error) {
      console.error('Error getting categories:', error)
      throw new Error('Failed to get categories')
    }
  }

  static async updateCategory(categoryId: string, userId: string, updates: Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId)
      
      // Verify ownership
      const categoryDoc = await getDoc(categoryRef)
      if (!categoryDoc.exists()) {
        throw new Error('Category not found')
      }

      const data = categoryDoc.data() as FirestoreCategory
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to category')
      }

      await updateDoc(categoryRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating category:', error)
      throw new Error('Failed to update category')
    }
  }

  static async deleteCategory(categoryId: string, userId: string): Promise<void> {
    try {
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, categoryId)
      
      // Verify ownership
      const categoryDoc = await getDoc(categoryRef)
      if (!categoryDoc.exists()) {
        throw new Error('Category not found')
      }

      const data = categoryDoc.data() as FirestoreCategory
      if (data.userId !== userId) {
        throw new Error('Unauthorized access to category')
      }

      await deleteDoc(categoryRef)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw new Error('Failed to delete category')
    }
  }

  // User operations
  static async createOrUpdateUser(userData: Omit<FirestoreUser, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userData.uid)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        // Update existing user
        await updateDoc(userRef, {
          email: userData.email,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          preferences: userData.preferences,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new user
        await updateDoc(userRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error creating/updating user:', error)
      throw new Error('Failed to create/update user')
    }
  }

  static async getUser(userId: string): Promise<FirestoreUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return null
      }

      return userDoc.data() as FirestoreUser
    } catch (error) {
      console.error('Error getting user:', error)
      throw new Error('Failed to get user')
    }
  }

  // Real-time listeners
  static subscribeToNotes(userId: string, callback: (notes: Note[]) => void): () => void {
    const notesRef = collection(db, COLLECTIONS.NOTES)
    const q = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const notes = querySnapshot.docs.map(doc => 
        convertFirestoreNote(doc.id, doc.data() as FirestoreNote)
      )
      callback(notes)
    }, (error) => {
      console.error('Error in notes subscription:', error)
    })
  }

  static subscribeToTags(userId: string, callback: (tags: Tag[]) => void): () => void {
    const tagsRef = collection(db, COLLECTIONS.TAGS)
    const q = query(
      tagsRef,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const tags = querySnapshot.docs.map(doc => 
        convertFirestoreTag(doc.id, doc.data() as FirestoreTag)
      )
      callback(tags)
    }, (error) => {
      console.error('Error in tags subscription:', error)
    })
  }

  static subscribeToCategories(userId: string, callback: (categories: Category[]) => void): () => void {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES)
    const q = query(
      categoriesRef,
      where('userId', '==', userId),
      orderBy('name', 'asc')
    )

    return onSnapshot(q, (querySnapshot) => {
      const categories = querySnapshot.docs.map(doc => 
        convertFirestoreCategory(doc.id, doc.data() as FirestoreCategory)
      )
      callback(categories)
    }, (error) => {
      console.error('Error in categories subscription:', error)
    })
  }
} 