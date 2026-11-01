# MU — Games & experiments

## Page URLs

The homepage is served at the site's root (`/` locally or `/repository/` on
GitHub Pages). About is served at `about/` using `about/index.html`.
Use the trailing slash when linking to a page directory.

Vite builds all HTML entries. Its relative `base` keeps the output portable
between a domain root and a GitHub Pages repository path. Nested pages declare
their relative site root with `<meta name="site-root" content="../" />` so
JavaScript-loaded images, videos and other public assets resolve correctly.
Future deeper pages should adjust that value for their directory depth and be
added to the HTML entries in `vite.config.js`.

## Portfolio

### Homepage panel screenshots

Add PNG screenshots under `public/images/games/{project_slug}/`, then run
`npm run portfolio:update`. New PNGs convert to static WebPs at quality 85, up
to 1920px wide, preserving aspect ratio without enlarging smaller images.
Each output must decode successfully before its source PNG is deleted. Existing
WebPs are never overwritten; collisions retain both files. Shared UI PNGs directly
in `images/games/` (such as `arrow.png`) are excluded.

`src/data/game-media-manifest.json` discovers screenshots in natural filename
order. `src/data/projects.js` adds them to the matching homepage panel after
authored media, keeps existing videos, removes sample images when real screenshots
are available, and avoids duplicate paths. Slugs match project IDs with hyphens
replaced by underscores, or the optional `portfolioSlug` override. No UI edits
are needed for subsequent screenshots. Builds refresh discovery but never convert
or delete images; unchanged manifests are not rewritten.

The gallery lives at `portfolio/` (`/portfolio/` locally, or
`/repository/portfolio/` on GitHub Pages). This is a real HTML entry, so direct
visits and refreshes work without a client router or a custom 404 fallback.

Add media under matching project slugs:

```text
public/images/portfolio/clips/dog_of_war/gameplay_01.mp4
public/images/portfolio/page_content/dog_of_war/page_01.webp
```

Only projects with WebP media appear. Filenames are naturally sorted (page_2
before page_10); missing folders and projects with only clips or only pages work.
Titles reuse `src/data/projects.js`; new folder names supply a readable default.
Edit `src/data/portfolio-metadata.json` for portfolio titles, descriptions, tags,
dates and cover overrides. `projects.js` imports these settings for the page.

For a new project, add images under its slug and run `npm run portfolio:update`.
The command creates its banner automatically and adds an editable entry like:

```json
"new_game": {
  "title": "New Game",
  "description": "Add a short project introduction.",
  "tags": ["Add game tags"],
  "dateMade": "Add month and year"
}
```

Replace the placeholder text in `src/data/portfolio-metadata.json`; use `""` for
an unwanted description/date or `[]` for no tags. The title, tags and date appear
beside the artwork using the shared banner style, including its left artwork and
right-edge fade. The introduction appears when expanded. Existing entries are
never reset or deleted by updates, even if media is removed. Unchanged runs do
not rewrite the metadata file. No manual asset paths or UI edits are required.

### Project banners

Place key visuals in `public/images/portfolio/key_visual/{project_slug}/`.
`portfolio:update` converts new PNGs to static WebPs at quality 84 (80 if needed),
limiting width to 1920px without upscaling, cropping, or stretching. It validates
dimensions and decodes the output before deleting the PNG. Existing WebPs always
win: filename collisions preserve both files. Key visuals use separate settings
from content pages. Files above the preferred 300 KB budget or 500 KB soft
maximum are reported rather than repeatedly degrading artwork.

The first naturally sorted WebP in each folder becomes its banner. Key-visual-only
projects also appear; projects without a cover use a dark fallback banner.
Override cover selection and accent color in `src/data/portfolio-metadata.json`:

```json
"dog_of_war": {
  "description": "",
  "tags": ["Funny", "Casual"],
  "dateMade": "July, 2026",
  "keyVisual": "images/portfolio/key_visual/dog_of_war/alternate.webp",
  "accentColor": "#d46b45"
}
```

Paths must point to WebPs, relative to `public/`. Omit `keyVisual` to use automatic
discovery. Banner height, title sizing, overlay and hover styles live in
`src/styles/portfolio.scss` under `.portfolio-project-heading` and `.project-banner`.

### Update media incrementally

Install FFmpeg with `libwebp_anim` support and put it on PATH, or set
`FFMPEG_PATH` to its executable. Run:

```sh
npm run portfolio:update
```

Place new MP4 clips in `clips/{project_slug}/` and PNG or optimized WebP pages in
`page_content/{project_slug}/`, then run this command. Use `clips` (plural),
not the old `clip` folder. New projects are discovered automatically.
Existing WebPs and pages are never recompressed, modified or deleted.
Manifest discovery only reads image headers to record dimensions and paths.

Content-page PNGs are converted recursively in
`public/images/portfolio/page_content/{project_slug}/` (the existing folder uses
an underscore, not `page-content`). Pages use WebP quality 90 and a maximum width
of 3200px, matching the 1600px content column at 2x resolution. Smaller images
are not enlarged; aspect ratio is preserved. Extremely tall pages are limited
to 16000px high to stay within WebP limits. Results above 2 MB produce a warning
instead of aggressively reducing text quality. These settings are in the `page`
branch of `scripts/convert-portfolio-clips.mjs`.

Each new page WebP must pass dimension checks and full decoding before its PNG
is deleted. Existing WebPs are never overwritten: collisions preserve both
files, and failed conversions retain the PNG. Converted pages enter the manifest
automatically in natural filename order. The update summary reports page
conversions, source deletions, skipped WebPs and collisions separately.

**Conversion deletes only newly converted source MP4s after successful validation.** Keep archival
originals outside `public/` if you need them. The script recursively converts the
first five seconds, at up to 640px wide, 12 fps and quality 65, preserving aspect
ratio and looping. It checks the RIFF container and decodes every animation frame
before deleting the original. Single-frame or invalid outputs retain the source
and report failure. There is no MP4 fallback on the page.

Above 1.5 MB, it retries at 560px/10 fps/60 quality, then 480px/10 fps/55 quality.
Usable results between 1.5 and 3 MB produce a warning; larger files retain the
source for manual editing. If a matching WebP already exists, both files are
preserved and a filename collision is reported, regardless of timestamps or
whether the existing WebP is valid. No FFmpeg command runs for these files.
`--force` is no longer supported: use a new filename to add a replacement clip.
Failures return a nonzero exit status; other successful additions still enter
the manifest. An unreadable/invalid WebP prevents manifest regeneration and is
reported without changing the old manifest or source images.

The summary reports detected MP4s, conversions, deletions, skipped WebPs,
collisions, new/existing pages, manifest changes and errors. New-page counts are
relative to the previous manifest. Repeated runs leave media, metadata and the
manifest's modification time unchanged when nothing has changed.

`npm run dev` and `npm run build` regenerate the media manifest automatically;
they never convert or delete media. After adding files while the server is running,
run `npm run portfolio:update` (Vite reloads the changed manifest). For WebP-only
changes, `npm run portfolio:manifest` is also available; `portfolio:convert` runs
just the safe conversion step. Commit the generated
`src/data/portfolio-manifest.json` with the media. Verify with `npm run build`.
Run `npm run test:portfolio` for preservation, collision, ordering and repeat-run
checks. Real FFmpeg conversion tests run when FFmpeg is available on PATH or via
`FFMPEG_PATH`; otherwise that test is explicitly skipped.

Collapsed projects mount no images. Gameplay clips form a full-width, continuously
scrolling row with clipped edges and no pagination. Only tiles near the visible
strip load images; offscreen tiles and hidden tabs unload them. Hover or keyboard
focus pauses travel; drag or arrow keys browse, and Space toggles automatic travel.
Reduced motion stops travel and displays still frames. Documentation pages reserve
their source dimensions and load near the viewport. Adjust the row height with
`$portfolio-clip-height` in `src/styles/portfolio.scss` and travel speed with the
`speed` constant in the `gallery` function in `src/portfolio.js`.


### Homepage project links

Homepage “Explore this project” links automatically point to a matching portfolio
entry, such as `portfolio/#dog_of_war`, opening it and scrolling its banner below
the navigation. Matching uses the homepage project's ID with hyphens converted
to underscores. Set `portfolioSlug` on a project in `src/data/projects.js` if its
asset folder uses a different name. Projects without a portfolio entry retain
their existing link until matching media is added and the manifest is refreshed.

