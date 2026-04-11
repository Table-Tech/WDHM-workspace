# Implementation Plan: LateTable Gamification Features

**Spec:** `docs/superpowers/specs/2026-04-11-gamification-design.md`
**Date:** 2026-04-11

---

## Phase 1: Foundation

### 1.1 Database Migration SQL
- [ ] Create `badges` table
- [ ] Create `friend_badges` table
- [ ] Create `streaks` table
- [ ] Create `team_trips` table
- [ ] Add `latitude` and `longitude` columns to `incidents`
- [ ] Insert default badge seed data

### 1.2 TypeScript Types
- [ ] Add Badge, FriendBadge types
- [ ] Add Streak type
- [ ] Add TeamTrip, IncidentLocation types
- [ ] Add LeaderboardEntry, GroupStats types
- [ ] Update Incident type with GPS fields
- [ ] Update IncidentFormData with GPS fields

---

## Phase 2: GPS Location Feature

### 2.1 Location Hook
- [ ] Create `useCurrentLocation()` hook with geolocation API

### 2.2 IncidentModal GPS Integration
- [ ] Add "Huidige Locatie" button
- [ ] Store latitude/longitude in form data
- [ ] Pass GPS to incident creation

### 2.3 Incidents Hook Update
- [ ] Update `addIncident()` to save GPS coordinates

---

## Phase 3: Badges System

### 3.1 Badges Hooks
- [ ] Create `useBadges.ts` with:
  - `useAllBadges()` - fetch all badge definitions
  - `useFriendBadges(friendId)` - badges earned by friend
  - `useAwardBadge()` - mutation to award badge
  - `useCreateBadge()` - mutation for custom badges

### 3.2 Badge Evaluation Logic
- [ ] Create `lib/badges.ts` with condition evaluators
- [ ] Implement `checkAndAwardBadges()` function
- [ ] Hook into incident creation

### 3.3 Badges Page
- [ ] Create `app/badges/page.tsx`
- [ ] Create `BadgeCard.tsx` component
- [ ] Create `BadgeGrid.tsx` component
- [ ] Create `BadgeModal.tsx` for detail view
- [ ] Create `CreateBadgeModal.tsx` for custom badges

### 3.4 FriendCard Badge Display
- [ ] Add badge icons to FriendCard
- [ ] Show max 3-4 badges with tooltip

---

## Phase 4: Streaks System

### 4.1 Streaks Hook
- [ ] Create `useStreaks.ts` with:
  - `useFriendStreaks(friendId)`
  - `useAllStreaks()`
  - `useUpdateStreak()` - internal

### 4.2 Streak Calculation Logic
- [ ] Create `lib/streaks.ts`
- [ ] Implement consecutive late calculation
- [ ] Hook into incident creation

### 4.3 Streak Display
- [ ] Create `StreakBadge.tsx` component
- [ ] Add to FriendCard

---

## Phase 5: Stats & Leaderboards

### 5.1 Stats Hooks
- [ ] Create `useStats.ts` with:
  - `useLeaderboard(type, period)`
  - `useGroupStats()`
  - `useFunStats()`

### 5.2 Stats Page
- [ ] Create `app/stats/page.tsx`
- [ ] Create `LeaderboardTabs.tsx`
- [ ] Create `LeaderboardTable.tsx`
- [ ] Create `StatCard.tsx`
- [ ] Create `FunStats.tsx`

---

## Phase 6: World Map

### 6.1 Dependencies
- [ ] Install leaflet, react-leaflet, @types/leaflet

### 6.2 Location Hooks
- [ ] Create `useLocations.ts` with:
  - `useIncidentLocations()`
  - `useTeamTrips()`
  - `useAddTeamTrip()`

### 6.3 Map Page
- [ ] Create `app/map/page.tsx`
- [ ] Create `MapView.tsx` component
- [ ] Create `IncidentMarker.tsx`
- [ ] Create `TripMarker.tsx`
- [ ] Create `MarkerPopup.tsx`
- [ ] Create `AddTripModal.tsx`

---

## Phase 7: Navigation & Polish

### 7.1 Navigation Update
- [ ] Add Badges, Map, Stats links to header
- [ ] Mobile bottom navigation

### 7.2 Dashboard Updates
- [ ] Add quick stats bar
- [ ] Show newest badge notification

---

## Execution Order

1. Types (foundation for everything)
2. GPS in IncidentModal (quick win, enables map data)
3. Badges system (most impactful feature)
4. Streaks (builds on badges)
5. Stats/Leaderboards (uses existing + new data)
6. World Map (requires leaflet setup)
7. Navigation + polish
