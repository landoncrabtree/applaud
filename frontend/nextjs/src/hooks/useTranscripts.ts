import { useState, useEffect } from 'react'

export interface Transcript {
    id: string;
    name: string;
    description: string;
    createdAt?: string;
  } 

export function useTranscripts() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTranscripts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/transcript/all')
        if (!response.ok) throw new Error('Failed to fetch transcripts')
        const data = await response.json()
        setTranscripts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transcripts')
      } finally {
        setLoading(false)
      }
    }

    fetchTranscripts()
  }, [])

  return { transcripts, loading, error }
} 