'use client'

import { useState, useEffect } from 'react'
import { useTranscriptsStore } from '@/hooks/useTranscripts'
import { ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  defaultOpen?: boolean;
}

export function Sidebar({ selectedId, onSelect, defaultOpen = true }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { transcripts, refreshTranscripts } = useTranscriptsStore()

  // Initial load
  useEffect(() => {
    refreshTranscripts()
  }, [refreshTranscripts])

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      isOpen ? "w-80" : "w-16"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </Button>

      <div className="p-4">
        {isOpen && <h2 className="font-semibold mb-4">Transcripts</h2>}
        <div className="space-y-2">
          {transcripts.length === 0 ? (
            <div className="animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded" />
              ))}
            </div>
          ) : (
            transcripts.map((transcript) => (
              <div
                key={transcript.id}
                onClick={() => onSelect(transcript.id)}
                className={cn(
                  "rounded-lg cursor-pointer transition-colors",
                  selectedId === transcript.id 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700",
                  isOpen ? "p-3" : "p-2"
                )}
              >
                {isOpen ? (
                  <div>
                    <div className="font-medium truncate">{transcript.name}</div>
                    <div className={cn(
                      "text-xs truncate mt-1",
                      selectedId === transcript.id
                        ? "text-primary-foreground/80"
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {transcript.description || 'No description'}
                    </div>
                  </div>
                ) : (
                  <DocumentTextIcon className="h-5 w-5" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 