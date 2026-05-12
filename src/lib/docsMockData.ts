import type { DocTemplate } from '@/types/docs';

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: 't-blank',
    name: 'Lege pagina',
    description: 'Begin met een schone lei.',
    icon: 'FileText',
    content: '# Nieuwe pagina\n\nSchrijf hier je content...\n',
    tags: [],
  },
  {
    id: 't-deploy',
    name: 'Deployment handleiding',
    description: 'Template voor een deployment proces.',
    icon: 'Rocket',
    content: `# Deployment Handleiding

## Doel
Beschrijf het doel van deze handleiding.

## Stappen
1. Stap 1
2. Stap 2
3. Stap 3

## Checklist
- [ ] Build geslaagd
- [ ] Tests groen
- [ ] Klant geïnformeerd
`,
    tags: ['Development', 'Production'],
  },
  {
    id: 't-onboarding',
    name: 'Klant onboarding',
    description: 'Stappenplan voor nieuwe klanten.',
    icon: 'Users',
    content: `# Klant onboarding

## Klantinfo
- Naam:
- Contact:
- Sector:

## Onboarding stappen
1. Intake
2. Toegang regelen
3. Eerste oplevering
4. Evaluatie
`,
    tags: ['Klant'],
  },
  {
    id: 't-meeting',
    name: 'Meeting notes',
    description: 'Aantekeningen van een meeting.',
    icon: 'Calendar',
    content: `# Meeting notes

**Datum:** 2026-05-13
**Aanwezig:**

## Agenda
- Punt 1
- Punt 2

## Beslissingen
- ...

## Actiepunten
- [ ] Actie 1 — @persoon
- [ ] Actie 2 — @persoon
`,
    tags: ['Meeting'],
  },
  {
    id: 't-bug',
    name: 'Bug fix document',
    description: 'Analyse en oplossing van een bug.',
    icon: 'Bug',
    content: `# Bug fix

## Symptoom
Wat ging er fout?

## Reproductie
Stappen om het probleem te reproduceren.

## Root cause
Waar zat het probleem?

## Oplossing
Wat is er aangepast?

## Preventie
Hoe voorkomen we dit in de toekomst?
`,
    tags: ['Development', 'Bug'],
  },
  {
    id: 't-offerte',
    name: 'Offerte template',
    description: 'Basis voor een nieuwe offerte.',
    icon: 'FileSignature',
    content: `# Offerte — [Klantnaam]

**Datum:** 2026-05-13
**Geldig tot:**

## Scope
Beschrijf de scope.

## Tijdlijn
- Week 1:
- Week 2:

## Investering
- Eenmalig: €
- Maandelijks: €

## Voorwaarden
Standaard voorwaarden van toepassing.
`,
    tags: ['Sales', 'Offerte'],
  },
];
