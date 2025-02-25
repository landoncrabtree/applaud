'use client'

import { useTranscript } from '@/hooks/useTranscript'
import type { Speaker } from '@/hooks/useTranscript'
import { ChevronLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useRef, useState, useEffect } from 'react'
import { AIToolsPanel } from './AIToolsPanel'

interface TranscriptViewProps {
  id: string;
  onBack: () => void;
}

export function TranscriptView({ id, onBack }: TranscriptViewProps) {
  const { data, loading, error, refresh } = useTranscript(id)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null)
  const [newSpeakerName, setNewSpeakerName] = useState('')

  useEffect(() => {
    if (data) {
      setName(data.name || '')
      setDescription(data.description || '')
    }
  }, [data])

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleUpdateName = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/transcript/transcription/${id}/name`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!response.ok) throw new Error('Failed to update name')
      await refresh()
      setIsEditingName(false)
    } catch (error) {
      console.error('Error updating name:', error)
    }
  }

  const handleUpdateDescription = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/transcript/transcription/${id}/description`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })
      if (!response.ok) throw new Error('Failed to update description')
      await refresh()
      setIsEditingDescription(false)
    } catch (error) {
      console.error('Error updating description:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/transcript/transcription/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete transcript')
      onBack()
    } catch (error) {
      console.error('Error deleting transcript:', error)
    }
  }

  const handleUpdateSpeaker = async (oldSpeaker: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/transcript/transcription/${id}/speakers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldSpeaker,
          newSpeaker: newSpeakerName
        })
      })
      if (!response.ok) throw new Error('Failed to update speaker')
      await refresh()
      setEditingSpeaker(null)
      setNewSpeakerName('')
    } catch (error) {
      console.error('Error updating speaker:', error)
    }
  }

  function groupConsecutiveSpeakers(speakers: Speaker[]) {
    return speakers.reduce<{
      speaker: string;
      texts: { text: string; timestamp: [number, number] }[];
    }[]>((acc, curr) => {
      const lastGroup = acc[acc.length - 1];
      
      if (lastGroup && lastGroup.speaker === curr.speaker) {
        lastGroup.texts.push({
          text: curr.text,
          timestamp: curr.timestamp
        });
      } else {
        acc.push({
          speaker: curr.speaker,
          texts: [{
            text: curr.text,
            timestamp: curr.timestamp
          }]
        });
      }
      
      return acc;
    }, []);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Button>
        <Button
          variant="ghost"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Title, Description and Audio */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                  placeholder="Enter name..."
                />
                <Button onClick={handleUpdateName}>Save</Button>
                <Button variant="ghost" onClick={() => setIsEditingName(false)}>Cancel</Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-semibold">{data.name || 'Untitled Transcript'}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setName(data.name || 'Untitled Transcript')
                    setIsEditingName(true)
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button onClick={handleUpdateDescription}>Save</Button>
                  <Button variant="ghost" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <p className="text-gray-600 dark:text-gray-300">
                  {data.description || 'No description'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDescription(data.description || '')
                    setIsEditingDescription(true)
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Audio */}
          <div className="pt-2">
            <audio
              ref={audioRef}
              src={`http://localhost:8080/api/v1/transcript/transcription/${id}/audio`}
              onEnded={() => setIsPlaying(false)}
              controls
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Tools */}
      <AIToolsPanel transcriptId={id} />

      {/* Transcript */}
      <div className="space-y-4">
        {groupConsecutiveSpeakers(data.transcript.speakers).map((group, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="min-w-[100px]">
                  {editingSpeaker === group.speaker ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newSpeakerName}
                        onChange={(e) => setNewSpeakerName(e.target.value)}
                        className="w-full"
                        placeholder="New name"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdateSpeaker(group.speaker)}
                        disabled={!newSpeakerName || newSpeakerName === group.speaker}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingSpeaker(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingSpeaker(group.speaker);
                        setNewSpeakerName(group.speaker);
                      }}
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded font-medium"
                    >
                      <span>{group.speaker}</span>
                      <PencilIcon className="h-3 w-3 ml-2 opacity-50" />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  {group.texts.map((item, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <p className="text-gray-900 dark:text-white">
                        {item.text}
                      </p>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {Math.floor(item.timestamp[0])}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transcript</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transcript? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 