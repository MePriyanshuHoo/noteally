'use client'

import { useState } from 'react'
import { 
  Upload, 
  Camera, 
  Home, 
  FileText, 
  Image as ImageIcon
} from 'lucide-react'
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/ImageUpload'
import CameraComponent from '@/components/ui/camera/camera'
import { runFlow } from '@genkit-ai/next/client'
import { ocrFlow } from '@/genkit/ocrFlow'
import Link from 'next/link'

interface EditorDockProps {
  onImageSelect?: (file: File) => void
  onTextExtracted?: (text: string, confidence?: number) => void
  isLoading?: boolean
  extractedText?: string
  onCapturedImages?: (images: string[]) => void
}

export default function EditorDock({ 
  onImageSelect, 
  onTextExtracted, 
  isLoading,
  extractedText,
  onCapturedImages
}: EditorDockProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [capturedImages, setCapturedImages] = useState<string[]>([])

  const handleImageSelect = (file: File) => {
    if (onImageSelect) {
      onImageSelect(file)
    }
  }

  const handleTextExtracted = (text: string, confidence?: number) => {
    if (onTextExtracted) {
      onTextExtracted(text, confidence)
    }
    // Close upload modal after successful extraction
    setIsUploadOpen(false)
  }

  const handleCameraCapture = (images: string[]) => {
    console.log('Camera captured images (direct save):', images.length);
    // Direct save without OCR prompt dialog
    if (onCapturedImages) {
      onCapturedImages(images);
    }
    setIsCameraOpen(false);
  }

  const handleOcrProcess = async (images: string[], prompt?: string) => {
    console.log('Processing OCR with prompt:', prompt, 'Images:', images.length);
    
    if (images.length === 0) {
      alert('No images to process');
      return;
    }

    try {
      // Process the first captured image
      const imageData = images[0];
      const base64 = imageData.split(',')[1];
      
      if (!base64) {
        throw new Error('Invalid image data format');
      }

      console.log('Making OCR API call...');
      const result = await runFlow<typeof ocrFlow>({
        url: '/api/ocr',
        input: { 
          imageData: base64,
          prompt: prompt || 'This is a camera capture of a book page. Please extract all text accurately, maintaining structure and formatting.' 
        },
      });

      console.log('OCR result:', result);

      if (!result?.extractedText) {
        throw new Error('No text extracted from image');
      }

      // Notify parent component
      if (onTextExtracted) {
        onTextExtracted(result.extractedText, result.confidence);
      }

      // Convert to File object for consistency with existing flow
      fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          handleImageSelect(file);
        });

      console.log('OCR processing completed successfully');

    } catch (error) {
      console.error('OCR processing failed:', error);
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`OCR processing failed: ${errorMessage}\n\nPlease try again or check the console for more details.`);
      
    }
  }

  const dockItems = [
    {
      title: 'Home',
      icon: <Home className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: '/',
    },
    {
      title: 'Notes',
      icon: <FileText className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      href: '/notes',
    },
    {
      title: 'Upload Image',
      icon: <Upload className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      action: () => setIsUploadOpen(true),
    },
    {
      title: 'Camera',
      icon: <Camera className="h-full w-full text-neutral-600 dark:text-neutral-300" />,
      action: () => setIsCameraOpen(true),
    },
  ]

  return (
    <>
      {/* Dock positioned at the bottom */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Dock className="items-end pb-3">
          {dockItems.map((item, idx) => (
            <DockItem
              key={idx}
              className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 cursor-pointer"
            >
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                {item.href ? (
                  <Link href={item.href} className="w-full h-full flex items-center justify-center">
                    {item.icon}
                  </Link>
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    onClick={item.action}
                  >
                    {item.icon}
                  </div>
                )}
              </DockIcon>
            </DockItem>
          ))}
        </Dock>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Upload & Extract Text
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <ImageUpload 
              onImageSelect={handleImageSelect}
              onTextExtracted={handleTextExtracted}
            />
            
            {isLoading && (
              <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-blue-700">Processing image...</span>
              </div>
            )}

            {/* Extracted Text Preview */}
            {extractedText && (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔍 Extracted Text
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono">{extractedText}</pre>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  This text has been automatically added to your editor.
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <Dialog open={isCameraOpen} onOpenChange={(open) => {
        setIsCameraOpen(open);
        // Don't clear captured images here - only clear when user cancels or completes OCR
      }}>
        <DialogContent className="h-svh w-svw max-w-full p-0">
          <CameraComponent
            onClosed={() => {
              setIsCameraOpen(false);
              // Only clear if user manually closes without capturing
              if (capturedImages.length === 0) {
                setCapturedImages([]);
              }
            }}
            onCapturedImages={handleCameraCapture}
            onOcrProcess={handleOcrProcess}
          />
        </DialogContent>
      </Dialog>
    </>
  )
} 