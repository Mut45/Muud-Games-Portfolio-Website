import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { root, generateManifest, ensurePortfolioMetadata } from './portfolio-media.mjs';
import { convertClips, convertKeyVisuals, convertPortfolioPages } from './convert-portfolio-clips.mjs';

export async function updatePortfolio({ projectRoot = root, ffmpeg } = {}) {
  const summary = await convertClips({ directory: path.join(projectRoot, 'public/images/portfolio/clips'), ffmpeg });
  const keyVisuals = await convertKeyVisuals({ directory: path.join(projectRoot, 'public/images/portfolio/key_visual'), ffmpeg });
  const pages = await convertPortfolioPages({ directory: path.join(projectRoot, 'public/images/portfolio/page_content'), ffmpeg });
  summary.failed += keyVisuals.failed + pages.failed;
  let manifest = { updated: false, newPages: 0, existingPages: 0 };
  let metadata = { added: [] };
  try {
    manifest = await generateManifest(projectRoot);
    metadata = await ensurePortfolioMetadata(projectRoot);
  }
  catch (error) { summary.failed++; console.error(`Portfolio data update failed: ${error.message}`); }
  console.log(`\nPortfolio Update ${summary.failed ? 'Finished With Errors' : 'Complete'}\n
New MP4 files detected:       ${summary.detected}
Successfully converted:      ${summary.converted}
Original MP4 files deleted:  ${summary.deleted}
Existing WebP clips skipped: ${summary.skipped}
Filename collisions:        ${summary.collisions}
New key visual PNGs:         ${keyVisuals.detected}
Key visuals converted:      ${keyVisuals.converted}
Original PNGs deleted:      ${keyVisuals.deleted}
Existing cover WebPs skipped: ${keyVisuals.skipped}
Key visual collisions:      ${keyVisuals.collisions}
New page PNGs:              ${pages.detected}
Page PNGs converted:        ${pages.converted}
Original page PNGs deleted: ${pages.deleted}
Existing page WebPs skipped: ${pages.skipped}
Page filename collisions:  ${pages.collisions}
New portfolio pages found:  ${manifest.newPages}
Existing pages preserved:   ${manifest.existingPages}
Manifest updated:           ${manifest.updated ? 'Yes' : 'No'}
Text placeholders added:    ${metadata.added.length}
Errors:                     ${summary.failed}`);
  if (metadata.added.length) console.log(`Edit text for ${metadata.added.join(', ')} in ${metadata.path}`);
  return { ...summary, keyVisuals, pages, manifest, metadata };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await updatePortfolio();
  if (result.failed) process.exitCode = 1;
}
