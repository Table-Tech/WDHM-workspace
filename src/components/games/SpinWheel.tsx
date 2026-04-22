"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E2",
  "#F8B195",
  "#C06C84",
  "#6C5B7B",
  "#355C7D",
]

export function SpinWheel() {
  const [names, setNames] = useState<string[]>([])
  const [newName, setNewName] = useState("")
  const [spinText, setSpinText] = useState("Waarvoor draai je?")
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)

  const addName = () => {
    if (newName.trim() && names.length < 12) {
      setNames([...names, newName.trim()])
      setNewName("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addName()
    }
  }

  const removeName = (index: number) => {
    setNames(names.filter((_, i) => i !== index))
  }

  const spinWheel = () => {
    if (names.length === 0 || isSpinning) return

    setIsSpinning(true)
    setWinner(null)

    // Calculate spin: 5-10 full rotations (1800-3600 degrees) plus random extra degrees
    const fullRotations = Math.floor(Math.random() * 6) + 5 // 5-10 rotations
    const extraDegrees = Math.random() * 360
    const totalRotation = rotation + fullRotations * 360 + extraDegrees

    setRotation(totalRotation)

    // After animation completes (4 seconds), determine winner
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360
      const segmentAngle = 360 / names.length
      // Adjust for rotation direction and starting point
      const winnerIndex =
        Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) %
        names.length
      setWinner(names[winnerIndex])
      setIsSpinning(false)
    }, 4000)
  }

  const reset = () => {
    setNames([])
    setNewName("")
    setSpinText("Waarvoor draai je?")
    setRotation(0)
    setWinner(null)
    setIsSpinning(false)
  }

  const segmentAngle = names.length > 0 ? 360 / names.length : 0

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Waarvoor draai je?
          </label>
          <Input
            type="text"
            value={spinText}
            onChange={(e) => setSpinText(e.target.value)}
            placeholder="Bijv: Wie moet afwassen?"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Namen toevoegen ({names.length}/12)
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Voer een naam in"
              disabled={names.length >= 12}
              className="flex-1"
            />
            <Button
              onClick={addName}
              disabled={!newName.trim() || names.length >= 12}
            >
              Toevoegen
            </Button>
          </div>
        </div>

        {names.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {names.map((name, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] + "40" }}
              >
                <span>{name}</span>
                <button
                  onClick={() => removeName(index)}
                  className="text-xs font-bold hover:scale-110 transition-transform"
                  disabled={isSpinning}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {names.length > 0 && (
        <>
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold">{spinText}</h2>
          </div>

          <div className="relative w-80 h-80">
            {/* Wheel container */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full transition-transform duration-[4000ms]"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transitionTimingFunction: isSpinning
                    ? "cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                    : "none",
                }}
              >
                {names.map((name, index) => {
                  const startAngle = index * segmentAngle
                  const endAngle = (index + 1) * segmentAngle
                  const largeArcFlag = segmentAngle > 180 ? 1 : 0

                  // Calculate path for pie slice
                  const startRad = (startAngle * Math.PI) / 180
                  const endRad = (endAngle * Math.PI) / 180

                  const x1 = 100 + 100 * Math.cos(startRad)
                  const y1 = 100 + 100 * Math.sin(startRad)
                  const x2 = 100 + 100 * Math.cos(endRad)
                  const y2 = 100 + 100 * Math.sin(endRad)

                  const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                  // Calculate text position
                  const midAngle = startAngle + segmentAngle / 2
                  const textRad = (midAngle * Math.PI) / 180
                  const textX = 100 + 60 * Math.cos(textRad)
                  const textY = 100 + 60 * Math.sin(textRad)

                  return (
                    <g key={index}>
                      <path
                        d={pathData}
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                      >
                        {name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "15px solid transparent",
                  borderRight: "15px solid transparent",
                  borderTop: "30px solid #000",
                }}
              />
            </div>

            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg border-4 border-gray-800 flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full" />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={spinWheel}
              disabled={isSpinning || names.length === 0}
              size="lg"
              className="px-8"
            >
              {isSpinning ? "Draait..." : "Draai!"}
            </Button>
            <Button onClick={reset} variant="outline" size="lg">
              Reset
            </Button>
          </div>

          {winner && (
            <div className="mt-4 p-6 bg-zinc-900 rounded-lg border-2 border-green-500 animate-in fade-in zoom-in duration-500">
              <p className="text-sm text-white/70 mb-1">Winnaar:</p>
              <p className="text-3xl font-bold text-green-400">{winner}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
