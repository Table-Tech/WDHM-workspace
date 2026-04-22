"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const TEAM_COLORS = [
  { bg: "bg-red-950", border: "border-red-500", text: "text-red-400" },
  { bg: "bg-blue-950", border: "border-blue-500", text: "text-blue-400" },
  { bg: "bg-green-950", border: "border-green-500", text: "text-green-400" },
  { bg: "bg-yellow-950", border: "border-yellow-500", text: "text-yellow-400" },
  { bg: "bg-purple-950", border: "border-purple-500", text: "text-purple-400" },
  { bg: "bg-pink-950", border: "border-pink-500", text: "text-pink-400" },
  { bg: "bg-orange-950", border: "border-orange-500", text: "text-orange-400" },
  { bg: "bg-teal-950", border: "border-teal-500", text: "text-teal-400" },
]

interface Player {
  name: string
  team?: number
}

export function TeamMaker() {
  const [inputName, setInputName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [teamCount, setTeamCount] = useState(2)
  const [isShuffling, setIsShuffling] = useState(false)

  const handleAddPlayer = () => {
    const trimmedName = inputName.trim()
    if (trimmedName && players.length < 24) {
      setPlayers([...players, { name: trimmedName }])
      setInputName("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer()
    }
  }

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleShuffleTeams = () => {
    if (players.length === 0) return

    setIsShuffling(true)

    // Shuffle animation duration
    setTimeout(() => {
      const shuffledPlayers = shuffleArray(players)
      const playersWithTeams = shuffledPlayers.map((player, index) => ({
        ...player,
        team: index % teamCount,
      }))
      setPlayers(playersWithTeams)
      setIsShuffling(false)
    }, 1500)
  }

  const handleReset = () => {
    setPlayers([])
    setInputName("")
    setTeamCount(2)
    setIsShuffling(false)
  }

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const teams = Array.from({ length: teamCount }, (_, teamIndex) =>
    players.filter((player) => player.team === teamIndex)
  )

  const hasTeams = players.some((player) => player.team !== undefined)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter player name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={players.length >= 24 || isShuffling}
            className="flex-1"
          />
          <Button
            onClick={handleAddPlayer}
            disabled={!inputName.trim() || players.length >= 24 || isShuffling}
          >
            Add Player
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {players.length}/24 players added
        </div>

        {/* Team Count Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Number of teams:</label>
          <select
            value={teamCount}
            onChange={(e) => setTeamCount(Number(e.target.value))}
            disabled={isShuffling}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleShuffleTeams}
            disabled={players.length === 0 || isShuffling}
          >
            {isShuffling ? "Shuffling..." : "Shuffle Teams"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={isShuffling}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Players List (before shuffling) */}
      {!hasTeams && players.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Players:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg border border-zinc-700 bg-zinc-900"
              >
                <span className="text-sm truncate">{player.name}</span>
                <button
                  onClick={() => removePlayer(index)}
                  disabled={isShuffling}
                  className="ml-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  aria-label="Remove player"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shuffling Animation */}
      {isShuffling && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="text-4xl animate-spin">🔄</div>
            <p className="text-lg font-medium">Shuffling teams...</p>
          </div>
        </div>
      )}

      {/* Teams Display (after shuffling) */}
      {hasTeams && !isShuffling && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, teamIndex) => {
            const colors = TEAM_COLORS[teamIndex]
            return (
              <div
                key={teamIndex}
                className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-4 space-y-2`}
              >
                <h3 className={`text-lg font-bold ${colors.text}`}>
                  Team {teamIndex + 1}
                </h3>
                <div className="space-y-1">
                  {team.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No players
                    </p>
                  ) : (
                    team.map((player, playerIndex) => (
                      <div
                        key={playerIndex}
                        className={`p-2 rounded border ${colors.border} bg-zinc-900 ${colors.text} text-sm font-medium`}
                      >
                        {player.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
