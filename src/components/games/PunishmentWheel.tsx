"use client"

import { useState, useSyncExternalStore, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Check, X, RotateCcw, Target } from "lucide-react"

// Default punishments - veel creatieve opties!
const DEFAULT_PUNISHMENTS = [
  // Drankjes & Eten
  "🍺 Rondje geven!",
  "🥤 Volgende keer drankjes halen",
  "🍕 Pizza bestellen voor iedereen",
  "☕ Week lang koffie halen",
  "🍪 Taart meenemen",
  "🧁 Traktatie voor de groep",

  // Grappige taken
  "🧹 Opruimen na de meeting",
  "📱 Telefoon 1 uur inleveren",
  "🎤 Karaoke nummer zingen",
  "💃 Dansje doen",
  "🐔 Kippengeluid maken",
  "🤡 Dag lang grappige hoed dragen",
  "🎭 Iemand nadoen",
  "📸 Awkward foto op social media",
  "🗣️ Rest van dag accent praten",
  "🙃 Complimenten uitdelen aan iedereen",

  // Taken & Klusjes
  "🗑️ Vuilnis buiten zetten",
  "🧽 Afwassen",
  "🚗 Chauffeur spelen",
  "📝 Notulen maken",
  "🎁 Cadeautje kopen voor random persoon",
  "💌 Sorry kaartje schrijven",

  // Uitdagingen
  "🏃 10 push-ups doen",
  "🧊 IJsemmer challenge",
  "🌶️ Iets pittigs eten",
  "🍋 Citroen opeten",
  "🤐 10 min niet praten",
  "👟 Dag lang met verkeerde schoenen",

  // Sociaal
  "📞 Moeder bellen en sorry zeggen",
  "🎵 Lied zingen over te laat komen",
  "📖 Gedicht voordragen",
  "🎬 TikTok maken",
  "👑 Iedereen 'majesteit' noemen",

  // Geld gerelateerd
  "💰 €5 in de pot",
  "🎰 Loterij ticket kopen voor groep",
  "🍿 Bioscoopkaartjes betalen",
]

// Pre-selected initial defaults (stable, not random during render)
const INITIAL_DEFAULTS = DEFAULT_PUNISHMENTS.slice(0, 12)

const COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B195", "#C06C84",
  "#6C5B7B", "#355C7D", "#E84A5F", "#FF847C", "#2A363B",
  "#99B898", "#FECEAB", "#FF847C", "#E84A5F", "#2A363B",
]

const STORAGE_KEY = "latetable-punishments"

// Custom hook to use localStorage with SSR support using useSyncExternalStore
function useLocalStoragePunishments(): [string[], (punishments: string[]) => void] {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback)
    return () => window.removeEventListener("storage", callback)
  }, [])

  const getSnapshot = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY)
  }, [])

  // Server-side: return a stable default
  const getServerSnapshot = useCallback(() => {
    return JSON.stringify(INITIAL_DEFAULTS)
  }, [])

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const punishments = useMemo(() => {
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as string[]
        }
      } catch {
        // Invalid JSON
      }
    }
    // Return stable defaults
    return INITIAL_DEFAULTS
  }, [stored])

  const setPunishments = useCallback((newPunishments: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPunishments))
    // Dispatch storage event for same-window updates
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }))
  }, [])

  return [punishments, setPunishments]
}

export function PunishmentWheel() {
  const [punishments, setPunishments] = useLocalStoragePunishments()
  const [newPunishment, setNewPunishment] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showList, setShowList] = useState(false)

  // No useEffect needed - useSyncExternalStore handles everything!

  const addPunishment = () => {
    if (newPunishment.trim() && punishments.length < 20) {
      setPunishments([...punishments, newPunishment.trim()])
      setNewPunishment("")
    }
  }

  const removePunishment = (index: number) => {
    setPunishments(punishments.filter((_, i) => i !== index))
  }

  const startEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(punishments[index])
  }

  const saveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const updated = [...punishments]
      updated[editingIndex] = editValue.trim()
      setPunishments(updated)
    }
    setEditingIndex(null)
    setEditValue("")
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditValue("")
  }

  const resetToDefaults = () => {
    if (confirm("Weet je zeker dat je alle straffen wilt resetten naar de standaard lijst?")) {
      const shuffled = [...DEFAULT_PUNISHMENTS].sort(() => Math.random() - 0.5)
      setPunishments(shuffled.slice(0, 12))
    }
  }

  const addRandomDefault = () => {
    const unused = DEFAULT_PUNISHMENTS.filter((p) => !punishments.includes(p))
    if (unused.length > 0 && punishments.length < 20) {
      const random = unused[Math.floor(Math.random() * unused.length)]
      setPunishments([...punishments, random])
    }
  }

  const spinWheel = () => {
    if (punishments.length < 2 || isSpinning) return

    setIsSpinning(true)
    setResult(null)

    const fullRotations = Math.floor(Math.random() * 6) + 5
    const extraDegrees = Math.random() * 360
    const totalRotation = rotation + fullRotations * 360 + extraDegrees

    setRotation(totalRotation)

    setTimeout(() => {
      const normalizedRotation = totalRotation % 360
      const segmentAngle = 360 / punishments.length
      const winnerIndex =
        Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) %
        punishments.length
      setResult(punishments[winnerIndex])
      setIsSpinning(false)
    }, 4000)
  }

  const segmentAngle = punishments.length > 0 ? 360 / punishments.length : 0

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6">
      {/* Header with toggle */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Straf Wiel
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowList(!showList)}
        >
          {showList ? "Toon Wiel" : `Bewerk Straffen (${punishments.length})`}
        </Button>
      </div>

      {showList ? (
        /* Edit Mode - List of punishments */
        <div className="w-full max-w-md space-y-4">
          {/* Add new punishment */}
          <div className="flex gap-2">
            <Input
              type="text"
              value={newPunishment}
              onChange={(e) => setNewPunishment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPunishment()}
              placeholder="Nieuwe straf toevoegen..."
              disabled={punishments.length >= 20}
              className="flex-1"
            />
            <Button
              onClick={addPunishment}
              disabled={!newPunishment.trim() || punishments.length >= 20}
              size="icon"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={addRandomDefault}
              disabled={punishments.length >= 20}
            >
              + Random straf
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="text-red-400 hover:text-red-300"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Punishment list */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {punishments.map((punishment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-white/10"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />

                {editingIndex === index ? (
                  <>
                    <Input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="flex-1 h-8"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={saveEdit}>
                      <Check className="w-4 h-4 text-green-400" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                      <X className="w-4 h-4 text-red-400" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm truncate">{punishment}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => startEdit(index)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-red-400 hover:text-red-300"
                      onClick={() => removePunishment(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-white/50 text-center">
            {punishments.length}/20 straffen • Minimaal 2 nodig om te draaien
          </p>
        </div>
      ) : (
        /* Wheel Mode */
        <>
          {punishments.length >= 2 ? (
            <>
              {/* The Wheel */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl border-4 border-red-500/50">
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
                    {punishments.map((punishment, index) => {
                      const startAngle = index * segmentAngle
                      const endAngle = (index + 1) * segmentAngle
                      const largeArcFlag = segmentAngle > 180 ? 1 : 0

                      const startRad = (startAngle * Math.PI) / 180
                      const endRad = (endAngle * Math.PI) / 180

                      const x1 = 100 + 100 * Math.cos(startRad)
                      const y1 = 100 + 100 * Math.sin(startRad)
                      const x2 = 100 + 100 * Math.cos(endRad)
                      const y2 = 100 + 100 * Math.sin(endRad)

                      const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`

                      const midAngle = startAngle + segmentAngle / 2
                      const textRad = (midAngle * Math.PI) / 180
                      const textX = 100 + 55 * Math.cos(textRad)
                      const textY = 100 + 55 * Math.sin(textRad)

                      // Get first emoji or first few chars
                      const emoji = punishment.match(/^\p{Emoji}/u)?.[0]
                      const displayText = emoji || punishment.slice(0, 3)

                      return (
                        <g key={index}>
                          <path
                            d={pathData}
                            fill={COLORS[index % COLORS.length]}
                            stroke="white"
                            strokeWidth="1"
                          />
                          <text
                            x={textX}
                            y={textY}
                            fill="white"
                            fontSize={emoji ? "16" : "8"}
                            fontWeight="bold"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          >
                            {displayText}
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
                      borderTop: "30px solid #ef4444",
                    }}
                  />
                </div>

                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full shadow-lg border-4 border-white flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Spin button */}
              <Button
                onClick={spinWheel}
                disabled={isSpinning}
                size="lg"
                className="px-8 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 gap-2"
              >
                {isSpinning ? "Draait..." : (
                  <>
                    <Target className="w-5 h-5" />
                    Draai het Straf Wiel!
                  </>
                )}
              </Button>

              {/* Result */}
              {result && !isSpinning && (
                <div className="mt-2 p-4 sm:p-6 bg-gradient-to-r from-red-900/50 to-orange-900/50 rounded-xl border-2 border-red-500 animate-in fade-in zoom-in duration-500 max-w-sm text-center">
                  <p className="text-sm text-white/70 mb-2">De straf is:</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">{result}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/50 mb-4">
                Voeg minimaal 2 straffen toe om het wiel te gebruiken
              </p>
              <Button onClick={() => setShowList(true)}>
                Straffen Toevoegen
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
