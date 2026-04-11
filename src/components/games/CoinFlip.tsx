"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

type CoinSide = "TableTech" | "TechTable"

export function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false)
  const [result, setResult] = useState<CoinSide | null>(null)
  const [flipCount, setFlipCount] = useState(0)

  const flipCoin = () => {
    if (isFlipping) return

    setIsFlipping(true)

    // Random result (50/50)
    const randomResult: CoinSide = Math.random() < 0.5 ? "TableTech" : "TechTable"

    // Set result after animation completes (2 seconds)
    setTimeout(() => {
      setResult(randomResult)
      setIsFlipping(false)
      setFlipCount(prev => prev + 1)
    }, 2000)
  }

  const reset = () => {
    setResult(null)
    setFlipCount(0)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      {/* Coin Container */}
      <div className="perspective-container">
        <div
          className={`coin ${isFlipping ? "flipping" : ""} ${
            result === "TechTable" ? "show-tech-table" : ""
          }`}
        >
          {/* TableTech Side (Yellow/Gold) */}
          <div className="coin-face coin-table-tech">
            <div className="coin-content">
              <span className="text-2xl font-bold">TableTech</span>
            </div>
          </div>

          {/* TechTable Side (Purple) */}
          <div className="coin-face coin-tech-table">
            <div className="coin-content">
              <span className="text-2xl font-bold">TechTable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && !isFlipping && (
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Result:</p>
          <p
            className={`text-3xl font-bold ${
              result === "TableTech"
                ? "text-yellow-500"
                : "text-purple-500"
            }`}
          >
            {result}
          </p>
        </div>
      )}

      {/* Flip Counter */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Flips: <span className="font-semibold">{flipCount}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          onClick={flipCoin}
          disabled={isFlipping}
          size="lg"
        >
          {isFlipping ? "Flipping..." : "Flip Coin"}
        </Button>

        {flipCount > 0 && (
          <Button
            onClick={reset}
            variant="outline"
            size="lg"
            disabled={isFlipping}
          >
            Reset
          </Button>
        )}
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1000px;
          width: 200px;
          height: 200px;
        }

        .coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s;
        }

        .coin.show-tech-table {
          transform: rotateY(180deg);
        }

        .coin.flipping {
          animation: flip 2s ease-in-out;
        }

        @keyframes flip {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          25% {
            transform: rotateY(720deg) rotateX(180deg);
          }
          50% {
            transform: rotateY(1440deg) rotateX(360deg);
          }
          75% {
            transform: rotateY(2160deg) rotateX(540deg);
          }
          100% {
            transform: rotateY(2880deg) rotateX(720deg);
          }
        }

        .coin-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .coin-table-tech {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
          color: #1a1a1a;
        }

        .coin-tech-table {
          background: linear-gradient(135deg, #9333ea 0%, #a855f7 50%, #9333ea 100%);
          color: white;
          transform: rotateY(180deg);
        }

        .coin-content {
          text-align: center;
          user-select: none;
        }
      `}</style>
    </div>
  )
}
