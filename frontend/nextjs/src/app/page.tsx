'use client'

import { useEffect, useState } from 'react'
import { SettingsModal } from '@/components/SettingsModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { getSettings } from '@/stores/settings'
import { TranscriptList } from '@/components/TranscriptList'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    const settings = getSettings()
    if (!settings.provider || !settings.model) {
      setIsSettingsOpen(true)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Transcripts
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage and analyze your transcribed content
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-lg p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 transition-colors"
            >
              <Cog6ToothIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          <TranscriptList />
        </div>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
    </main>
  )
}
