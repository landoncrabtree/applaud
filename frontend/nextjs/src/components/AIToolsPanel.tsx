'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DocumentTextIcon, 
  DocumentDuplicateIcon, 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Input } from './ui/input'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Flashcard } from './Flashcard'
import { MarkdownRenderer } from './MarkdownRenderer'
import { Loader2 } from "lucide-react"
import { defaultQuestions } from '@/stores/settings'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface AIToolsPanelProps {
  transcriptId: string;
}

export function AIToolsPanel({ transcriptId }: AIToolsPanelProps) {
  const [customQuestion, setCustomQuestion] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [showDefaultQuestions, setShowDefaultQuestions] = useState(true)
  const [randomQuestions] = useState(() => getRandomQuestions(defaultQuestions, 5))

  const handleSummarize = async () => {
    setLoading('summarize')
    try {
      const response = await fetch(`http://localhost:8080/api/v1/summarize/${transcriptId}`)
      if (!response.ok) throw new Error('Failed to summarize')
      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error('Error summarizing:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleFlashcards = async () => {
    setLoading('flashcards')
    try {
      const response = await fetch(`http://localhost:8080/api/v1/summarize/flashcards/${transcriptId}`)
      if (!response.ok) throw new Error('Failed to generate flashcards')
      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error('Error generating flashcards:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleQuestions = async () => {
    setLoading('questions')
    try {
      const response = await fetch(`http://localhost:8080/api/v1/summarize/questions/${transcriptId}`)
      if (!response.ok) throw new Error('Failed to generate questions')
      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error('Error generating questions:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleAskQuestion = async () => {
    if (!customQuestion.trim()) return
    setLoading('ask')
    try {
      const response = await fetch(`http://localhost:8080/api/v1/summarize/question/${transcriptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: customQuestion })
      })
      if (!response.ok) throw new Error('Failed to get answer')
      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error('Error asking question:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleRegenerate = async (type: 'summary' | 'flashcards' | 'questions' | 'answer') => {
    setLoading(type)
    try {
      let url
      let method = 'GET'
      let body = null

      switch (type) {
        case 'summary':
          url = `http://localhost:8080/api/v1/summarize/${transcriptId}?regenerate=true`
          break
        case 'flashcards':
          url = `http://localhost:8080/api/v1/summarize/flashcards/${transcriptId}?regenerate=true`
          break
        case 'questions':
          url = `http://localhost:8080/api/v1/summarize/questions/${transcriptId}?regenerate=true`
          break
        case 'answer':
          url = `http://localhost:8080/api/v1/summarize/question/${transcriptId}?regenerate=true`
          method = 'POST'
          body = JSON.stringify({ question: customQuestion })
          break
      }

      const response = await fetch(url, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
        body
      })
      if (!response.ok) throw new Error(`Failed to regenerate ${type}`)
      const data = await response.json()
      setResult(data.content)
    } catch (error) {
      console.error(`Error regenerating ${type}:`, error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleSummarize}
                    disabled={loading === 'summarize'}
                  >
                    <DocumentTextIcon className="h-5 w-5" />
                    <span>Summarize</span>
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Provide a detailed summary of the audio recording.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleFlashcards}
                    disabled={loading === 'flashcards'}
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                    <span>Flashcards</span>
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate study flashcards of the audio recording. Useful for lecture recordings.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={handleQuestions}
                    disabled={loading === 'questions'}
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5" />
                    <span>Follow Up Questions</span>
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate follow up questions regarding the content of the audio recording. Useful for work meetings.</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="flex-1">
                      <Input
                        placeholder="Ask a question..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                        className="w-full"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-[300px] overflow-y-auto">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Suggested Questions
                      </p>
                      {randomQuestions.map((question, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start text-left text-sm text-wrap whitespace-normal h-auto py-2"
                          onClick={() => {
                            setCustomQuestion(question)
                          }}
                        >
                          {question}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  onClick={handleAskQuestion}
                  disabled={loading === 'ask' || !customQuestion.trim()}
                >
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                      <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ask a custom question about the content.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className="bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            {result.summary && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="flex justify-between items-center mb-2">
                  <h3>Summary</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate('summary')}
                    disabled={loading === 'summary'}
                  >
                    {loading === 'summary' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                {loading === 'summary' ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <MarkdownRenderer content={result.summary} />
                )}
              </div>
            )}
            {result.flashcards && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Flashcards</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate('flashcards')}
                    disabled={loading === 'flashcards'}
                  >
                    {loading === 'flashcards' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                {loading === 'flashcards' ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Flashcard cards={result.flashcards} />
                )}
              </div>
            )}
            {result.questions && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Follow-up Questions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate('questions')}
                    disabled={loading === 'questions'}
                  >
                    {loading === 'questions' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                {loading === 'questions' ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    {result.questions.map((q: string, index: number) => (
                      <li key={index}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {result.answer && (
              <div className="prose dark:prose-invert max-w-none">
                <div className="flex justify-between items-center mb-2">
                  <h3>Answer</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate('answer')}
                    disabled={loading === 'ask'}
                  >
                    {loading === 'answer' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Regenerate
                  </Button>
                </div>
                {loading === 'answer' ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <MarkdownRenderer content={result.answer} />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getRandomQuestions(questions: string[], count: number) {
  const shuffled = [...questions].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
} 