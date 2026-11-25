// ─────────────────────────────────────────────────────────────
//  YOUR DETAILS — edit this file first. Everything on the site
//  (header, hero, footer, contact page) reads from here.
// ─────────────────────────────────────────────────────────────
export const site = {
  name: 'Your Name',
  firstName: 'Your',
  initials: 'YN',
  title: 'Computer Science Student',

  // The small line above the hero headline
  eyebrow: ['Computer Science', 'Sophomore', 'Your University'],

  // Hero headline. Wrap ONE word in *stars* to make it the burgundy italic accent.
  headline: ['Learning to build,', '*one move*', 'at a time.'],

  intro:
    "I'm a computer science student at the start of my journey. This is where I file everything I learn — my Cisco and Coursera courses, my certificates, and the projects I build at college.",

  availability: 'Currently learning: networking, Python & web',
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
      "I'm a sophomore computer science student. I like chess because every good game is built from small, careful moves — and that's how I'm learning to code.",
      'Right now I am building my foundations: networking with Cisco, programming courses on Coursera, and my first college projects, which I am uploading to GitHub one by one.',
      'This portfolio grows with me. Every course, certificate and project gets its own file here.',
    ],
    timeline: [
      { year: '2025', title: 'Started B.Sc. Computer Science', place: 'Your University' },
      { year: '2025', title: 'First Cisco Networking Academy courses', place: 'Cisco' },
      { year: '2026', title: 'Coursera courses & first college projects', place: 'Coursera · Your University' },
    ],
    interests: ['Chess & strategy games', 'Design', 'Learning new tools', 'Problem solving'],
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
