import { readFile, stat, copyFile, unlink, mkdtemp, rmdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { root, files, webpInfo } from './portfolio-media.mjs';

export function convertClips(options = {}) {
  return convertMedia({ directory: path.join(root, 'public/images/portfolio/clips'), ...options, kind: 'clip' });
}
export function convertKeyVisuals(options = {}) {
  return convertMedia({ directory: path.join(root, 'public/images/portfolio/key_visual'), ...options, kind: 'keyVisual' });
}
export function convertPortfolioPages(options = {}) {
  return convertMedia({ directory: path.join(root, 'public/images/portfolio/page_content'), ...options, kind: 'page' });
}
async function convertMedia({ directory, kind, ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg' }) {
  const isStill = kind !== 'clip';
  const sourceExtension = isStill ? /\.png$/i : /\.mp4$/i;
  const discovered = await files(directory);
  const existingWebps = discovered.filter(file => /\.webp$/i.test(file));
  // Case-insensitive matching also protects assets moved between Windows and Linux.
  const outputs = new Set(existingWebps.map(file => file.toLowerCase()));
  const sources = discovered.filter(file => sourceExtension.test(file));
  const summary = { detected: sources.length, converted: 0, deleted: 0, skipped: existingWebps.length, collisions: 0, failed: 0 };
  function run(args, input) {
    const result = spawnSync(ffmpeg, ['-v', 'error', '-xerror', ...args], { input, maxBuffer: 16 * 1024 * 1024 });
    if (result.error || result.status !== 0) throw Error(result.error?.message || result.stderr.toString());
  }
  async function validate(file) {
    const data = await readFile(file);
    const info = webpInfo(data);
    if (isStill) {
      if (info.frames.length) throw Error('Expected a static WebP; source retained');
      run(['-i', file, '-f', 'null', '-']);
    } else if (info.frames.length < 2) throw Error('Expected multiple animated frames; source retained');
    // Decode every embedded frame. Existing WebPs never enter this processing.
    for (const frame of info.frames) run(['-i', 'pipe:0', '-f', 'null', '-'], frame);
    return data.length;
  }
  for (const source of sources) {
    const output = source.replace(sourceExtension, '.webp');
    if (outputs.has(output.toLowerCase())) {
      summary.collisions++;
      console.warn(`Filename collision: ${source} / ${output}; both preserved (even if the WebP needs repair).`);
      continue;
    }
    let temporaryDirectory, temporary;
    try {
      const original = await stat(source);
      temporaryDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-conversion-'));
      temporary = path.join(temporaryDirectory, 'clip.webp');
      let size;
      if (kind === 'page') {
        // 2x the 1600px content column keeps small text readable on high-DPI
        // displays. Limit very tall pages to WebP's dimension range as well.
        run(['-y', '-i', source, '-frames:v', '1', '-vf', "scale=w='min(3200,iw)':h='min(16000,ih)':force_original_aspect_ratio=decrease", '-c:v', 'libwebp', '-quality', '90', '-compression_level', '6', temporary]);
        size = await validate(temporary);
        if (size > 2 * 1024 * 1024) console.warn(`Portfolio page above 2 MB: ${source} (${Math.round(size / 1024)} KB); retaining text readability.`);
      } else if (isStill) {
        for (const quality of [84, 80]) {
          run(['-y', '-i', source, '-frames:v', '1', '-vf', "scale=w='min(1920,iw)':h=-1", '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', temporary]);
          size = await validate(temporary);
          if (size <= 300 * 1024) break;
        }
        if (size > 300 * 1024) console.warn(`Key visual above ${size > 500 * 1024 ? '500 KB soft maximum' : '300 KB preferred budget'}: ${source} (${Math.round(size / 1024)} KB); retaining artwork quality.`);
      } else {
      for (const [width, fps, quality] of [[640, 12, 65], [560, 10, 60], [480, 10, 55]]) {
        run(['-y', '-i', source, '-t', '3', '-an', '-vf', `fps=${fps},scale=w='min(${width},iw)':h=-2`, '-c:v', 'libwebp_anim', '-quality', String(quality), '-compression_level', '6', '-loop', '0', temporary]);
        size = await validate(temporary);
        if (size <= 1.5 * 1024 * 1024) break;
      }
      if (size > 3 * 1024 * 1024) throw Error('Output exceeds 3 MB; source retained for manual optimization');
      if (size > 1.5 * 1024 * 1024) console.warn(`Above preferred 1.5 MB budget: ${source}`);
      }
      // Exclusive publication protects files added while conversion is running.
      // Work files stay outside the asset tree and cannot enter the manifest.
      await copyFile(temporary, output, constants.COPYFILE_EXCL);
      outputs.add(output.toLowerCase());
      await validate(output);
      summary.converted++;
      const current = await stat(source);
      if (current.size !== original.size || current.mtimeMs !== original.mtimeMs || current.ctimeMs !== original.ctimeMs) throw Error('Source changed during conversion; source retained');
      await unlink(source);
      summary.deleted++;
      console.log(`Validated ${output}; deleted source ${isStill ? 'PNG' : 'MP4'}`);
    } catch (error) {
      if (error.code === 'EEXIST') {
        summary.collisions++;
        console.warn(`Filename collision: ${output} appeared during conversion; both files preserved.`);
      } else {
        summary.failed++;
        console.error(`${source}: ${error.message}`);
      }
    } finally {
      if (temporary) await unlink(temporary).catch(() => {});
      if (temporaryDirectory) await rmdir(temporaryDirectory).catch(() => {});
    }
  }
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--force')) {
    console.error('--force is no longer supported. Existing WebPs are always preserved; use a new filename for new media.');
    process.exitCode = 1;
  } else {
    const directory = process.argv.find(arg => arg.startsWith('--directory='))?.slice(12);
    const summary = await convertClips(directory ? { directory: path.resolve(directory) } : {});
    console.log(JSON.stringify(summary));
    if (summary.failed) process.exitCode = 1;
  }
}
