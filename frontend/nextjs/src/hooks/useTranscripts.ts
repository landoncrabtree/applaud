import { create } from 'zustand'

export interface Transcript {
    id: string;
    name: string;
    description: string;
    createdAt?: string;
  } 

interface TranscriptsStore {
  transcripts: Transcript[]
  loading: boolean
  error: string | null
  refreshTranscripts: () => Promise<void>
}

export const useTranscriptsStore = create<TranscriptsStore>((set) => ({
  transcripts: [],
  loading: false,
  error: null,
  refreshTranscripts: async () => {
    set({ loading: true })
    try {
      const response = await fetch('http://localhost:8080/api/v1/transcript/all')
      if (!response.ok) throw new Error('Failed to fetch transcripts')
      const data = await response.json()
      set({ transcripts: data, error: null })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch transcripts' })
    } finally {
      set({ loading: false })
    }
  }
}))

// Legacy hook can use the store internally
export function useTranscripts() {
  const store = useTranscriptsStore()
  return {
    transcripts: store.transcripts,
    loading: store.loading,
    error: store.error
  }
} 