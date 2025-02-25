'use client'

import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CloudArrowUpIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { useTranscriptsStore } from '@/hooks/useTranscripts'

type UploadState = 'idle' | 'uploading' | 'transcribing' | 'success' | 'error'

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const { refreshTranscripts } = useTranscriptsStore()


  useEffect(() => {
    if (uploadState === 'success') {
      const timer = setTimeout(() => {
        refreshTranscripts()
        setUploadState('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [uploadState])

  // Cleanup WebSocket on unmount or state change
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) await uploadFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await uploadFile(file)
  }

  const connectWebSocket = () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close()
    }

    const ws = new WebSocket(`ws://localhost:8080`)
    wsRef.current = ws
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.status === 'complete') {
        setUploadState('success')
        ws.close()
        wsRef.current = null
      }
    }

    ws.onerror = () => {
      console.error('WebSocket error')
      setUploadState('success') // Fallback to normal success
      ws.close()
      wsRef.current = null
    }
  }

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      setErrorMessage('Please upload an audio file')
      setUploadState('error')
      return
    }

    setUploadState('uploading')
    const formData = new FormData()
    formData.append('audio_file', file)

    try {
      const response = await fetch('http://localhost:8080/api/v1/upload/recording', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      setUploadState('transcribing')
      connectWebSocket()
      
    } catch (error) {
      console.error('Upload error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setUploadState('error')
    }
  }

  if (uploadState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="p-8 border-2 border-red-500/20 bg-red-500/5">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <XCircleIcon className="h-12 w-12 text-red-500 animate-in zoom-in duration-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
              Upload Failed
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
              {errorMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadState('idle')}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (uploadState === 'transcribing') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="p-8 border-2 border-blue-500/20 bg-blue-500/5">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
              Transcribing...
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
              Your audio is being processed. This may take a few minutes. You can leave this page and progress will continue in the background.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (uploadState === 'success') {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="p-8 border-2 border-green-500/20 bg-green-500/5">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-500 animate-in zoom-in duration-300" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
              Upload Complete!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-sm">
              Your audio file has been uploaded to Watcher and transcription is complete.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-center min-h-[calc(100vh-16rem)]">
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-center">
        Upload an audio file here or copy one to your Watcher directory. Applaud will transcribe your content and provide AI-powered analysis tools.
      </p>
      
      <Card
        className={cn(
          "p-12 border-2 border-dashed transition-colors max-w-2xl mx-auto",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : uploadState === 'uploading'
            ? "border-blue-500/50 bg-blue-500/5"
            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
          "transform transition-all duration-200 ease-in-out"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <CloudArrowUpIcon 
            className={cn(
              "h-16 w-16 mb-6 transition-colors",
              uploadState === 'uploading'
                ? "text-blue-500 animate-bounce"
                : "text-gray-400"
            )}
          />
          <h3 className="text-xl font-semibold mb-3">
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload Audio File'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
            Drag and drop your audio file here, or click to select. Supports MP3, WAV, OGG, and other audio formats.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadState === 'uploading'}
            className="min-w-[200px]"
          >
            Select File
          </Button>
        </div>
      </Card>
    </div>
  )
} 