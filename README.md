# LateTable

Een gedeelde web-app voor je vriendengroep om bij te houden wie het vaakst te laat komt. Met milestones, straffen en realtime updates.

## Features

- **Realtime Updates** - Iedereen ziet direct wanneer iemand te laat is gemarkeerd
- **Milestone Systeem** - Automatische straffen bij 5x, 10x, 15x, 20x en 25x te laat
- **Foto Bewijs** - Voeg foto's toe als bewijs van het te laat komen
- **Leaderboard** - Zie wie de "winnaar" is
- **Futuristische UI** - Moderne, donkere interface met glassmorphism effecten
- **Volledig Open** - Geen login nodig, deel gewoon de link

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Deployment**: Vercel + Supabase

## Quick Start

### 1. Supabase Setup

1. Maak een nieuw project aan op [supabase.com](https://supabase.com)
2. Ga naar de SQL Editor en voer de migratie uit (kopieer inhoud van `supabase/migration.sql`)
3. Ga naar **Database > Replication** en enable replication voor:
   - `friends` tabel
   - `incidents` tabel
4. Ga naar **Storage** en maak een publieke bucket aan genaamd `incident-photos`
5. Noteer je project URL en anon key (Settings > API)

### 2. Lokaal Draaien

```bash
# Installeer dependencies
npm install

# Configureer environment variables
# Edit .env.local met je Supabase credentials

# Start development server
npm run dev

# Open http://localhost:3000
```

### 3. Environment Variables

Bewerk `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Deployment

### Vercel

1. Push je code naar GitHub
2. Import het project in [Vercel](https://vercel.com)
3. Voeg de environment variables toe in Vercel dashboard
4. Deploy!

## Milestones

| Aantal | Emoji | Straf |
|--------|-------|-------|
| 5x | 🍺 | Rondje drankjes betalen |
| 10x | 🍕 | Pizza traktatie |
| 15x | 🎤 | Karaoke solo |
| 20x | 👕 | Schaamshirt dragen |
| 25x | ✈️ | Weekendje weg organiseren |

## Project Structuur

```
src/
├── app/                # Next.js App Router
├── components/
│   ├── ui/             # shadcn/ui componenten
│   ├── dashboard/      # Dashboard container
│   ├── friends/        # Friend componenten
│   ├── incidents/      # Incident modal
│   ├── leaderboard/    # Leaderboard
│   └── shared/         # Gedeelde componenten
├── hooks/              # React Query hooks
├── lib/                # Utilities
└── types/              # TypeScript types
```

## Development

```bash
npm run dev     # Development server
npm run build   # Production build
npm run lint    # Type checking
npm run start   # Start production
```

---

Gemaakt met ❤️ voor vrienden die altijd te laat komen.
