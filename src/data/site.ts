// ─────────────────────────────────────────────────────────────
//  YOUR DETAILS — edit this file first. Everything on the site
//  (header, hero, footer, contact page) reads from here.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'Your Name',
  firstName: 'Your',
  initials: 'YN',
  title: 'Computer Science Student',

  // The small line above the hero headline (like "CS SENIOR · AI TRACK · UNIVERSITY")
  eyebrow: ['Computer Science', 'Your Track', 'Your University'],

  // Hero headline. Wrap ONE word in *stars* to make it the burgundy italic accent.
  headline: ['I plan every', '*move* before', 'I write a', 'line of code.'],

  intro:
    "I'm a computer science student who treats software like a game of chess — think a few moves ahead, protect the important pieces, and finish clean. I build web apps, machine-learning experiments and networked systems.",

  availability: 'Open to internships & collaborations',
  location: 'Your City',

  email: 'you@example.com',
  github: 'https://github.com/your-username',
  linkedin: 'https://www.linkedin.com/in/your-username',
  cv: '/cv.pdf', // put your CV in /public/cv.pdf
  photo: '', // e.g. '/images/me.jpg' — shown in the header circle and on the About page

  // Your GitHub repository (used by the private "+ Add file" button)
  repo: 'btolasz2080-png/btolasz2080-png.github.io',

  // Free form backend: create a form at formspree.io and paste its URL here,
  // e.g. 'https://formspree.io/f/abcdwxyz'. Leave empty to open the visitor's email app instead.
  formEndpoint: '',

  about: {
    story: [
      "I fell for computer science the way people fall for chess: first the rules, then the patterns, then the quiet thrill of seeing several moves ahead.",
      'Today I split my time between building products people can actually use, studying how machines learn, and understanding the networks that connect everything together.',
      'I like clean architecture, honest documentation and interfaces that feel calm. Outside the screen you will find me at a chessboard, sketching layouts, or learning something new on a course platform.',
    ],
    timeline: [
      { year: '2023', title: 'Started B.Sc. Computer Science', place: 'Your University' },
      { year: '2024', title: 'First networking certification', place: 'Cisco Networking Academy' },
      { year: '2025', title: 'Machine-learning specialization', place: 'Coursera' },
      { year: '2026', title: 'Senior projects & internship search', place: 'Your University' },
    ],
    interests: ['Chess & strategy games', 'Editorial design', 'Open-source', 'Reading about AI ethics'],
  },
};

export const nav = [
  { label: 'Work', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Courses', href: '/courses/' },
  { label: 'Certificates', href: '/certificates/' },
  { label: 'Skills', href: '/skills/' },
  { label: 'Contact', href: '/contact/' },
];
