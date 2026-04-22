"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

// Dot patterns for each die face
const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
}

function Die({ value, isRolling }: { value: number; isRolling: boolean }) {
  const dots = DOT_PATTERNS[value] || DOT_PATTERNS[1]

  return (
    <div
      className={`
        relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl shadow-lg
        flex items-center justify-center
        ${isRolling ? "animate-dice-roll" : ""}
      `}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {dots.map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="12"
            fill="#1a1a1a"
          />
        ))}
      </svg>
    </div>
  )
}

export function DiceRoll() {
  const [diceCount, setDiceCount] = useState(2)
  const [values, setValues] = useState<number[]>([1, 1])
  const [isRolling, setIsRolling] = useState(false)
  const [rollCount, setRollCount] = useState(0)

  const rollDice = () => {
    if (isRolling) return

    setIsRolling(true)

    // Animate through random values
    let iterations = 0
    const maxIterations = 15
    const interval = setInterval(() => {
      setValues(
        Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      )
      iterations++

      if (iterations >= maxIterations) {
        clearInterval(interval)
        setIsRolling(false)
        setRollCount((prev) => prev + 1)
      }
    }, 100)
  }

  const changeDiceCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(6, diceCount + delta))
    setDiceCount(newCount)
    setValues(Array.from({ length: newCount }, () => 1))
  }

  const total = values.reduce((sum, v) => sum + v, 0)

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Dice Count Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/70">Aantal dobbelstenen:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => changeDiceCount(-1)}
            disabled={diceCount <= 1 || isRolling}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-bold text-lg">{diceCount}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => changeDiceCount(1)}
            disabled={diceCount >= 6 || isRolling}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dice Display */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-green-800 to-green-900 rounded-2xl border-4 border-green-700 shadow-xl min-h-[120px]">
        {values.map((value, index) => (
          <Die key={index} value={value} isRolling={isRolling} />
        ))}
      </div>

      {/* Total */}
      {rollCount > 0 && !isRolling && (
        <div className="text-center">
          <p className="text-sm text-white/70 mb-1">Totaal:</p>
          <p className="text-4xl font-bold text-white">{total}</p>
        </div>
      )}

      {/* Stats */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Aantal worpen: <span className="font-semibold">{rollCount}</span>
        </p>
      </div>

      {/* Roll Button */}
      <Button
        onClick={rollDice}
        disabled={isRolling}
        size="lg"
        className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
      >
        {isRolling ? "Rolt..." : "Gooi! 🎲"}
      </Button>

      <style jsx>{`
        @keyframes dice-roll {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-15deg) scale(1.1);
          }
          50% {
            transform: rotate(15deg) scale(0.9);
          }
          75% {
            transform: rotate(-10deg) scale(1.05);
          }
        }

        :global(.animate-dice-roll) {
          animation: dice-roll 0.15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
