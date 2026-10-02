// Original sample content. Use paths without a leading slash for GitHub Pages.
const projects = [
  {
    id: 'silent-structure', title: 'Silent Structure', subtitle: 'An architectural puzzle',
    description: 'A place that rearranges itself when you look away. Explore an impossible structure, uncover its rules, and find a way through.',
    role: 'Game design / Programming', tools: ['Unity', 'C#', 'Blender'],
    placeholder: 'structure', model: 'models/test_01.glb', page: 'projects/silent-structure.html',
    year: '01', color: '#c7c5b7', camera: { azimuth: 0.45, polar: 1.2, distance: 5.4 },
    modelScale: 2,
  },
  {
    id: 'small-orbit', title: 'Small Orbit', subtitle: 'An exploration experiment',
    description: 'A small world with its own gravity. Follow unfamiliar signals and discover what remains on the other side of the horizon.',
    role: 'Game design / Programming', tools: ['Godot', 'Blender'],
    placeholder: 'orbit', model: null, page: 'projects/small-orbit.html',
    year: '02', color: '#a5b3a9', camera: { azimuth: 0.2, polar: 1.35, distance: 5.4 },
  },
  {
    id: 'last-signal', title: 'Last Signal', subtitle: 'An atmospheric adventure',
    description: 'Somewhere between the stations, a signal is still repeating. Piece together its fragments in a quiet world of forgotten machines.',
    role: 'Game design / Technical art', tools: ['Unity', 'C#', 'Blender'],
    placeholder: 'signal', model: null, page: 'projects/last-signal.html',
    year: '03', color: '#c59a7c', camera: { azimuth: 0.4, polar: 1.3, distance: 5.4 },
  },
];

export const assetUrl = (path) => new URL(`${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`, document.baseURI).href;
export default projects;
