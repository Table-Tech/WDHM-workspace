# Fun Features Design Spec

**Date**: 2026-04-11
**Status**: Approved

## Overview

Dit document beschrijft de nieuwe fun/social features voor LateTable:
- Games Page (Spin Wheel, Coin Flip, Team Maker)
- Hall of Fame
- GIF Reactions
- Animated Slideshow (Milestone Video)
- Invite System
- Reset System

---

## 1. Games Page (`/games`)

### Layout
Eén pagina met **3 tabs**:

### 1.1 Spin the Wheel
- **Invoer**: Namen toevoegen (vrij tekstveld per naam)
- **Custom tekst**: Waarvoor je draait (bv. "Wie betaalt de koffie?")
- **Animatie**: Draaiend wiel met CSS transitions
- **Resultaat**: Winnaar highlight met confetti

### 1.2 Coin Flip
- **Kop**: TableTech branding
- **Munt**: TechTable branding
- **Animatie**: 3D flip met CSS transforms
- **Resultaat**: Winnende kant met bounce effect

### 1.3 Team Maker
- **Invoer**:
  - Namen selecteren (uit vrienden of handmatig)
  - Aantal teams kiezen (2-8)
- **Animatie**: Namen shuffelen voordat ze in teams vallen
- **Resultaat**: Random teams weergeven in kolommen

---

## 2. Hall of Fame (`/hall-of-fame`)

### Content (3 secties)

### 2.1 Records
- Langste late streak
- Meeste minuten te laat (single incident)
- Hoogste totaal minuten
- Meeste incidents in één maand
- Langste on-time streak

### 2.2 Iconic Moments
- Memorabele incidents met foto's
- User kan moments markeren als "iconic"
- Grid weergave met hover preview

### 2.3 Reset Historie
- Complete log van alle resets
- Per reset: datum, wie triggerde, stats op dat moment
- Archief van oude "seizoenen"

---

## 3. GIF Reactions

### Preset Collectie (~25 GIFs)
Categorieën:
- **Lachen** (5): funny reactions
- **Schaamte** (5): facepalm, cringe
- **Verbaasd** (5): shocked, wow
- **Applaus** (5): clapping, thumbs up
- **Drama** (5): eye roll, sigh

### Waar
- Op incidents (in IncidentModal)
- Op milestones (in MilestoneBanner)

### Opslag
- GIFs lokaal in `/public/gifs/reactions/`
- Selecties opslaan in `incident_reactions` tabel

---

## 4. Animated Slideshow (Milestone Video)

### Trigger
- Bij milestone bereiken (badge earned, streak milestone)

### Features
- **Ken Burns effect**: Langzaam zoom/pan op foto's
- **Transitions**: Fade, slide
- **Achtergrondmuziek**: Preset tracks (royalty-free)
- **Duur**: ~10-15 seconden per foto

### Technisch
- Pure CSS/JS animaties (geen video export)
- Fullscreen modal overlay
- Play/Pause controls
- Skip button

---

## 5. Invite System

### Flow
1. User klikt "Invite" button
2. Shareable link wordt gegenereerd
3. Link kopiëren of direct delen (native share API)
4. Ontvanger opent link → direct toegang

### Technisch
- Geen invite codes nodig
- Open link systeem
- Optioneel: link expiration (30 dagen)

---

## 6. Reset System

### Scope
- **Counts naar 0**: Alle incident counts resetten
- **Historie bewaard**: Alle incidents blijven als archief
- **Totalen tracked**: Overall statistieken apart bijgehouden

### Database Changes
- Nieuw veld: `archived_at` op incidents
- Nieuwe tabel: `resets` (datum, triggered_by, snapshot)
- Nieuwe tabel: `seasons` (start_date, end_date, name)

### Filter
- Leaderboard filterable op:
  - Huidig seizoen
  - Alle tijd
  - Specifiek seizoen

---

## Database Schema Updates

```sql
-- Reactions table
CREATE TABLE incident_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES friends(id) ON DELETE CASCADE,
  gif_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resets table
CREATE TABLE resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES friends(id),
  reset_at TIMESTAMPTZ DEFAULT NOW(),
  stats_snapshot JSONB
);

-- Seasons table
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Iconic moments flag
ALTER TABLE incidents ADD COLUMN is_iconic BOOLEAN DEFAULT false;

-- Archive flag
ALTER TABLE incidents ADD COLUMN archived_at TIMESTAMPTZ;
ALTER TABLE incidents ADD COLUMN season_id UUID REFERENCES seasons(id);
```

---

## New Files Structure

```
src/
├── app/
│   ├── games/
│   │   └── page.tsx
│   └── hall-of-fame/
│       └── page.tsx
├── components/
│   ├── games/
│   │   ├── SpinWheel.tsx
│   │   ├── CoinFlip.tsx
│   │   └── TeamMaker.tsx
│   ├── hall-of-fame/
│   │   ├── RecordsSection.tsx
│   │   ├── IconicMoments.tsx
│   │   └── ResetHistory.tsx
│   ├── reactions/
│   │   ├── GifPicker.tsx
│   │   └── ReactionDisplay.tsx
│   └── slideshow/
│       └── MilestoneSlideshow.tsx
├── hooks/
│   ├── useReactions.ts
│   ├── useSeasons.ts
│   └── useReset.ts
└── lib/
    └── gifs.ts (preset GIF mappings)
public/
└── gifs/
    └── reactions/
        ├── laugh-1.gif
        ├── laugh-2.gif
        └── ... (~25 GIFs)
```

---

## UI/UX Notes

- **Games Page**: Donkere theme, neon accents voor fun vibe
- **Hall of Fame**: Gouden accents, trophy iconography
- **GIF Picker**: Grid popup, max 6 recent, categorieën
- **Slideshow**: Fullscreen, cinematic feel
- **Invite**: Simple share sheet, WhatsApp/copy link buttons

---

## Implementation Priority

1. Games Page (meest standalone)
2. Reset System + Seasons (foundational)
3. Hall of Fame (depends on reset)
4. GIF Reactions (can be added incrementally)
5. Slideshow (polish feature)
6. Invite System (simple addition)
