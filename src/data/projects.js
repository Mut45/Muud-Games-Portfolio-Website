import portfolioMetadata from './portfolio-metadata.json';
import gameMedia from './game-media-manifest.json';

// Original sample content. Use paths without a leading slash for GitHub Pages.
export const about = {
  id: 'about', kind: 'about', title: 'About me', subtitle: 'The person behind the games',
  placeholder: 'portrait', model: 'models/about_me.glb', color: '#d1c4a0', page: 'about/',
  camera: { azimuth: 0.25, polar: 1.3, distance: 5 }, modelScale: 2,
  introduction: 'I am an aspiring game developer/designer who also has experience in technical art and project management.',

  interests: [
    { id: 'interest-one', title: 'Competitive Game Coaching', description: 'I peaked at #97 in Apex Legends during Competitive Season 3 and have ranked within the top 300 across multiple seasons, playing on both keyboard and mouse and controller. I also reached Immortal in Valorant on both the Hong Kong and North American servers. \n\nMore recently, I have been coaching players who want to improve and rank up in competitive shooters. My coaching covers VOD reviews, general strategy, gaming peripheral setups, and healthy posture habits for long gaming sessions.', images: [{ src: 'images/about/coaching_01.png', alt: 'Competitive game coaching', caption: 'Me talking to one of my students about the importance of posture' }, { src: 'images/about/coaching_02.jpg', alt: 'Apex Predator rank in Apex Legends', caption: 'I reached Apex Predator(top #750 in the world) across multiple seasons on both mouse & keyboard and controller' }] },
    { id: 'interest-two', title: 'Road to become the jack of all "100 useless things that you most likely can\'t make a living doing."', 
      description: 'Since college, I have been working on this "challenge" as a hobby to try to learn 100 useless skills. This includes butterfly knife (comb) tricks, whistling, stacking dice , DJing and so on... My most recent project is to get better at guessing the location based on Google Street View (Geo-guessing).', 
      media: [
        { type: 'video', src: 'videos/about/butterfly.webm', caption: 'Butterfly tricks from "Meet the Spy - Team Fortress 2"' },
        { type: 'video', src: 'videos/about/stack_dice.webm', caption: 'Stacking dice' },
        { type: 'video', src: 'videos/about/dj.webm', caption: 'DJing' },
        { type: 'audio', src: 'audio/about/whistle_final.m4a', caption: 'Whistling' },
      ] },
    { id: 'interest-three', title: 'Beginner Artist', description: `I had absolutely zero experience in art before 2026. But I was hugely inspired by Lucas Pope's story of developing Return of the Obra Dinn, in which he was the artist, programmer, musician, and the designer. This motivated me to incorporate more of my own creative work into my games.

 Earlier this year, I started by creating "programmer art" (some examples can be found in my portfolio). From there, I began learning perspective, sketching, and basic drawing skills, designing capsule art , audio engineering, and pretty much anything I would need as an indie game developer.

I also started learning pixel art, character design, and storyboarding. My primary method of practice was sketching storyboards based on scenes from movies and TV shows that I loved (currently , DTF St. Louis is my favorite show to sketch).`, images: [
      { src: 'images/about/3_1.png', alt: 'Art practice example 1', caption: 'The capsule art I designed for my game Dog of War' },
      { src: 'images/about/3_2.png', alt: 'Art practice example 2', caption: 'The character & animation I designed for my pixel platform game Unfamiliar' },
      { src: 'images/about/3_3.png', alt: 'Art practice example 3', caption: 'A "programmer art" sketch I drew for my portfolio' },
      { src: 'images/about/3_4.png', alt: 'Art practice example 4', caption: 'I sketched my friend and her cat in the style of Nana' },
    ] },
  ],
  rotationOffset: [Math.PI / 4, Math.PI / 4, 0],
};

// Replace each game's media array with your screenshots/trailers, in display order.
// Files: public/images/<game>/ and public/videos/<game>/ (omit "public/" in paths).
// YouTube: { type: 'youtube', videoId: 'YOUR_11_CHARACTER_ID', title: 'Gameplay trailer', thumbnail: 'images/<game>/trailer.webp' }
// Local video: { type: 'video', src: 'videos/<game>/gameplay.webm', poster: 'images/<game>/trailer.webp', title: 'Gameplay footage' }
// The YouTube thumbnail field is optional; the gallery generates one from videoId.
const placeholderMedia = [
  { type: 'image', src: 'images/placeholders/screenshot-01.svg', alt: 'Screenshot 01 — placeholder' },
  { type: 'image', src: 'images/placeholders/screenshot-02.svg', alt: 'Screenshot 02 — placeholder' },
];

const projects = [
  {
    id: 'small', title: 'Small', subtitle: 'Co-op Horror Game',
    media: [
      { type: 'youtube', videoId: 'rz8EtRdP3f4', title: 'Small — video' },
      ...placeholderMedia.slice(1),
    ],
    description: 'One day, you wake up to find yourself impossibly SMALL. Your only hope is your best friend, Grey Grey the teddy bear. Together, the two of you must rely on each other to navigate your way through a horrifying maze and find a way out.',
    role: 'Game Designer / Programmer', tools: ['Unity', 'C#', 'Blender', 'Audacity'],
    placeholder: 'structure', model: 'models/game_small.glb', page: 'projects/small.html',
    year: '2026', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'dog-of-war', title: 'Dog of War', subtitle: 'Action Sandbox War Satire',
    media: [
      { type: 'youtube', videoId: 'Cpi_q6W4fEg', title: 'Dog of War — video' },
      ...placeholderMedia.slice(1),
    ],
    description: 'You wake up to the irresistible smell of meat... oh, and in the middle of the war of the century. What you do next is up to you.',
    role: 'Team Lead / Game Designer / Programmer / Technical Artist', tools: ['Unity', 'C#', 'Substance Painter', 'Blender'],
    placeholder: 'orbit', model: 'models/game_dog_of_war.glb', page: 'projects/dog-of-war.html',
    year: '2026', color: '#a5b3a9', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'may-the-best-bower-win', title: 'May the Best Bower Win', subtitle: 'Online 1v1 Hide & Seek',
    media: [
      { type: 'youtube', videoId: 'SJfABTCV1qs', title: 'May the Best Bower Win — video' },
      ...placeholderMedia,
    ],
    description: 'In this 1v1 multiplayer game, you play as either King Jack or Joker. Joker can disguise himself and hide, and King Jack needs to catch him. Who will win and take the spot as the best bower?',
    role: 'Team Lead/ Game Designer / Technical Artist', tools: ['Unity', 'C#', 'Photoshop'],
    placeholder: 'signal', model: 'models/game_may_the_best_bower_win.glb', page: 'projects/may-the-best-bower-win.html',
    year: '2026', color: '#c59a7c', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'unfamiliar', title: 'Unfamiliar', subtitle: '2D Puzzle Platformer',
    media: [
      { type: 'youtube', videoId: 'vMV_MOVQYiQ', title: 'Unfamiliar — video 1' },
      { type: 'youtube', videoId: 'BMPB1h1oTc8', title: 'Unfamiliar — video 2' },
    ],
    description: 'Have you ever wondered how your elemental familiars in RPG games are feeling when you are not busy using them to do your deeds? Well, in this 2D platformer, Flamie, the fire familiar, is not happy, and he wants to break free.',
    role: 'Programmer/ Game Designer / 2D Pixel Artist', tools: ['Aseprite', 'Unity', 'C#'],
    placeholder: 'structure', model: 'models/game_unfamiliar.glb', page: 'projects/unfamiliar.html',
    year: '2026', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
];

// Keep authored videos and media, replacing sample images when real screenshots exist.
for (const project of projects) {
  const screenshots = gameMedia[project.portfolioSlug ?? project.id.replaceAll('-', '_')] ?? [];
  if (!screenshots.length) continue;
  const media = (project.media ?? []).filter(item => !item.src?.startsWith('images/placeholders/'));
  const existingSources = new Set(media.map(item => item.src));
  project.media = [...media, ...screenshots.filter(image => !existingSources.has(image.src)).map((image, index) => ({
    type: 'image', ...image, alt: `${project.title} — screenshot ${index + 1}`,
  }))];
}

// Nested HTML pages declare their relative site root so public media resolves
// from the portfolio root, including when hosted under a GitHub Pages repository.
const siteRoot = new URL(document.querySelector('meta[name="site-root"]')?.content ?? import.meta.env.BASE_URL, document.baseURI);
// Edit banner text and optional cover overrides in portfolio-metadata.json.
// portfolio:update adds missing project entries without replacing authored values.
export { portfolioMetadata };
export function portfolioDetails(slug) {
  const existing = projects.find(project => project.id === slug.replaceAll('_', '-'));
  return { title: existing?.title ?? slug.replaceAll(/[_-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()), description: '', ...portfolioMetadata[slug] };
}
export const assetUrl = (path) => new URL(path.replace(/^\/+/, ''), siteRoot).href;
export default projects;
