export interface PresetGif {
  id: string;
  url: string;
  alt: string;
  category: 'laugh' | 'shame' | 'shocked' | 'applause' | 'drama';
}

// Define ~25 preset GIFs (5 per category)
export const PRESET_GIFS: PresetGif[] = [
  // Laugh (5)
  { id: 'laugh-1', url: '/gifs/reactions/laugh-1.gif', alt: 'Lachen', category: 'laugh' },
  { id: 'laugh-2', url: '/gifs/reactions/laugh-2.gif', alt: 'Lol', category: 'laugh' },
  { id: 'laugh-3', url: '/gifs/reactions/laugh-3.gif', alt: 'Grappig', category: 'laugh' },
  { id: 'laugh-4', url: '/gifs/reactions/laugh-4.gif', alt: 'Hilarious', category: 'laugh' },
  { id: 'laugh-5', url: '/gifs/reactions/laugh-5.gif', alt: 'Haha', category: 'laugh' },

  // Shame (5)
  { id: 'shame-1', url: '/gifs/reactions/shame-1.gif', alt: 'Schande', category: 'shame' },
  { id: 'shame-2', url: '/gifs/reactions/shame-2.gif', alt: 'Beschaamd', category: 'shame' },
  { id: 'shame-3', url: '/gifs/reactions/shame-3.gif', alt: 'Face Palm', category: 'shame' },
  { id: 'shame-4', url: '/gifs/reactions/shame-4.gif', alt: 'Pijnlijk', category: 'shame' },
  { id: 'shame-5', url: '/gifs/reactions/shame-5.gif', alt: 'Oeps', category: 'shame' },

  // Shocked (5)
  { id: 'shocked-1', url: '/gifs/reactions/shocked-1.gif', alt: 'Verrast', category: 'shocked' },
  { id: 'shocked-2', url: '/gifs/reactions/shocked-2.gif', alt: 'Wow', category: 'shocked' },
  { id: 'shocked-3', url: '/gifs/reactions/shocked-3.gif', alt: 'Ongelooflijk', category: 'shocked' },
  { id: 'shocked-4', url: '/gifs/reactions/shocked-4.gif', alt: 'Geschokt', category: 'shocked' },
  { id: 'shocked-5', url: '/gifs/reactions/shocked-5.gif', alt: 'Verbaasd', category: 'shocked' },

  // Applause (5)
  { id: 'applause-1', url: '/gifs/reactions/applause-1.gif', alt: 'Klappen', category: 'applause' },
  { id: 'applause-2', url: '/gifs/reactions/applause-2.gif', alt: 'Bravo', category: 'applause' },
  { id: 'applause-3', url: '/gifs/reactions/applause-3.gif', alt: 'Staande ovatie', category: 'applause' },
  { id: 'applause-4', url: '/gifs/reactions/applause-4.gif', alt: 'Geweldig', category: 'applause' },
  { id: 'applause-5', url: '/gifs/reactions/applause-5.gif', alt: 'Felicitaties', category: 'applause' },

  // Drama (5)
  { id: 'drama-1', url: '/gifs/reactions/drama-1.gif', alt: 'Drama', category: 'drama' },
  { id: 'drama-2', url: '/gifs/reactions/drama-2.gif', alt: 'Ogen rollen', category: 'drama' },
  { id: 'drama-3', url: '/gifs/reactions/drama-3.gif', alt: 'Theatraal', category: 'drama' },
  { id: 'drama-4', url: '/gifs/reactions/drama-4.gif', alt: 'Overdreven', category: 'drama' },
  { id: 'drama-5', url: '/gifs/reactions/drama-5.gif', alt: 'Spectaculair', category: 'drama' },
];

export const GIF_CATEGORIES = {
  laugh: { label: 'Lachen', emoji: '😂' },
  shame: { label: 'Schaamte', emoji: '🙈' },
  shocked: { label: 'Verbaasd', emoji: '😱' },
  applause: { label: 'Applaus', emoji: '👏' },
  drama: { label: 'Drama', emoji: '🙄' },
};

export function getGifById(id: string): PresetGif | undefined {
  return PRESET_GIFS.find((g) => g.id === id);
}

export function getGifsByCategory(category: PresetGif['category']): PresetGif[] {
  return PRESET_GIFS.filter((g) => g.category === category);
}
