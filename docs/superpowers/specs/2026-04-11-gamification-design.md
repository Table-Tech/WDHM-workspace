# LateTable Gamification & Features Design

**Datum:** 2026-04-11
**Status:** Approved
**Scope:** Badges, Streaks, Leaderboards, Wereldkaart, GPS Locaties

---

## Overzicht

Uitbreiding van LateTable met gamification features om de app leuker en interactiever te maken:

1. **Badges/Achievements** - Verdien badges voor bepaald gedrag
2. **Streaks** - Bijhouden van opeenvolgende te laat/op tijd
3. **Leaderboards** - Uitgebreide ranglijsten met filters
4. **Wereldkaart** - Interactieve kaart met te-laat locaties en team uitjes
5. **GPS Locatie** - Exacte locatie vastleggen bij incidents

---

## 1. Database Schema

### Nieuwe Tabellen

#### `badges` - Badge Definities
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,                    -- Lucide icon naam
  image_url TEXT,                        -- Optionele custom afbeelding
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'consecutive_late',      -- X keer achter elkaar te laat
    'total_late',            -- Totaal X keer te laat
    'minutes_late_single',   -- Eenmalig >X minuten te laat
    'minutes_late_avg',      -- Gemiddeld >X minuten te laat
    'no_evidence',           -- X incidents zonder foto/video
    'always_evidence',       -- X incidents altijd met bewijs
    'on_time_streak',        -- X keer op tijd achter elkaar
    'first_late',            -- Eerste te laat melding
    'custom'                 -- Handmatig toegekend
  )),
  condition_value INTEGER,               -- Waarde voor conditie (bijv. 10)
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_system BOOLEAN DEFAULT true,        -- System badge of custom
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `friend_badges` - Toegekende Badges
```sql
CREATE TABLE friend_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  earned_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  UNIQUE(friend_id, badge_id)
);
```

#### `streaks` - Streak Tracking
```sql
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('late', 'on_time')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_incident_id UUID REFERENCES incidents(id),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(friend_id, streak_type)
);
```

#### `team_trips` - Team Uitjes
```sql
CREATE TABLE team_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  photo_url TEXT,
  trip_date DATE,
  created_by UUID REFERENCES friends(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Updates aan Bestaande Tabellen

#### `incidents` - GPS Kolommen Toevoegen
```sql
ALTER TABLE incidents ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE incidents ADD COLUMN longitude DECIMAL(11, 8);
```

### Seed Data: Default Badges
```sql
INSERT INTO badges (name, description, icon, condition_type, condition_value, rarity) VALUES
  ('Eerste Keer', 'Je eerste te laat melding', 'baby', 'first_late', 1, 'common'),
  ('Altijd Te Laat', '10x achter elkaar te laat', 'flame', 'consecutive_late', 10, 'epic'),
  ('Drama King', 'Meer dan 30 minuten te laat', 'crown', 'minutes_late_single', 30, 'rare'),
  ('Drama Queen', 'Meer dan 60 minuten te laat', 'sparkles', 'minutes_late_single', 60, 'epic'),
  ('Ghost', '5 incidents zonder bewijs', 'ghost', 'no_evidence', 5, 'rare'),
  ('Paparazzi', '10 incidents altijd met bewijs', 'camera', 'always_evidence', 10, 'rare'),
  ('Recidivist', 'Totaal 25x te laat', 'repeat', 'total_late', 25, 'epic'),
  ('Legende', 'Totaal 50x te laat', 'trophy', 'total_late', 50, 'legendary'),
  ('Heilige', '5x op tijd achter elkaar', 'heart', 'on_time_streak', 5, 'rare'),
  ('Engel', '10x op tijd achter elkaar', 'sparkle', 'on_time_streak', 10, 'legendary'),
  ('Speedrunner', '5x achter elkaar te laat', 'zap', 'consecutive_late', 5, 'common'),
  ('Chronisch', '20x achter elkaar te laat', 'alarm-clock-off', 'consecutive_late', 20, 'legendary');
```

---

## 2. Nieuwe Paginas

### `/badges` - Badges Overzicht
- Grid van alle beschikbare badges
- Filter: Alle / Verdiend / Niet verdiend
- Badge detail modal met:
  - Wie heeft deze badge
  - Wanneer verdiend
  - Voorwaarden
- Knop om custom badge aan te maken (met foto upload)

### `/map` - Wereldkaart
- Interactieve kaart (Leaflet.js + OpenStreetMap)
- Twee lagen:
  1. **Te Laat Pins** - Rode markers voor incident locaties
  2. **Team Trips** - Blauwe/groene markers voor uitjes
- Cluster markers voor veel pins op zelfde plek
- Click op pin toont:
  - Incident: Wie, wanneer, foto indien beschikbaar
  - Trip: Naam, beschrijving, foto, datum
- Floating action button om nieuwe trip toe te voegen
- Filter toggles voor pins

### `/stats` - Statistieken & Leaderboards
- **Ranglijsten:**
  - Meest te laat (all-time)
  - Minst te laat (de "heilige")
  - Hoogste gemiddelde minuten te laat
  - Langste huidige streak
  - Beste streak ooit
- **Periode filters:** All-time / Deze maand / Deze week
- **Fun stats:**
  - Totaal minuten te laat als groep
  - Populairste locaties
  - Dag van de week met meeste incidents
  - Uur van de dag analyse

---

## 3. Component Updates

### IncidentModal - GPS Toevoegen
- Nieuwe knop: "Huidige Locatie" naast locatie input
- Gebruikt `navigator.geolocation.getCurrentPosition()`
- Slaat latitude/longitude op bij incident
- Toont adres via reverse geocoding (optioneel)
- Fallback naar handmatige invoer als GPS faalt

### FriendCard - Badges & Streaks Tonen
- Badge iconen onder de naam (max 3-4 zichtbaar)
- Tooltip met badge naam
- Streak indicator als flame icon met nummer
- Click op badges opent profiel/badge detail

### Dashboard - Quick Stats
- Kleine stats balk boven vrienden lijst
- Toont: Totaal incidents deze week, langste actieve streak, nieuwste badge

### Leaderboard Component - Uitbreiden
- Tabs voor verschillende ranglijsten
- Periode selector dropdown
- Animatie bij positie wijzigingen

---

## 4. Nieuwe Hooks

### `useBadges`
```typescript
- useAllBadges() - Alle badge definities
- useFriendBadges(friendId) - Badges van een vriend
- useAwardBadge() - Badge toekennen (mutation)
- useCreateBadge() - Custom badge maken (mutation)
```

### `useStreaks`
```typescript
- useFriendStreaks(friendId) - Streaks van een vriend
- useAllStreaks() - Alle streaks voor leaderboard
- useUpdateStreak() - Intern, called na incident
```

### `useLocations`
```typescript
- useIncidentLocations() - Alle incidents met GPS
- useTeamTrips() - Alle team trips
- useAddTeamTrip() - Trip toevoegen (mutation)
- useCurrentLocation() - GPS hook
```

### `useStats`
```typescript
- useLeaderboard(type, period) - Ranglijst data
- useGroupStats() - Totaal statistieken
- useFunStats() - Leuke statistieken
```

---

## 5. Badge Toekenning Logica

Badges worden automatisch gecontroleerd na elke nieuwe incident:

```typescript
async function checkAndAwardBadges(friendId: string, incident: Incident) {
  const badges = await getAllBadges();
  const friendBadges = await getFriendBadges(friendId);
  const earnedBadgeIds = friendBadges.map(fb => fb.badge_id);

  for (const badge of badges) {
    if (earnedBadgeIds.includes(badge.id)) continue;

    const earned = await evaluateBadgeCondition(friendId, badge, incident);
    if (earned) {
      await awardBadge(friendId, badge.id, incident.id);
      // Trigger notification/celebration
    }
  }
}
```

---

## 6. Streak Logica

Na elke incident wordt de streak bijgewerkt:

```typescript
async function updateStreaks(friendId: string) {
  const incidents = await getRecentIncidents(friendId);

  // Late streak: opeenvolgende te laat
  const lateStreak = calculateConsecutiveLate(incidents);
  await upsertStreak(friendId, 'late', lateStreak);

  // On-time streak: dagen zonder incident (meer complex)
  // Vereist "check-in" functionaliteit of tijdsgebaseerde berekening
}
```

---

## 7. Kaart Implementatie

### Technologie
- **Leaflet.js** - Lichtgewicht, open-source kaart library
- **React-Leaflet** - React wrapper
- **OpenStreetMap** - Gratis tiles, geen API key nodig

### Features
- Marker clustering voor performance
- Custom marker icons per type
- Popup met incident/trip info
- Bounds fitting bij laden
- Geolocation voor "center on me"

---

## 8. Nieuwe Types

```typescript
// Badge types
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string | null;
  condition_type: BadgeConditionType;
  condition_value: number | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  is_system: boolean;
}

interface FriendBadge {
  id: string;
  friend_id: string;
  badge_id: string;
  badge: Badge;
  earned_at: string;
}

// Streak types
interface Streak {
  id: string;
  friend_id: string;
  streak_type: 'late' | 'on_time';
  current_count: number;
  best_count: number;
  last_updated: string;
}

// Location types
interface IncidentLocation {
  incident_id: string;
  latitude: number;
  longitude: number;
  incident: Incident;
  friend: Friend;
}

interface TeamTrip {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_url: string | null;
  trip_date: string | null;
  created_by: string | null;
  creator?: Friend;
}

// Stats types
interface LeaderboardEntry {
  friend: Friend;
  value: number;
  rank: number;
  change?: number; // positie verandering
}

interface GroupStats {
  total_incidents: number;
  total_minutes_late: number;
  avg_minutes_late: number;
  most_common_day: string;
  most_common_hour: number;
  total_with_evidence: number;
}
```

---

## 9. Pagina Structuur

```
src/app/
├── page.tsx                 # Dashboard (bestaand)
├── gallery/page.tsx         # Gallery (bestaand)
├── badges/page.tsx          # NEW: Badges overzicht
├── map/page.tsx             # NEW: Wereldkaart
└── stats/page.tsx           # NEW: Statistieken

src/components/
├── badges/
│   ├── BadgeCard.tsx        # Enkele badge weergave
│   ├── BadgeGrid.tsx        # Grid van badges
│   ├── BadgeModal.tsx       # Badge detail popup
│   ├── CreateBadgeModal.tsx # Custom badge maken
│   └── FriendBadges.tsx     # Badges van een vriend
├── map/
│   ├── MapView.tsx          # Hoofdkaart component
│   ├── IncidentMarker.tsx   # Rode te-laat pin
│   ├── TripMarker.tsx       # Blauwe trip pin
│   ├── MarkerPopup.tsx      # Info popup
│   └── AddTripModal.tsx     # Trip toevoegen
├── stats/
│   ├── LeaderboardTabs.tsx  # Tabs voor ranglijsten
│   ├── LeaderboardTable.tsx # Ranglijst tabel
│   ├── StatCard.tsx         # Statistiek kaart
│   └── FunStats.tsx         # Leuke statistieken
└── shared/
    ├── StreakBadge.tsx      # Streak indicator
    └── LocationPicker.tsx   # GPS locatie picker
```

---

## 10. Navigatie Update

Header uitbreiden met nieuwe pagina links:
- Dashboard (home icon)
- Gallery (image icon)
- Badges (award icon) - NEW
- Map (map-pin icon) - NEW
- Stats (bar-chart icon) - NEW
- Settings (gear icon)

Mobile: Bottom navigation bar met icons

---

## 11. Prioriteit Volgorde

1. Database migratie (nieuwe tabellen + kolommen)
2. Types en hooks basis
3. GPS in IncidentModal
4. Badges systeem + pagina
5. Streaks tracking
6. Stats/Leaderboards pagina
7. Wereldkaart pagina
8. Navigatie update
9. Polish en animaties

---

## 12. Dependencies

Nieuwe packages nodig:
```json
{
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "@types/leaflet": "^1.9.8"
}
```

---

## Samenvatting

Dit ontwerp voegt uitgebreide gamification toe aan LateTable:
- **13 system badges** met automatische toekenning
- **Custom badges** met foto upload
- **Streak tracking** voor late en on-time
- **Uitgebreide leaderboards** met periode filters
- **Interactieve wereldkaart** met GPS pinpoints
- **3 nieuwe paginas** + navigatie update
- **5 nieuwe database tabellen**

De features zijn ontworpen om samen te werken en de app veel leuker te maken voor de vriendengroep.
