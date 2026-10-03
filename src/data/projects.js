// Original sample content. Use paths without a leading slash for GitHub Pages.
export const about = {
  id: 'about', kind: 'about', title: 'About me', subtitle: 'The person behind the games',
  placeholder: 'portrait', model: 'models/about_me.glb', color: '#d1c4a0', page: 'about.html',
  camera: { azimuth: 0.25, polar: 1.3, distance: 5 }, modelScale: 2,
  introduction: 'I am an aspiring game developer/designer who also has experience in technical art and project management.',
  // Separate description paragraphs with \n\n. Images appear in array order.
  // images: [{ src: 'images/about/photo.jpg', alt: 'What the photo shows', caption: 'Description below the photo' }]
  interests: [
    { id: 'interest-one', title: 'Competitive Game Coaching', description: 'I peaked at #97 in Apex Legends during Competitive Season 3 and have ranked within the top 300 across multiple seasons, playing on both keyboard and mouse and controller. I also reached Immortal in Valorant on both the Hong Kong and North American servers. \n\nMore recently, I have been coaching players who want to improve and rank up in competitive shooters. My coaching covers VOD reviews, general strategy, gaming peripheral setups, and healthy posture habits for long gaming sessions.', images: [{ src: 'images/about/coaching_01.png', alt: 'Competitive game coaching', caption: 'Me talking to one of my students about the importance of posture' }, { src: 'images/about/coaching_02.jpg', alt: 'Apex Predator rank in Apex Legends', caption: 'I reached Apex Predator(top #750 in the world) across multiple seasons on both mouse & keyboard and controller' }] },
    { id: 'interest-two', title: 'Film Analysis & Background Explanation', description: 'Use this section for another part of your life outside game development. A favorite place, creative pursuit, or hobby can go here.', images: [] },
    { id: 'interest-three', title: 'Storyboarding Beginner', description: 'Add another interest and the story behind it. Include photos and captions to make this section your own.', images: [] },
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
    id: 'small', title: 'Small', subtitle: 'A co-op horror game',
    media: placeholderMedia,
    description: 'One day, you wake up to find yourself impossibly SMALL. Your only hope is your best friend, Grey Grey the teddy bear. Together, the two of you must rely on each other to navigate your way through a horrifying maze and find a way out.',
    role: 'Game design / Programming', tools: ['Unity', 'C#', 'Blender', 'Audacity'],
    placeholder: 'structure', model: 'models/game_small.glb', page: 'projects/small.html',
    year: '2026', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'dog-of-war', title: 'Dog of War', subtitle: 'An exploration experiment',
    media: placeholderMedia,
    description: 'A small world with its own gravity. Follow unfamiliar signals and discover what remains on the other side of the horizon.',
    role: 'Game design / Programming', tools: ['Godot', 'Blender'],
    placeholder: 'orbit', model: null, page: 'projects/dog-of-war.html',
    year: '02', color: '#a5b3a9', camera: { azimuth: 0.2, polar: 1.35, distance: 5.4 },
  },
  {
    id: 'may-the-best-bower-win', title: 'May the Best Bower Win', subtitle: 'An atmospheric adventure',
    media: placeholderMedia,
    description: 'Somewhere between the stations, a signal is still repeating. Piece together its fragments in a quiet world of forgotten machines.',
    role: 'Game design / Technical art', tools: ['Unity', 'C#', 'Blender'],
    placeholder: 'signal', model: null, page: 'projects/may-the-best-bower-win.html',
    year: '03', color: '#c59a7c', camera: { azimuth: 0.4, polar: 1.3, distance: 5.4 },
  },
];

export const assetUrl = (path) => new URL(`${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, document.baseURI).href;
export default projects;
