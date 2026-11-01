import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
export function webpInfo(data) {
  if (data.length < 20 || data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WEBP' || data.readUInt32LE(4) + 8 !== data.length) throw Error('Invalid WebP container');
  const frames = []; let width, height;
  for (let offset = 12; offset < data.length;) {
    if (offset + 8 > data.length) throw Error('Truncated WebP chunk');
    const type = data.toString('ascii', offset, offset + 4), size = data.readUInt32LE(offset + 4), start = offset + 8;
    if (start + size > data.length) throw Error('Truncated WebP data');
    if (type === 'VP8X') { width = data.readUIntLE(start + 4, 3) + 1; height = data.readUIntLE(start + 7, 3) + 1; }
    if (type === 'VP8 ') { width ??= data.readUInt16LE(start + 6) & 16383; height ??= data.readUInt16LE(start + 8) & 16383; }
    if (type === 'VP8L') { const bits = data.readUInt32LE(start + 1); width ??= (bits & 16383) + 1; height ??= ((bits >>> 14) & 16383) + 1; }
    if (type === 'ANMF') {
      if (size <= 16) throw Error('Empty animation frame');
      const payload = data.subarray(start + 16, start + size);
      const header = Buffer.alloc(12); header.write('RIFF'); header.writeUInt32LE(payload.length + 4, 4); header.write('WEBP', 8);
      frames.push(Buffer.concat([header, payload]));
    }
    offset = start + size + (size % 2);
  }
  if (!width || !height) throw Error('Missing WebP dimensions');
  return { width, height, frames };
}
export async function generateManifest(projectRoot = root) {
  const manifestPath = path.join(projectRoot, 'src/data/portfolio-manifest.json');
  const previous = await readFile(manifestPath, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const previousPages = new Set((previous ? JSON.parse(previous) : []).flatMap(project => project.pages.map(page => page.src)));
  let newPages = 0, existingPages = 0;
  const projects = new Map();
  for (const kind of ['clips', 'page_content', 'key_visual']) {
    const directory = path.join(projectRoot, 'public/images/portfolio', kind);
    for (const file of (await files(directory)).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
      if (!/\.webp$/i.test(file)) continue;
      const relative = path.relative(directory, file).split(path.sep);
      if (relative.length < 2) continue;
      const slug = relative[0];
      if (!projects.has(slug)) projects.set(slug, { slug, clips: [], pages: [] });
      const { width, height } = webpInfo(await readFile(file));
      const src = path.relative(path.join(projectRoot, 'public'), file).split(path.sep).join('/');
      const project = projects.get(slug);
      if (kind === 'key_visual') {
        // First naturally sorted WebP is the default; metadata can choose another.
        project.keyVisual ??= { src, width, height };
      } else project[kind === 'clips' ? 'clips' : 'pages'].push({ src, width, height });
      if (kind === 'page_content') {
        if (previousPages.has(src)) existingPages++;
        else newPages++;
      }
    }
  }
  const content = JSON.stringify([...projects.values()].sort((a,b) => a.slug.localeCompare(b.slug, 'en', { numeric: true })), null, 2) + '\n';
  const updated = content !== previous;
  if (updated) {
    await mkdir(path.dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, content);
  }
  console.log(`Portfolio manifest: ${projects.size} projects (${updated ? 'updated' : 'unchanged'})`);
  return { updated, newPages, existingPages };
}
export async function ensurePortfolioMetadata(projectRoot = root) {
  const dataDirectory = path.join(projectRoot, 'src/data');
  const metadataPath = path.join(dataDirectory, 'portfolio-metadata.json');
  const previous = await readFile(metadataPath, 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '';
    throw error;
  });
  const metadata = previous ? JSON.parse(previous) : {};
  if (!metadata || Array.isArray(metadata) || typeof metadata !== 'object') throw Error('Portfolio metadata must be a JSON object keyed by project folder name');
  const projects = JSON.parse(await readFile(path.join(dataDirectory, 'portfolio-manifest.json'), 'utf8'));
  const added = [];
  for (const { slug } of projects) {
    if (Object.hasOwn(metadata, slug)) continue;
    Object.defineProperty(metadata, slug, { enumerable: true, configurable: true, writable: true, value: {
      title: slug.replaceAll(/[_-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase()),
      description: 'Add a short project introduction.',
      tags: ['Add game tags'],
      dateMade: 'Add month and year',
    } });
    added.push(slug);
  }
  // Never rewrite existing text (or even its formatting) on an unchanged run.
  if (added.length || !previous) {
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2) + '\n');
  }
  return { added, path: metadataPath };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await generateManifest();
