// Original sample content. Use paths without a leading slash for GitHub Pages.
export const about = {
  id: 'about', kind: 'about', title: 'About me', subtitle: 'The person behind the games',
  placeholder: 'portrait', model: 'models/about_me.glb', color: '#d1c4a0', page: 'about.html',
  camera: { azimuth: 0.25, polar: 1.3, distance: 5 }, modelScale: 2,
  introduction: 'I am an aspiring game developer/designer who also has experience in technical art and project management.',
  // Separate description paragraphs with \n\n. Images appear in array order.
  // images: [{ src: 'images/about/photo.jpg', alt: 'What the photo shows', caption: 'Description below the photo' }]
  // For mixed galleries, use media instead of images (existing images arrays still work):
  // media: [{ type: 'image', src: 'images/about/photo.jpg', alt: 'Photo description', caption: 'Caption' },
  //   { type: 'audio', src: 'audio/commentary.mp3', poster: 'images/about/cover.jpg', caption: 'Audio caption' },
  //   { type: 'video', src: 'videos/clip.mp4', poster: 'images/about/cover.jpg', caption: 'Video caption' }]
  // poster is optional. Media files live in public/; omit public/ from these paths.
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
    id: 'small', title: 'Small', subtitle: 'A co-op horror game',
    media: [
      { type: 'youtube', videoId: 'rz8EtRdP3f4', title: 'Small — video' },
      ...placeholderMedia.slice(1),
    ],
    description: 'One day, you wake up to find yourself impossibly SMALL. Your only hope is your best friend, Grey Grey the teddy bear. Together, the two of you must rely on each other to navigate your way through a horrifying maze and find a way out.',
    role: 'Game design / Programming', tools: ['Unity', 'C#', 'Blender', 'Audacity'],
    placeholder: 'structure', model: 'models/game_small.glb', page: 'projects/small.html',
    year: '2026', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'dog-of-war', title: 'Dog of War', subtitle: 'An action sandbox war satire',
    media: [
      { type: 'youtube', videoId: 'Cpi_q6W4fEg', title: 'Dog of War — video' },
      ...placeholderMedia.slice(1),
    ],
    description: 'A small world with its own gravity. Follow unfamiliar signals and discover what remains on the other side of the horizon.',
    role: 'Game design / Programming', tools: ['Unity', 'C#', 'Substance Painter', 'Blender'],
    placeholder: 'orbit', model: 'models/game_dog_of_war.glb', page: 'projects/dog-of-war.html',
    year: '02', color: '#a5b3a9', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'may-the-best-bower-win', title: 'May the Best Bower Win', subtitle: 'An atmospheric adventure',
    media: [
      { type: 'youtube', videoId: 'SJfABTCV1qs', title: 'May the Best Bower Win — video' },
      ...placeholderMedia,
    ],
    description: 'Somewhere between the stations, a signal is still repeating. Piece together its fragments in a quiet world of forgotten machines.',
    role: 'Game design / Technical art', tools: ['Unity', 'C#', 'Blender'],
    placeholder: 'signal', model: 'models/game_may_the_best_bower_win.glb', page: 'projects/may-the-best-bower-win.html',
    year: '03', color: '#c59a7c', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
  {
    id: 'unfamiliar', title: 'Unfamiliar', subtitle: 'Game project',
    media: [
      { type: 'youtube', videoId: 'vMV_MOVQYiQ', title: 'Unfamiliar — video 1' },
      { type: 'youtube', videoId: 'BMPB1h1oTc8', title: 'Unfamiliar — video 2' },
    ],
    description: 'Project details coming soon.',
    role: 'Details coming soon', tools: ['Details coming soon'],
    placeholder: 'structure', model: 'models/game_unfamiliar.glb', page: 'projects/unfamiliar.html',
    year: '04', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
    rotationOffset: [Math.PI / 3, 0, 0], // Tilt forward 60 degrees.
  },
];

export const assetUrl = (path) => new URL(`${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, document.baseURI).href;
export default projects;
