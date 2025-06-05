'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from "framer-motion"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Camera, BookOpen, Search, Zap, Users, FileText, Brain, Shield } from 'lucide-react'
import Link from "next/link"

// Dynamically import Aurora Background to avoid SSR issues
const AuroraBackground = dynamic(
  () => import('@/components/ui/aurora-background').then((mod) => ({ default: mod.AuroraBackground })),
  { ssr: false }
)

function HomeContent() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Hero Section with Aurora Background */}
      <div className="relative">
        {mounted && (
          <AuroraBackground>
            <motion.div
              initial={{ opacity: 0.0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="relative flex flex-col gap-4 items-center justify-center px-4 text-center"
            >
              <div className="text-4xl md:text-7xl font-bold dark:text-white text-center">
                Transform Books into
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}Digital Notes
                </span>
              </div>
              <div className="font-light text-lg md:text-2xl dark:text-neutral-200 py-4 max-w-3xl">
                AI-powered OCR technology that converts your book photos into searchable, 
                editable notes. Perfect for students, researchers, and avid readers.
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2">
                  Watch Demo
                </Button>
              </div>
            </motion.div>
          </AuroraBackground>
        )}
        
        {/* Fallback for SSR */}
        {!mounted && (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="relative flex flex-col gap-4 items-center justify-center px-4 text-center">
              <div className="text-4xl md:text-7xl font-bold text-gray-900 text-center">
                Transform Books into
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  {" "}Digital Notes
                </span>
              </div>
              <div className="font-light text-lg md:text-2xl text-gray-600 py-4 max-w-3xl">
                AI-powered OCR technology that converts your book photos into searchable, 
                editable notes. Perfect for students, researchers, and avid readers.
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/auth">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                    Get Started Free
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-2">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Use Cases Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect for Every Reader
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Whether you&apos;re studying, researching, or just love reading, Noteally adapts to your workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Students */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Students</h3>
              <p className="text-gray-600 mb-4">
                Digitize textbook passages, create study guides, and organize notes by subject for efficient exam preparation.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Quick textbook digitization</li>
                <li>• Subject-based organization</li>
                <li>• Searchable study materials</li>
              </ul>
            </motion.div>

            {/* Researchers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Researchers</h3>
              <p className="text-gray-600 mb-4">
                Extract quotes and references from multiple sources, maintain citation links, and build comprehensive research databases.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Multi-source extraction</li>
                <li>• Citation management</li>
                <li>• Cross-reference search</li>
              </ul>
            </motion.div>

            {/* Professionals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professionals</h3>
              <p className="text-gray-600 mb-4">
                Capture insights from industry publications, create knowledge bases, and share findings with teams.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Industry insights capture</li>
                <li>• Team knowledge sharing</li>
                <li>• Professional development</li>
              </ul>
            </motion.div>

            {/* Book Lovers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Book Lovers</h3>
              <p className="text-gray-600 mb-4">
                Save favorite quotes, track reading insights, and build a personal library of memorable passages.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Quote collections</li>
                <li>• Reading insights</li>
                <li>• Personal libraries</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple. Fast. Accurate.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three steps to transform any book page into searchable digital notes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Capture</h3>
              <p className="text-gray-600">
                Take a photo of any book page using your camera or upload an existing image. Our system handles various lighting conditions and angles.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Extract</h3>
              <p className="text-gray-600">
                Our AI-powered OCR technology extracts text with 90%+ accuracy, maintaining formatting and structure automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Organize</h3>
              <p className="text-gray-600">
                Edit, tag, and organize your notes. Use powerful search to find any content instantly across your entire digital library.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to digitize, organize, and manage your reading notes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Camera className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Camera</h3>
              <p className="text-gray-600 text-sm">Instant photo capture with immediate OCR processing</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Brain className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered OCR</h3>
              <p className="text-gray-600 text-sm">90%+ accuracy with advanced text recognition</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Search className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart Search</h3>
              <p className="text-gray-600 text-sm">Find any content across all your notes instantly</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <FileText className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Rich Editor</h3>
              <p className="text-gray-600 text-sm">Full-featured text editor with formatting options</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Users className="h-8 w-8 text-pink-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Organization</h3>
              <p className="text-gray-600 text-sm">Tags, categories, and smart filtering</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <Shield className="h-8 w-8 text-indigo-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Cloud Sync</h3>
              <p className="text-gray-600 text-sm">Access your notes from any device, anywhere</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Reading?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students, researchers, and book lovers who&apos;ve revolutionized their note-taking workflow
            </p>
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Start Free Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Redirect authenticated users to /notes
    if (user && !loading) {
      router.push('/notes')
    }
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, they'll be redirected, so show nothing
  if (user) {
    return null
  }

  // Show landing page for non-authenticated users
  return <HomeContent />
}
