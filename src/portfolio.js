import './styles/main.scss';
import './styles/portfolio.scss';
import manifest from './data/portfolio-manifest.json';
import { assetUrl, portfolioDetails } from './data/projects.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const list = document.querySelector('#portfolio-projects');
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
function mediaImage(media, alt) {
  const img = element('img', '', '');
  img.width = media.width; img.height = media.height;
  img.alt = alt; img.decoding = 'async';
  return img;
}
function gallery(clips, title, parent) {
  const strip = element('section', 'clip-strip');
  strip.tabIndex = 0;
  strip.setAttribute('aria-label', `${title} gameplay clips. Hover or focus to pause. Drag or use arrow keys to browse. Space toggles scrolling.`);
  const track = element('div', 'clip-track');
  strip.append(track); parent.append(strip);
  // Constant travel speed, independent of how many clips a project contains.
  const speed = 32; // Pixels per second, moving left to right.
  let cycle = 0, offset = 0, frame, lastTime = 0, visible = false;
  let hovered = false, focused = false, paused = false, dragging = false, pointerX = 0, disposed = false;
  let cards = [];
  const near = new Set();
  function unload(card) {
    card.querySelector('img')?.removeAttribute('src');
    card.replaceChildren();
  }
  function load(card) {
    if (card.firstChild || !visible || document.hidden || disposed) return;
    const clip = clips[Number(card.dataset.index)];
    const img = mediaImage(clip, card.dataset.duplicate === 'true' ? '' : `${title} — gameplay clip ${Number(card.dataset.index) + 1}`);
    if (reduced.matches) img.onload = () => {
      if (!card.contains(img) || disposed) return;
      const still = element('canvas', 'clip-still');
      still.width = clip.width; still.height = clip.height;
      if (img.alt) { still.setAttribute('role', 'img'); still.setAttribute('aria-label', img.alt); }
      still.getContext('2d').drawImage(img, 0, 0);
      card.replaceChildren(still); img.removeAttribute('src');
    };
    img.src = assetUrl(clip.src); card.append(img);
  }
  function syncMedia() {
    cards.forEach(card => { if (near.has(card) && visible && !document.hidden) load(card); else unload(card); });
  }
  const mediaObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) near.add(entry.target); else near.delete(entry.target); });
    syncMedia();
  }, { root: strip, rootMargin: '0px 80px' });
  function paint() {
    if (!cycle) return;
    offset = ((offset % cycle) + cycle) % cycle;
    track.style.transform = `translate3d(${offset - cycle}px, 0, 0)`;
  }
  function tick(time) {
    if (lastTime) offset += Math.min(time - lastTime, 50) * speed / 1000;
    lastTime = time; paint(); frame = requestAnimationFrame(tick);
  }
  function schedule() {
    cancelAnimationFrame(frame); lastTime = 0;
    if (!disposed && visible && !document.hidden && !reduced.matches && !hovered && !focused && !paused && !dragging) frame = requestAnimationFrame(tick);
  }
  function layout() {
    const height = strip.clientHeight, width = strip.clientWidth;
    if (!height || !width) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 24;
    const widths = clips.map(clip => height * clip.width / clip.height);
    const oneSet = widths.reduce((sum, value) => sum + value + gap, 0);
    const repeats = Math.max(1, Math.ceil((width + Math.max(...widths)) / oneSet));
    const progress = cycle ? offset / cycle : 0;
    cycle = oneSet * repeats; offset = progress * cycle;
    mediaObserver.disconnect(); cards.forEach(unload); near.clear(); track.replaceChildren(); cards = [];
    // Two identical sequences make the wrap invisible, including one-clip projects.
    for (let repeat = 0; repeat < repeats * 2; repeat++) clips.forEach((clip, index) => {
      const card = element('div', 'clip-tile');
      card.style.width = `${widths[index]}px`; card.dataset.index = index;
      card.dataset.duplicate = String(repeat !== repeats);
      if (repeat !== repeats) card.setAttribute('aria-hidden', 'true');
      track.append(card); cards.push(card); mediaObserver.observe(card);
    });
    paint();
  }
  const resize = new ResizeObserver(layout); resize.observe(strip);
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMedia(); schedule(); }); observer.observe(strip);
  strip.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  strip.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  strip.addEventListener('focusin', () => { focused = true; schedule(); });
  strip.addEventListener('focusout', () => { focused = false; schedule(); });
  strip.addEventListener('keydown', event => {
    if (event.code === 'Space') { event.preventDefault(); paused = !paused; schedule(); }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); offset += (event.key === 'ArrowRight' ? -1 : 1) * strip.clientWidth * .4; paint();
    }
  });
  strip.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragging = true; pointerX = event.clientX; strip.setPointerCapture(event.pointerId); strip.classList.add('is-dragging'); schedule();
  });
  strip.addEventListener('pointermove', event => {
    if (!dragging) return;
    offset += event.clientX - pointerX; pointerX = event.clientX; paint();
  });
  const release = () => { dragging = false; strip.classList.remove('is-dragging'); schedule(); };
  strip.addEventListener('pointerup', release); strip.addEventListener('pointercancel', release);
  const visibility = () => { syncMedia(); schedule(); };
  const motion = () => { cards.forEach(unload); syncMedia(); schedule(); };
  document.addEventListener('visibilitychange', visibility); reduced.addEventListener('change', motion);
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); mediaObserver.disconnect(); resize.disconnect();
    document.removeEventListener('visibilitychange', visibility); reduced.removeEventListener('change', motion);
    cards.forEach(unload); track.replaceChildren();
  };
}

let active;
const buttons = [];
const projectTargets = new Map();
for (const [position, project] of manifest.entries()) {
  const { title, description, tags = [], dateMade = '', keyVisual, keyVisualPosition = 'center', keyVisualMobilePosition = keyVisualPosition, accentColor } = portfolioDetails(project.slug);
  const article = element('article', 'portfolio-project');
  article.id = project.slug;
  const heading = element('h2', 'portfolio-project-heading');
  const button = element('button', 'project-banner'); button.type = 'button';
  const cover = keyVisual ?? project.keyVisual?.src;
  if (cover && /\.webp$/i.test(cover)) {
    button.classList.add('has-artwork');
    if (project.keyVisual) button.style.setProperty('--banner-art-ratio', project.keyVisual.width / project.keyVisual.height);
    const img = element('img', 'project-banner-image'); img.alt = ''; img.decoding = 'async';
    img.loading = position === 0 ? 'eager' : 'lazy';
    if (position === 0) img.fetchPriority = 'high';
    img.src = assetUrl(cover);
    img.addEventListener('load', () => button.style.setProperty('--banner-art-ratio', img.naturalWidth / img.naturalHeight), { once: true });
    img.addEventListener('error', () => { img.remove(); button.classList.remove('has-artwork'); }, { once: true });
    button.append(img);
  }
  button.style.setProperty('--banner-position', keyVisualPosition);
  button.style.setProperty('--banner-mobile-position', keyVisualMobilePosition);
  if (accentColor) button.style.setProperty('--banner-accent', accentColor);
  const details = element('span', 'project-banner-details');
  const titleLabel = element('span', 'project-banner-title', title); titleLabel.id = `banner-title-${position}`;
  details.append(titleLabel);
  const metadata = element('span', 'project-banner-metadata'); metadata.id = `banner-metadata-${position}`;
  if (tags.length) metadata.append(element('span', 'project-banner-tags', tags.join(', ')));
  if (dateMade) metadata.append(element('span', 'project-banner-date', dateMade));
  details.append(metadata); button.append(details);
  button.setAttribute('aria-labelledby', titleLabel.id);
  if (tags.length || dateMade) button.setAttribute('aria-describedby', metadata.id);
  const indicator = element('span', 'project-banner-indicator'); indicator.setAttribute('aria-hidden', 'true'); button.append(indicator);
  button.id = `project-heading-${position}`; button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', `project-content-${position}`);
  heading.append(button);
  const panel = element('div', 'portfolio-expander'); panel.id = `project-content-${position}`;
  panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', button.id); panel.inert = true; panel.setAttribute('aria-hidden', 'true');
  const inner = element('div', 'portfolio-inner'); const content = element('div', 'portfolio-body'); inner.append(content); panel.append(inner);
  article.append(heading, panel); list.append(article); buttons.push(button);
  let cleanup = () => {}, removal;
  const close = () => {
    button.setAttribute('aria-expanded', 'false'); panel.inert = true; panel.setAttribute('aria-hidden', 'true'); article.classList.remove('is-open'); cleanup();
    removal = setTimeout(() => content.replaceChildren(), reduced.matches ? 0 : 400);
  };
  button.onclick = () => {
    if (active?.button === button) { close(); active = null; return; }
    active?.close(); active = { button, close }; clearTimeout(removal); content.replaceChildren();
    if (description) content.append(element('p', 'portfolio-introduction', description));
    const stopGallery = project.clips.length ? gallery(project.clips, title, content) : () => {};
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveal.unobserve(entry.target); }
    }));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const img = entry.target;
      if (entry.isIntersecting) { img.src = img.dataset.src; observer.unobserve(img); }
    }), { rootMargin: '160px 0px' });
    project.pages.forEach((media, i) => {
      const img = mediaImage(media, `${title} — portfolio page ${i + 1}`); img.className = 'portfolio-document'; img.loading = 'lazy'; img.dataset.src = assetUrl(media.src); content.append(img); observer.observe(img); reveal.observe(img);
    });
    content.append(element('p', 'portfolio-end', `End of ${title}`));
    cleanup = () => { stopGallery(); observer.disconnect(); reveal.disconnect(); content.querySelectorAll('img').forEach(img => img.removeAttribute('src')); };
    panel.inert = false; panel.setAttribute('aria-hidden', 'false'); button.setAttribute('aria-expanded', 'true'); article.classList.add('is-open');
  };
  projectTargets.set(project.slug, { article, button });
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown') next = (position + 1) % buttons.length;
    if (event.key === 'ArrowUp') next = (position - 1 + buttons.length) % buttons.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = buttons.length - 1;
    if (next !== undefined) { event.preventDefault(); buttons[next].focus(); }
  });
}
if (!manifest.length) list.append(element('p', '', 'No portfolio media has been added yet.'));

// Resolve links after creating the accordion, including refresh and hash navigation.
let anchorTimer;
function openLinkedProject() {
  clearTimeout(anchorTimer);
  let slug;
  try { slug = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  const target = projectTargets.get(slug);
  if (!target) return;
  if (target.button.getAttribute('aria-expanded') !== 'true') target.button.click();
  target.button.focus({ preventScroll: true });
  const align = () => {
    if (active?.button === target.button) target.article.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  requestAnimationFrame(align);
  // Re-align once a previously open section above this one finishes collapsing.
  anchorTimer = setTimeout(align, reduced.matches ? 0 : 450);
}
window.addEventListener('hashchange', openLinkedProject);
openLinkedProject();

