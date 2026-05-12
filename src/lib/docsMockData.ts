import type { DocItem, DocTemplate } from '@/types/docs';

const DEPLOYMENT_CONTENT = `# Deployment Handleiding

## Doel
Deze handleiding beschrijft hoe wij een project veilig deployen naar productie.

## Stappen
1. Controleer of alle changes gemerged zijn.
2. Run lokaal de build.
3. Controleer environment variables.
4. Deploy naar Vercel.
5. Test de productieomgeving.

## Checklist
- [x] Build geslaagd
- [ ] Database migraties gecontroleerd
- [ ] Environment variables ingesteld
- [ ] Klant geïnformeerd

## Belangrijke commando's
\`\`\`bash
npm run build
vercel --prod
\`\`\`

## Links
- [Vercel Dashboard](https://vercel.com)
- [Status Page](https://status.techtable.nl)
`;

const GIT_WORKFLOW_CONTENT = `# Git Workflow

## Branch strategie
- \`master\` — productie
- \`develop\` — staging
- \`feature/*\` — nieuwe features
- \`fix/*\` — bugfixes

## Pull Request flow
1. Maak feature branch vanaf \`develop\`.
2. Commit met duidelijke messages.
3. Open een PR en vraag review.
4. Merge na approval.

## Conventional commits
\`\`\`
feat: nieuwe functionaliteit
fix: bugfix
chore: kleine onderhoud taken
docs: documentatie
\`\`\`
`;

const API_STANDARDS_CONTENT = `# API Standards

## Naming
- Endpoints in **kebab-case**.
- Resources in meervoud (\`/users\`, \`/invoices\`).

## Response format
\`\`\`json
{
  "data": {},
  "error": null,
  "meta": {}
}
\`\`\`

## Error handling
- Gebruik HTTP status codes correct (4xx voor client, 5xx voor server).
- Altijd een leesbare \`message\` meegeven.
`;

const POKEBOWL_CONTENT = `# Pokebowl Original

## Klant info
- **Contactpersoon:** Jordy
- **Locatie:** Rotterdam
- **Sinds:** 2024

## Diensten
- Website hosting
- E-mail
- Bestelsysteem integratie

## Belangrijke contacten
- Marketing: marketing@pokebowloriginal.nl
- Technisch: damian@techtable.nl
`;

const IRI_CONTENT = `# IRI Services

## Klant info
- **Contactpersoon:** Iris
- **Sector:** Zakelijke dienstverlening

## Lopende projecten
- Nieuwe website (Q2 2026)
- E-mail migratie naar Strato
`;

const SOUPY_CONTENT = `# Soupy

## Klant info
- **Contactpersoon:** Bram
- **Sector:** Horeca / Soep concept

## Status
Actieve klant, maandelijkse onderhoud.
`;

const OFFERTE_CONTENT = `# Offerte Templates

## Standaard onderdelen
1. Introductie en achtergrond
2. Scope of work
3. Tijdlijn
4. Investering
5. Voorwaarden

## Tips
- Houd het kort en helder.
- Werk met meerdere pakketten (Basic / Pro / Premium).
- Voeg altijd een geldigheidsdatum toe.
`;

const PRICING_CONTENT = `# Pricing

## Basis tarieven
- Website klein: vanaf €1500
- Website middel: vanaf €3500
- Website groot: op maat

## Maandelijkse diensten
- Hosting: €15/maand
- E-mail: €5/maand per mailbox
- Onderhoud: €50/maand
`;

const LEAD_FLOW_CONTENT = `# Lead Flow

1. **Lead binnen** — via website formulier of referral.
2. **Eerste contact** — binnen 24u terugbellen / mailen.
3. **Intake gesprek** — wensen en budget bespreken.
4. **Offerte** — maken binnen 5 werkdagen.
5. **Akkoord** — kick-off plannen.
`;

const VERCEL_CONTENT = `# Vercel

## Account
- Team: TechTable
- Plan: Pro

## Projecten
- techtable.nl
- latetable.com
- klanten/*

## Belangrijke environment variables
Worden gezet via het Vercel dashboard per project.
`;

const CLOUDFLARE_CONTENT = `# Cloudflare

## Gebruik
- DNS management
- DDoS bescherming
- Page rules / redirects

## Notes
- API tokens staan in Bitwarden.
`;

const DOMEINEN_CONTENT = `# Domeinen

| Domein | Eigenaar | Registrar |
|---|---|---|
| techtable.nl | TechTable | Strato |
| latetable.com | TechTable | Strato |
`;

const BTW_CONTENT = `# BTW uitleg

## Hoog tarief
21% — standaard voor diensten.

## Laag tarief
9% — bepaalde producten, zelden van toepassing voor ons.

## BTW verlegd
Bij internationale b2b klanten kan BTW verlegd worden.
Altijd valide VAT nummer opvragen.
`;

const FACTURATIE_CONTENT = `# Facturatie

## Tooling
We gebruiken **Moneybird** voor alle facturen.

## Cyclus
- Facturen einde maand
- Betaaltermijn: 14 dagen
- Herinnering na 7 dagen
- Aanmaning na 21 dagen
`;

const NOW = '2026-05-12T10:00:00Z';

export const DEFAULT_DOCS: DocItem[] = [
  // Development
  { id: 'f-dev', title: 'Development', type: 'folder', parentId: null, createdAt: NOW, updatedAt: NOW },
  {
    id: 'd-deploy',
    title: 'Deployment Handleiding',
    type: 'document',
    parentId: 'f-dev',
    content: DEPLOYMENT_CONTENT,
    author: 'Damian',
    tags: ['Development', 'Production', 'Next.js'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-git',
    title: 'Git Workflow',
    type: 'document',
    parentId: 'f-dev',
    content: GIT_WORKFLOW_CONTENT,
    author: 'Damian',
    tags: ['Development', 'Git'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-api',
    title: 'API Standards',
    type: 'document',
    parentId: 'f-dev',
    content: API_STANDARDS_CONTENT,
    author: 'Damian',
    tags: ['Development', 'API'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // Klanten
  { id: 'f-klanten', title: 'Klanten', type: 'folder', parentId: null, createdAt: NOW, updatedAt: NOW },
  {
    id: 'd-pokebowl',
    title: 'Pokebowl Original',
    type: 'document',
    parentId: 'f-klanten',
    content: POKEBOWL_CONTENT,
    author: 'Damian',
    tags: ['Klant', 'Horeca'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-iri',
    title: 'IRI Services',
    type: 'document',
    parentId: 'f-klanten',
    content: IRI_CONTENT,
    author: 'Damian',
    tags: ['Klant'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-soupy',
    title: 'Soupy',
    type: 'document',
    parentId: 'f-klanten',
    content: SOUPY_CONTENT,
    author: 'Damian',
    tags: ['Klant', 'Horeca'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // Sales
  { id: 'f-sales', title: 'Sales', type: 'folder', parentId: null, createdAt: NOW, updatedAt: NOW },
  {
    id: 'd-offerte',
    title: 'Offerte Templates',
    type: 'document',
    parentId: 'f-sales',
    content: OFFERTE_CONTENT,
    author: 'Damian',
    tags: ['Sales', 'Template'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-pricing',
    title: 'Pricing',
    type: 'document',
    parentId: 'f-sales',
    content: PRICING_CONTENT,
    author: 'Damian',
    tags: ['Sales'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-leadflow',
    title: 'Lead Flow',
    type: 'document',
    parentId: 'f-sales',
    content: LEAD_FLOW_CONTENT,
    author: 'Damian',
    tags: ['Sales', 'Proces'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // Hosting
  { id: 'f-hosting', title: 'Hosting', type: 'folder', parentId: null, createdAt: NOW, updatedAt: NOW },
  {
    id: 'd-vercel',
    title: 'Vercel',
    type: 'document',
    parentId: 'f-hosting',
    content: VERCEL_CONTENT,
    author: 'Damian',
    tags: ['Hosting'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-cloudflare',
    title: 'Cloudflare',
    type: 'document',
    parentId: 'f-hosting',
    content: CLOUDFLARE_CONTENT,
    author: 'Damian',
    tags: ['Hosting', 'DNS'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-domeinen',
    title: 'Domeinen',
    type: 'document',
    parentId: 'f-hosting',
    content: DOMEINEN_CONTENT,
    author: 'Damian',
    tags: ['Hosting', 'Domeinen'],
    createdAt: NOW,
    updatedAt: NOW,
  },

  // Finance
  { id: 'f-finance', title: 'Finance', type: 'folder', parentId: null, createdAt: NOW, updatedAt: NOW },
  {
    id: 'd-btw',
    title: 'BTW uitleg',
    type: 'document',
    parentId: 'f-finance',
    content: BTW_CONTENT,
    author: 'Damian',
    tags: ['Finance', 'BTW'],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 'd-facturatie',
    title: 'Facturatie',
    type: 'document',
    parentId: 'f-finance',
    content: FACTURATIE_CONTENT,
    author: 'Damian',
    tags: ['Finance', 'Moneybird'],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

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

**Datum:** 2026-05-12
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

**Datum:** 2026-05-12
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
