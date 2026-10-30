import './styles/main.scss';
import { about, assetUrl } from './data/projects.js';

document.querySelector('#introduction').textContent = about.introduction;
const container = document.querySelector('#interests');
about.interests.forEach((interest, index) => {
  const section = document.createElement('section');
  section.className = 'interest-section'; section.id = interest.id;
  section.setAttribute('aria-labelledby', `heading-${interest.id}`);
  const copy = document.createElement('div'); copy.className = 'interest-copy';
  const number = document.createElement('p'); number.className = 'eyebrow'; number.textContent = String(index + 1).padStart(2, '0');
  const title = document.createElement('h2'); title.id = `heading-${interest.id}`; title.textContent = interest.title;
  copy.append(number, title);
  for (const paragraph of interest.description.split(/\n\s*\n/)) {
    if (!paragraph.trim()) continue;
    const text = document.createElement('p'); text.className = 'interest-paragraph'; text.textContent = paragraph.trim();
    copy.append(text);
  }
  const gallery = document.createElement('div'); gallery.className = 'interest-gallery';
  const items = interest.media ?? interest.images ?? [];
  if (!items.length) {
    const slot = document.createElement('div'); slot.className = 'photo-placeholder';
    slot.textContent = 'Photo space';
    gallery.append(slot);
  }
  const slides = [];
  for (const photo of items) {
    const figure = document.createElement('figure');
    if (photo.type === 'audio' || photo.type === 'video') {
      const player = document.createElement(photo.type);
      player.controls = true; player.preload = 'metadata';
      player.setAttribute('aria-label', photo.title || photo.caption || `${interest.title} ${photo.type}`);
      if (photo.type === 'video') {
        player.playsInline = true;
        if (photo.poster) player.poster = assetUrl(photo.poster);
      }
      const frame = document.createElement('div'); frame.className = 'interest-player-frame';
      if (photo.type === 'audio' && photo.poster) {
        const cover = document.createElement('img'); cover.src = assetUrl(photo.poster); cover.alt = '';
        cover.addEventListener('error', () => cover.remove(), { once: true });
        frame.append(cover);
      }
      player.addEventListener('error', () => {
        const fallback = document.createElement('div'); fallback.className = 'photo-placeholder';
        fallback.textContent = `${photo.type === 'audio' ? 'Audio' : 'Video'} unavailable`;
        frame.replaceChildren(fallback);
      }, { once: true });
      player.src = assetUrl(photo.src);
      frame.append(player); figure.append(frame);
    } else {
    const image = document.createElement('img'); image.src = assetUrl(photo.src); image.alt = photo.alt ?? '';
    image.loading = 'lazy'; image.decoding = 'async';
    // Match the visible image width inside its 4:3 contain-fit frame.
    const sizeCaption = () => {
      if (!image.naturalHeight) return;
      const fraction = Math.min(1, (image.naturalWidth / image.naturalHeight) / (4 / 3));
      figure.style.setProperty('--photo-width', `${fraction * 100}%`);
    };
    image.addEventListener('load', sizeCaption);
    if (image.complete) sizeCaption();
    image.addEventListener('error', () => {
      const fallback = document.createElement('div'); fallback.className = 'photo-placeholder';
      fallback.textContent = photo.alt || 'Photo unavailable'; image.replaceWith(fallback);
    }, { once: true });
    figure.append(image);
    }
    const caption = document.createElement('figcaption');
    caption.textContent = `#${slides.length + 1}${photo.caption ? ` - ${photo.caption}` : ''}`;
    figure.append(caption);
    figure.hidden = slides.length > 0;
    slides.push(figure);
    gallery.append(figure);
  }
  if (slides.length > 1) {
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', 'carousel');
    const imageOnly = items.every((item) => !item.type || item.type === 'image');
    const itemLabel = imageOnly ? 'photo' : 'media item';
    gallery.setAttribute('aria-label', `${interest.title} gallery`);
    const controls = document.createElement('div'); controls.className = 'interest-gallery-controls';
    const previous = document.createElement('button'); previous.type = 'button'; previous.textContent = '←'; previous.setAttribute('aria-label', `Previous ${itemLabel}`);
    const next = document.createElement('button'); next.type = 'button'; next.textContent = '→'; next.setAttribute('aria-label', `Next ${itemLabel}`);
    const status = document.createElement('span'); status.setAttribute('role', 'status'); status.setAttribute('aria-atomic', 'true');
    let current = 0;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.hidden = i !== current;
        if (slide.hidden) slide.querySelectorAll('audio, video').forEach((player) => player.pause());
      });
      status.textContent = `${current + 1}/${slides.length}`;
    };
    previous.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    gallery.addEventListener('keydown', (event) => {
      if (event.target.closest('audio, video')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    controls.append(previous, status, next); gallery.append(controls); show(0);
  }
  title.after(gallery);
  section.append(copy); container.append(section);
});
