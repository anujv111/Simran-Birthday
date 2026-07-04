// Mock data for Simran Singh's Birthday Netflix Clone (5 July)

export const profiles = [
  {
    id: 'p1',
    name: 'Simran',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&w=300&h=300&fit=crop&q=85',
    color: '#e50914'
  },
  {
    id: 'p2',
    name: 'Family',
    avatar: 'https://images.unsplash.com/photo-1531123414780-f74242c2b052?crop=entropy&cs=srgb&fm=jpg&w=300&h=300&fit=crop&q=85',
    color: '#0071eb'
  },
  {
    id: 'p3',
    name: 'Friends',
    avatar: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=srgb&fm=jpg&w=300&h=300&fit=crop&q=85',
    color: '#f5a623'
  },
  {
    id: 'p4',
    name: 'Kids',
    avatar: 'https://images.unsplash.com/photo-1629747490241-624f07d70e1e?crop=entropy&cs=srgb&fm=jpg&w=300&h=300&fit=crop&q=85',
    color: '#7ed321'
  }
];

export const heroContent = {
  id: 'hero1',
  title: 'Simran Singh',
  subtitle: 'Happy Birthday! · 05 July',
  description: "Celebrating the most amazing person today. A journey of laughter, love, and beautiful memories — all captured in one place. Grab your popcorn and let's relive the moments that make Simran, Simran.",
  backdrop: 'https://images.unsplash.com/photo-1607482369189-a53b6e71fa48?crop=entropy&cs=srgb&fm=jpg&w=1920&h=1080&fit=crop&q=90',
  logo: null,
  match: '99% Match',
  year: '2025',
  duration: 'A Lifetime',
  rating: 'U/A'
};

const img = (u) => u;

export const categories = [
  {
    id: 'c1',
    title: 'Birthday Highlights',
    items: [
      { id: 'i1', title: 'The Big Day', type: 'photo', year: '2025', duration: '1 min', tag: 'NEW', image: img('https://images.unsplash.com/photo-1583875762487-5f8f7c718d14?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: "July 5th — the day the world got a little brighter. Simran's birthday moments captured forever." },
      { id: 'i2', title: 'Candles & Wishes', type: 'photo', year: '2025', duration: '2 min', tag: 'HOT', image: img('https://images.unsplash.com/photo-1607482369189-a53b6e71fa48?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'Make a wish, Simran! The candles are lit and hearts are full.' },
      { id: 'i3', title: 'Cake Cutting Ceremony', type: 'video', year: '2025', duration: '3 min', tag: 'NEW', image: img('https://images.unsplash.com/photo-1640506054499-2b040ca19023?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'The most iconic slice of the year. Sweet moments made sweeter.' },
      { id: 'i4', title: 'The Grand Entry', type: 'photo', year: '2025', duration: '30 sec', tag: '', image: img('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'When she walked in, everyone stopped. That aura, unmatched.' },
      { id: 'i5', title: 'Confetti Storm', type: 'photo', year: '2025', duration: '15 sec', tag: '', image: img('https://images.unsplash.com/photo-1513151233558-d860c5398176?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'A rain of colors, joy, and screams of happy birthday!' },
      { id: 'i6', title: 'Party Vibes', type: 'photo', year: '2025', duration: '2 min', tag: '', image: img('https://images.unsplash.com/photo-1517263904808-5dc91e3e7044?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'The night got loud, the dance floor got louder.' }
    ]
  },
  {
    id: 'c2',
    title: 'Memories with Simran',
    items: [
      { id: 'i7', title: 'Golden Hour Smiles', type: 'photo', year: '2024', duration: '1 min', tag: '', image: img('https://images.unsplash.com/photo-1535295972055-1c762f4483e5?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'That one perfect shot that says everything without a word.' },
      { id: 'i8', title: 'Coffee Chronicles', type: 'photo', year: '2024', duration: '2 min', tag: '', image: img('https://images.pexels.com/photos/7562179/pexels-photo-7562179.jpeg?auto=compress&cs=tinysrgb&w=600&h=340&fit=crop'), description: "Mornings that turned into afternoons — because Simran's stories never end." },
      { id: 'i9', title: 'The Best Laughs', type: 'video', year: '2024', duration: '4 min', tag: 'FAV', image: img('https://images.unsplash.com/photo-1531686264889-56fdcabd163f?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'Warning: contagious laughter ahead. Play at your own risk.' },
      { id: 'i10', title: 'Sunset Walks', type: 'photo', year: '2023', duration: '1 min', tag: '', image: img('https://images.pexels.com/photos/37159572/pexels-photo-37159572.jpeg?auto=compress&cs=tinysrgb&w=600&h=340&fit=crop'), description: 'Simple walks, deep talks, unforgettable memories.' },
      { id: 'i11', title: 'Old School Days', type: 'photo', year: '2020', duration: '3 min', tag: '', image: img('https://images.pexels.com/photos/10165858/pexels-photo-10165858.jpeg?auto=compress&cs=tinysrgb&w=600&h=340&fit=crop'), description: "Throwback to when we didn't know how good these days were." },
      { id: 'i12', title: 'Weekend Escape', type: 'photo', year: '2024', duration: '2 min', tag: '', image: img('https://images.unsplash.com/photo-1485872299829-c673f5194813?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'Because Simran always finds the best getaways.' }
    ]
  },
  {
    id: 'c3',
    title: 'Family & Friends',
    items: [
      { id: 'i13', title: 'Family First', type: 'photo', year: '2025', duration: '2 min', tag: '', image: img('https://images.unsplash.com/photo-1531123414780-f74242c2b052?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'The people who love her the most. Endless love, forever.' },
      { id: 'i14', title: 'Squad Goals', type: 'video', year: '2024', duration: '5 min', tag: 'HOT', image: img('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'The chosen family. Chaos, love, and legendary nights.' },
      { id: 'i15', title: 'Birthday Wishes Reel', type: 'video', year: '2025', duration: '6 min', tag: 'NEW', image: img('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'A compilation of heartfelt wishes from everyone who loves you.' },
      { id: 'i16', title: 'Bestie Vibes', type: 'photo', year: '2024', duration: '1 min', tag: '', image: img('https://images.pexels.com/photos/32333378/pexels-photo-32333378.jpeg?auto=compress&cs=tinysrgb&w=600&h=340&fit=crop'), description: 'Best friends. Best memories. Best forever.' },
      { id: 'i17', title: 'Cousin Chronicles', type: 'photo', year: '2023', duration: '2 min', tag: '', image: img('https://images.unsplash.com/photo-1558636508-e0db3814bd1d?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'Cousins by blood, friends by choice.' }
    ]
  },
  {
    id: 'c4',
    title: 'Trending Now',
    items: [
      { id: 'i18', title: 'The Iconic Pose', type: 'photo', year: '2025', duration: '10 sec', tag: '#1', image: img('https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: "The pose that broke the internet on Simran's birthday." },
      { id: 'i19', title: 'Dance Floor Diaries', type: 'video', year: '2025', duration: '3 min', tag: '#2', image: img('https://images.unsplash.com/photo-1569415860599-5514567fde28?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'When Simran hits the dance floor, magic happens.' },
      { id: 'i20', title: 'Surprise Reveal', type: 'video', year: '2025', duration: '2 min', tag: '#3', image: img('https://images.unsplash.com/photo-1583875762487-5f8f7c718d14?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'The moment she saw the surprise. Priceless reaction.' },
      { id: 'i21', title: 'Balloon Wonderland', type: 'photo', year: '2025', duration: '30 sec', tag: '#4', image: img('https://images.unsplash.com/photo-1513151233558-d860c5398176?crop=entropy&cs=srgb&fm=jpg&w=600&h=340&fit=crop&q=85'), description: 'A room full of balloons. A heart full of love.' }
    ]
  }
];

export const getAllItems = () => categories.flatMap(c => c.items);
