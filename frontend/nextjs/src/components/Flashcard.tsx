'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface FlashcardProps {
  cards: { front: string; back: string }[];
}

export function Flashcard({ cards }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const handleNext = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev + 1) % cards.length)
  }

  const handlePrevious = () => {
    setIsFlipped(false)
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
  }

  return (
    <div className="space-y-4">
      <div className="relative h-64 perspective-1000">
        <div
          className={`w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <Card className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 flex items-center justify-center p-6">
            <p className="text-lg font-medium text-center">
              {cards[currentIndex].front}
            </p>
          </Card>

          {/* Back */}
          <Card className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 flex items-center justify-center p-6 rotate-y-180">
            <p className="text-lg text-center">
              {cards[currentIndex].back}
            </p>
          </Card>
        </div>
      </div>

      <div className="flex justify-center items-center space-x-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={cards.length <= 1}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {cards.length}
        </div>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={cards.length <= 1}
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
} 