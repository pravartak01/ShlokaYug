export interface KidsActivity {
  id: number;
  title: string;
  description: string;
  colors: string[];
  icon: string;
  route: string;
  badge?: string;
}

export const kidsActivities: KidsActivity[] = [
  {
    id: 1,
    title: 'Syllable Fun',
    description: 'Learn syllables with big colorful letters!',
    colors: ['#fbbf24', '#f59e0b'],
    icon: 'musical-notes',
    route: '/kids/syllable-fun',
  },
  {
    id: 2,
    title: 'Memory Boost',
    description: 'Complete the verse game!',
    colors: ['#ec4899', '#db2777'],
    icon: 'bulb',
    route: '/kids/memory-boost',
    badge: 'GAME',
  },
  {
    id: 3,
    title: 'Tap the Beat',
    description: 'Match the rhythm patterns!',
    colors: ['#3b82f6', '#2563eb'],
    icon: 'hand-left',
    route: '/kids/tap-beat',
    badge: 'FUN',
  },
  {
    id: 4,
    title: 'Om Sounds',
    description: 'Peaceful mantras and chanting',
    colors: ['#8b5cf6', '#7c3aed'],
    icon: 'flower',
    route: '/kids/om-sounds',
  },
  {
    id: 5,
    title: 'Visual Beats',
    description: 'See the rhythm with animations!',
    colors: ['#06b6d4', '#0891b2'],
    icon: 'eye',
    route: '/kids/visual-beats',
  },
  {
    id: 6,
    title: 'Slow Mode',
    description: 'Easy chunked learning',
    colors: ['#10b981', '#059669'],
    icon: 'time',
    route: '/kids/slow-mode',
  },
  {
    id: 7,
    title: 'My Rewards',
    description: 'See your stars and achievements!',
    colors: ['#f59e0b', '#d97706'],
    icon: 'trophy',
    route: '/kids/rewards',
    badge: 'COOL',
  },
  {
    id: 8,
    title: 'Calm Sounds',
    description: 'Soothing music to relax',
    colors: ['#a855f7', '#9333ea'],
    icon: 'headset',
    route: '/kids/calm-sounds',
  },
];
