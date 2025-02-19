import { useState, useEffect } from 'react'

export interface Speaker {
  speaker: string;
  timestamp: [number, number];
  text: string;
}

interface TranscriptData {
  transcript: {
    speakers: Speaker[];
    text: string;
  };
  name: string;
  description: string;
}

export function useTranscript(id: string) {
  const [data, setData] = useState<TranscriptData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTranscript = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/transcript/transcription/${id}`)
      if (!response.ok) throw new Error('Failed to fetch transcript')
      const data = await response.json()
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transcript')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTranscript()
  }, [id])

  return { data, loading, error, refresh: fetchTranscript }
} 