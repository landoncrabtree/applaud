'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useTranscripts } from '@/hooks/useTranscripts'
import { TranscriptView } from './TranscriptView'
import { useState } from 'react'

interface TranscriptListProps {
  onSelect: (id: string) => void;
}

export function TranscriptList({ onSelect }: TranscriptListProps) {
  const { transcripts, loading, error } = useTranscripts()

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading transcripts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-semibold">{error}</p>
        <p className="mt-2 text-sm text-red-400">Please try again later</p>
      </div>
    )
  }

  if (transcripts.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No transcripts found
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Upload a file to get started
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {transcripts.map((transcript) => (
        <div key={transcript.id} onClick={() => onSelect(transcript.id)}>
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardHeader className="bg-white dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {transcript.name}
                  </h3>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {transcript.description}
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
} 