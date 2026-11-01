import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, stat, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { root, files, generateManifest, webpInfo } from './portfolio-media.mjs';
import { updatePortfolio } from './update-portfolio.mjs';
import { convertClips, convertKeyVisuals, convertPortfolioPages } from './convert-portfolio-clips.mjs';

async function fixture(t) {
  const directory = await mkdtemp(path.join(tmpdir(), 'portfolio-test-'));
  t.after(async () => {
    const resolved = path.resolve(directory);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert(path.basename(resolved).startsWith('portfolio-test-'));
    await rm(resolved, { recursive: true, force: true });
  });
  const clips = path.join(directory, 'public/images/portfolio/clips/dog_of_war');
  const pages = path.join(directory, 'public/images/portfolio/page_content/dog_of_war');
  await mkdir(clips, { recursive: true }); await mkdir(pages, { recursive: true });
  await copyFile(path.join(root, 'public/images/portfolio/clips/dog_of_war/camp.webp'), path.join(clips, 'camp.webp'));
  await copyFile(path.join(root, 'public/images/portfolio/page_content/dog_of_war/page_01.webp'), path.join(pages, 'page_1.webp'));
  return { directory, clips, pages, manifest: path.join(directory, 'src/data/portfolio-manifest.json') };
}
async function snapshot(directory) {
  return Object.fromEntries(await Promise.all((await files(directory)).map(async file => [file, {
    hash: createHash('sha256').update(await readFile(file)).digest('hex'), mtime: (await stat(file)).mtimeMs,
  }])));
}

test('incremental discovery preserves bytes, timestamps, metadata and natural ordering', async t => {
  const f = await fixture(t);
  await generateManifest(f.directory);
  await writeFile(path.join(f.directory, 'src/data/projects.js'), 'manual metadata remains untouched');
  const before = await snapshot(f.directory);
  for (const name of ['page_10.webp', 'page_2.webp']) await copyFile(path.join(f.pages, 'page_1.webp'), path.join(f.pages, name));
  const newProject = path.join(f.directory, 'public/images/portfolio/page_content/new_project');
  await mkdir(newProject); await copyFile(path.join(f.pages, 'page_1.webp'), path.join(newProject, 'page_1.webp'));
  const result = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.equal(result.failed, 0); assert.equal(result.converted, 0);
  assert.equal(result.manifest.newPages, 3); assert.equal(result.manifest.existingPages, 1);
  const manifest = JSON.parse(await readFile(f.manifest));
  assert.deepEqual(manifest[0].pages.map(page => path.basename(page.src)), ['page_1.webp', 'page_2.webp', 'page_10.webp']);
  assert.equal(manifest[1].slug, 'new_project');
  const after = await snapshot(f.directory);
  for (const [file, state] of Object.entries(before)) if (file !== f.manifest) assert.deepEqual(after[file], state);
  const repeat = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.equal(repeat.manifest.updated, false); assert.equal(repeat.manifest.newPages, 0);
  assert.deepEqual(await snapshot(f.directory), after);
});

test('collisions preserve newer MP4 and existing valid or invalid WebPs without FFmpeg', async t => {
  const f = await fixture(t);
  await utimes(path.join(f.clips, 'camp.webp'), new Date(0), new Date(0));
  await writeFile(path.join(f.clips, 'camp.mp4'), 'newer source');
  await writeFile(path.join(f.clips, 'broken.WEBP'), 'invalid but must not be overwritten');
  await writeFile(path.join(f.clips, 'broken.mp4'), 'source retained');
  const before = await snapshot(f.directory);
  const result = await convertClips({ directory: f.clips, ffmpeg: 'must-not-be-executed' });
  assert.equal(result.collisions, 2); assert.equal(result.converted, 0); assert.equal(result.failed, 0);
  assert.deepEqual(await snapshot(f.directory), before);
});

test('new project text is editable and future updates preserve authored metadata', async t => {
  const f = await fixture(t);
  const first = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.deepEqual(first.metadata.added, ['dog_of_war']);
  const metadataPath = path.join(f.directory, 'src/data/portfolio-metadata.json');
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
  assert.equal(metadata.dog_of_war.title, 'Dog Of War');
  assert.deepEqual(metadata.dog_of_war.tags, ['Add game tags']);
  assert.equal(metadata.dog_of_war.dateMade, 'Add month and year');
  metadata.dog_of_war = { title: 'My title', description: 'My introduction', tags: ['My tag'], dateMade: 'July, 2026', keyVisual: 'custom.webp', accentColor: '#123456' };
  await writeFile(metadataPath, JSON.stringify(metadata));
  const edited = await snapshot(f.directory);
  await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.deepEqual(await snapshot(f.directory), edited);
  const covers = path.join(f.directory, 'public/images/portfolio/key_visual/new_game');
  await mkdir(covers, { recursive: true });
  await copyFile(path.join(f.pages, 'page_1.webp'), path.join(covers, 'art.webp'));
  const addition = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.deepEqual(addition.metadata.added, ['new_game']);
  const updated = JSON.parse(await readFile(metadataPath, 'utf8'));
  assert.deepEqual(updated.dog_of_war, metadata.dog_of_war);
  assert.equal(updated.new_game.title, 'New Game');
  await writeFile(metadataPath, '{invalid JSON');
  const failed = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.equal(failed.failed, 1);
  assert.equal(await readFile(metadataPath, 'utf8'), '{invalid JSON');
});

const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
test('page PNG conversion resizes proportionally, validates before deletion and preserves existing media', { skip: spawnSync(ffmpeg, ['-version']).status !== 0 && 'Set FFMPEG_PATH for page conversion verification' }, async t => {
  const f = await fixture(t);
  const existingPage = await readFile(path.join(f.pages, 'page_1.webp'));
  const nested = path.join(f.pages, 'details'); await mkdir(nested);
  for (const [name, dimensions] of [['page_2', '4000x2000'], ['page_10', '640x360']]) {
    assert.equal(spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', `testsrc2=size=${dimensions}`, '-frames:v', '1', path.join(nested, `${name}.png`)]).status, 0);
  }
  const update = await updatePortfolio({ projectRoot: f.directory, ffmpeg });
  assert.equal(update.pages.converted, 2); assert.equal(update.pages.deleted, 2); assert.equal(update.failed, 0);
  for (const [name, width, height] of [['page_2', 3200, 1600], ['page_10', 640, 360]]) {
    assert.equal(await stat(path.join(nested, `${name}.png`)).catch(() => null), null);
    const info = webpInfo(await readFile(path.join(nested, `${name}.webp`)));
    assert.equal(info.width, width); assert.equal(info.height, height); assert.equal(info.frames.length, 0);
  }
  assert.deepEqual(await readFile(path.join(f.pages, 'page_1.webp')), existingPage);
  const manifest = JSON.parse(await readFile(f.manifest));
  assert.equal(manifest[0].pages.length, 3);
  const names = manifest[0].pages.map(page => path.basename(page.src));
  assert(names.indexOf('page_2.webp') < names.indexOf('page_10.webp'));
  const beforeRepeat = await snapshot(f.directory);
  await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.deepEqual(await snapshot(f.directory), beforeRepeat);
  await writeFile(path.join(nested, 'page_2.png'), 'collision source');
  const beforeCollision = await snapshot(f.directory);
  const collision = await convertPortfolioPages({ directory: f.pages, ffmpeg: 'must-not-be-executed' });
  assert.equal(collision.collisions, 1); assert.equal(collision.deleted, 0);
  assert.deepEqual(await snapshot(f.directory), beforeCollision);
  await writeFile(path.join(nested, 'invalid.png'), 'invalid PNG');
  const failure = await convertPortfolioPages({ directory: f.pages, ffmpeg });
  assert.equal(failure.failed, 1); assert.equal(failure.deleted, 0);
  assert.equal(await readFile(path.join(nested, 'invalid.png'), 'utf8'), 'invalid PNG');
  assert.equal(await stat(path.join(nested, 'invalid.webp')).catch(() => null), null);
});
test('key visual converter preserves collisions and does not process other directories', { skip: spawnSync(ffmpeg, ['-version']).status !== 0 && 'Set FFMPEG_PATH for PNG conversion verification' }, async t => {
  const f = await fixture(t);
  const covers = path.join(f.directory, 'public/images/portfolio/key_visual/dog_of_war');
  await mkdir(covers, { recursive: true });
  const png = path.join(covers, 'cover_2.png');
  assert.equal(spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=320x180', '-frames:v', '1', png]).status, 0);
  const original = await readFile(png);
  await writeFile(path.join(f.pages, 'untouched.png'), original);
  const contentBefore = await snapshot(f.pages);
  const result = await convertKeyVisuals({ directory: covers, ffmpeg });
  assert.equal(result.converted, 1); assert.equal(result.deleted, 1);
  assert.equal(await stat(png).catch(() => null), null);
  const cover = path.join(covers, 'cover_2.webp');
  const info = webpInfo(await readFile(cover));
  assert.equal(info.width, 320); assert.equal(info.height, 180); assert.equal(info.frames.length, 0);
  assert.deepEqual(await snapshot(f.pages), contentBefore);
  await copyFile(cover, path.join(covers, 'cover_10.webp'));
  await generateManifest(f.directory);
  assert(JSON.parse(await readFile(f.manifest))[0].keyVisual.src.endsWith('cover_2.webp'));
  const beforeRepeat = await snapshot(f.directory);
  await convertKeyVisuals({ directory: covers, ffmpeg: 'must-not-be-executed' });
  assert.deepEqual(await snapshot(f.directory), beforeRepeat);
  await writeFile(png, original);
  const collisionBefore = await snapshot(f.directory);
  const collision = await convertKeyVisuals({ directory: covers, ffmpeg: 'must-not-be-executed' });
  assert.equal(collision.collisions, 1); assert.equal(collision.deleted, 0);
  assert.deepEqual(await snapshot(f.directory), collisionBefore);
  await writeFile(path.join(covers, 'invalid.png'), 'corrupt PNG');
  const failed = await convertKeyVisuals({ directory: covers, ffmpeg });
  assert.equal(failed.failed, 1); assert.equal(failed.deleted, 0);
  assert.equal(await readFile(path.join(covers, 'invalid.png'), 'utf8'), 'corrupt PNG');
});
test('only new MP4 converts; failed conversion retains source; rerun does no processing', { skip: spawnSync(ffmpeg, ['-version']).status !== 0 && 'Set FFMPEG_PATH to run real conversion verification' }, async t => {
  const f = await fixture(t);
  const source = path.join(f.clips, 'new.mp4');
  const generated = spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=size=160x90:rate=12', '-t', '1', '-pix_fmt', 'yuv420p', source]);
  assert.equal(generated.status, 0, generated.stderr?.toString());
  const existing = await snapshot(f.pages);
  const existingClip = await readFile(path.join(f.clips, 'camp.webp'));
  const success = await updatePortfolio({ projectRoot: f.directory, ffmpeg });
  assert.equal(success.converted, 1); assert.equal(success.deleted, 1); assert.equal(success.failed, 0);
  assert.equal(await stat(source).catch(() => null), null);
  assert(webpInfo(await readFile(path.join(f.clips, 'new.webp'))).frames.length > 1);
  assert.deepEqual(await snapshot(f.pages), existing);
  assert.deepEqual(await readFile(path.join(f.clips, 'camp.webp')), existingClip);
  const beforeRepeat = await snapshot(f.directory);
  const repeat = await updatePortfolio({ projectRoot: f.directory, ffmpeg: 'must-not-be-executed' });
  assert.equal(repeat.failed, 0); assert.equal(repeat.converted, 0);
  assert.deepEqual(await snapshot(f.directory), beforeRepeat);
  await writeFile(path.join(f.clips, 'bad.mp4'), 'corrupt MP4');
  const failed = await updatePortfolio({ projectRoot: f.directory, ffmpeg });
  assert.equal(failed.failed, 1); assert.equal(failed.deleted, 0);
  assert.equal(await readFile(path.join(f.clips, 'bad.mp4'), 'utf8'), 'corrupt MP4');
  assert.equal(await stat(path.join(f.clips, 'bad.webp')).catch(() => null), null);
  const single = path.join(f.clips, 'single.mp4');
  assert.equal(spawnSync(ffmpeg, ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=size=160x90:rate=12', '-frames:v', '1', single]).status, 0);
  const invalidAnimation = await convertClips({ directory: f.clips, ffmpeg });
  assert.equal(invalidAnimation.deleted, 0);
  assert.equal(invalidAnimation.failed, 2); // corrupt input plus non-animated output
  assert((await stat(single)).size > 0);
  assert.equal(await stat(path.join(f.clips, 'single.webp')).catch(() => null), null);
});
