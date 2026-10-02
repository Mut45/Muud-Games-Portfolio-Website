# MU — Games & experiments

A minimal, static game-development portfolio. Vanilla JavaScript, Vite, SCSS and Three.js; no framework or backend. The homepage includes About Me and three games, with configurable GLB models or geometric placeholders. `AGENTS.md` is the permanent project specification.

## Run locally

Use Node.js 22.12+ (or 20.19+).

```sh
npm install
npm run dev
npm run build
npm run preview
```

Vite prints the local URL. `npm run build` produces `dist/`; `npm run preview` serves that production build. Do not open `index.html` directly from the filesystem.

## Deploy to GitHub Pages

1. Push this directory to a GitHub repository, including `package-lock.json`.
2. In **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Push to `main`, or run the **Deploy portfolio to GitHub Pages** workflow manually.

The included workflow builds and uploads `dist/`. `vite.config.js` uses `base: './'`, so scripts and static assets work at both a root domain and `https://username.github.io/portfolio/`. Project model and future case-study paths are resolved relative to the homepage with `assetUrl()`; store these paths without a leading slash. Deployment is configured, not performed automatically by local setup.

## Edit the portfolio

The homepage begins with an About Me object, followed by the games. Clicking the About object or title opens `about.html`; the Games navigation link jumps to the first game. Its placeholder bust, warm accent line, and divider distinguish it from the project sections.

Edit the named `about` export in **`src/data/projects.js`** to set your introduction and personal interests. The initial text and three interests are explicitly editable placeholders. Each interest supports any number of photos with alt text and optional captions:

```js
images: [
  { src: 'images/my-photo.jpg', alt: 'Describe the photograph', caption: 'Optional caption' },
],
```

Place the photos in `public/images/`. An empty `images` array shows a photo placeholder. The About model supports the same `model`, `modelScale`, `rotationOffset`, and camera options as games. Vite builds both `index.html` and `about.html` for GitHub Pages; individual game case-study pages are still future work.

All project content lives in **`src/data/projects.js`**. The homepage sections and project panels use that data. Add an object to add another project; the counters and scroll detection update automatically.

Place future GLB models in **`public/models/`**, then change the relevant `model: null` to `model: 'models/my-project.glb'`. The loader preloads configured models, caches them, centers their bounds, and normalizes the longest dimension. If loading fails, the geometric placeholder remains available. Textures preserve their original filtering by default.

Optional per-project overrides:

```js
{
  // ...title, subtitle, description, role, tools, id, page, placeholder...
  model: 'models/my-project.glb',
  modelScale: 1.25,              // Multiplier after bounds normalization
  rotationOffset: [0, 0.3, 0],  // Euler angles in radians
  camera: { azimuth: 0.3, polar: 1.2, distance: 5.4 },
  cameraDistance: 5.4,          // Optional shorthand overriding camera.distance
  pixelSize: 3,
  nearestTextureFiltering: false,
}
```

For Draco-compressed GLBs later, configure a Three.js `DRACOLoader` and call `loader.setDRACOLoader(...)` in `ModelManager.js`; host its decoder files with the static assets. No decoder or extra asset pipeline is downloaded in this first version.

The **View project** links intentionally point to future `projects/*.html` pages; those pages do not exist yet. Their coming-soon label makes this explicit. When adding pages later, include them as Vite multi-page build entries. Do not place unprocessed source JavaScript in `public/`.

## Project popup media

Each game's `media` array in `src/data/projects.js` controls the gallery order. Replace `media: placeholderMedia` with your own entries:

```js
media: [
  { type: 'image', src: 'images/small/screenshot-01.webp', alt: 'Two players exploring a dark room' },
  { type: 'image', src: 'images/small/screenshot-02.webp', alt: 'A view of the maze' },
  { type: 'youtube', videoId: 'YOUR_VIDEO_ID', title: 'Small — gameplay trailer' },
  { type: 'video', src: 'videos/small/gameplay.webm', poster: 'images/small/gameplay-thumb.webp', title: 'Small — gameplay footage' },
],
```

Put images in `public/images/small/` and local videos in `public/videos/small/`. Use paths without a leading slash or `public/` prefix. YouTube entries take an actual 11-character video ID, not iframe HTML. Their thumbnail is generated automatically; add `thumbnail: 'images/small/trailer-thumb.webp'` for a custom thumbnail. Image entries can also provide a separate `thumbnail` file for faster loading. Empty media arrays hide the gallery.

The popup uses a large contained preview and native horizontally scrolling thumbnail buttons. Arrow controls appear on overflow. The first item is selected on opening; a first-item YouTube video stays a poster until explicitly played. Selecting a YouTube thumbnail creates a privacy-enhanced iframe and requests playback; browser settings may still require using the player's play button. Local videos have native controls and do not autoplay. Switching media, closing the popup, or changing projects tears down players so playback cannot continue invisibly. No external gallery library or YouTube JavaScript API is needed.

The shared `placeholderMedia` entries are deliberately labeled local SVG placeholders, not gameplay screenshots. No example YouTube video or local test footage is published with the site.

## Adjust the viewer

| Setting | Location |
| --- | --- |
| Pixel size and normal/depth edge strengths | `renderSettings` in `src/three/PostProcessing.js` |
| Damping, rotation speed, polar limits | `orbitSettings` in `src/three/Scene.js` |
| Default camera | `defaultCamera` in `src/three/Scene.js` |
| Per-project camera, model size, pixel override | `src/data/projects.js` |
| Click/drag threshold (6 CSS pixels), raycasting | `src/three/Interaction.js` |
| Transition duration (560ms / reduced motion 80ms) | `activate()` / `tick()` in `src/three/Scene.js` |
| Colors, typography, panel and mobile layout | `src/styles/main.scss` |

## Interaction and architecture

- One fixed renderer, scene, camera and EffectComposer serve all projects. Only the 3D scene receives `RenderPixelatedPass`; all interface text is HTML.
- HTML sections use an IntersectionObserver at the viewport midpoint. Native document scrolling selects projects. Each model follows the center of its own HTML section as it scrolls through the viewport; the shared canvas stays fixed. Outgoing models retain their section position until the transition swaps models. Wheel zoom and panning are disabled in OrbitControls.
- A transparent interaction surface follows the model's projected bounds. Touch gestures outside that area scroll the page normally. Gestures starting on the object rotate it. Raycasting gates rotation, hover and click actions; accumulated pointer movement separates clicking from dragging.
- The camera recenters during project transitions. Idle movement is restrained and pauses while inspecting. Reduced-motion preferences disable idle animation and shorten transitions.
- Desktop panels open on the right; mobile panels rise from the bottom and scroll internally. The object shifts to stay visible. Close with ×, Escape, or an empty-area click.
- Project title buttons are keyboard-accessible alternatives to clicking models. Panels are non-modal, receive focus on opening and restore focus on close. If WebGL initialization or model loading fails, HTML project information remains accessible.
- Render pixel ratio is capped at 2; renderer, composer and camera resize together.

## Files

`src/main.js` connects the data, UI and lazy-loaded viewer. `src/three/` owns rendering, models and pointer interaction. `src/ui/` owns HTML sections and panels. `src/about.js` renders the introduction, interests, and image galleries in `about.html`. `public/models/` and `public/images/` hold your assets. Individual game case-study pages are not included.

## First-version verification

`npm install` and `npm run build` completed successfully. Both the development server and production preview were started. Headless Edge checks against the production preview passed for desktop and mobile layouts, one persistent canvas, all three project panels, wheel scrolling over the object, dragging without opening a panel, Escape/close/outside-click dismissal, viewport resizing, reduced-motion rendering, and HTML project access with WebGL disabled. Touch emulation confirmed page scrolling outside the model and model dragging without opening a panel. Desktop and mobile screenshots were visually reviewed. Physical phone testing has not been performed.

Vite reports a non-blocking chunk-size advisory for the lazy-loaded Three.js viewer (approximately 159 KB gzipped). The base HTML/UI bundle remains separate. `OutputPass` performs the necessary display-color conversion after pixel rendering; no extra visual effects or custom shaders are added.
