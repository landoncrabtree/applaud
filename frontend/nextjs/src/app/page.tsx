'use client'

import { useEffect, useState } from 'react'
import { SettingsModal } from '@/components/SettingsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { getSettings } from '@/stores/settings'
import { TranscriptList } from '@/components/TranscriptList'
import { FileUpload } from '@/components/FileUpload'
import { TranscriptView } from '@/components/TranscriptView'
import { Sidebar } from '@/components/Sidebar'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null)

  useEffect(() => {
    const settings = getSettings()
    if (!settings.provider || !settings.model) {
      setIsSettingsOpen(true)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1a1b26]">
      <Sidebar 
        selectedId={selectedTranscriptId}
        onSelect={setSelectedTranscriptId}
        defaultOpen={!selectedTranscriptId}
      />
      
      <main className="flex-1 ml-[320px] transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Applaud
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage and analyze your transcribed content
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-lg p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Show FileUpload only when no transcript is selected */}
          {!selectedTranscriptId && (
            <div className="mb-8">
              <FileUpload />
            </div>
          )}

          {/* Content */}
          {selectedTranscriptId && (
            <TranscriptView 
              id={selectedTranscriptId} 
              onBack={() => setSelectedTranscriptId(null)} 
            />
          )}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  )
}
