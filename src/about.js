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
  if (!interest.images?.length) {
    const slot = document.createElement('div'); slot.className = 'photo-placeholder';
    slot.textContent = 'Photo space';
    gallery.append(slot);
  }
  const slides = [];
  for (const photo of interest.images ?? []) {
    const figure = document.createElement('figure');
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
    gallery.setAttribute('aria-label', `${interest.title} photos`);
    const controls = document.createElement('div'); controls.className = 'interest-gallery-controls';
    const previous = document.createElement('button'); previous.type = 'button'; previous.textContent = '←'; previous.setAttribute('aria-label', 'Previous photo');
    const next = document.createElement('button'); next.type = 'button'; next.textContent = '→'; next.setAttribute('aria-label', 'Next photo');
    const status = document.createElement('span'); status.setAttribute('role', 'status'); status.setAttribute('aria-atomic', 'true');
    let current = 0;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => { slide.hidden = i !== current; });
      status.textContent = `Photo ${current + 1} / ${slides.length}`;
    };
    previous.addEventListener('click', () => show(current - 1));
    next.addEventListener('click', () => show(current + 1));
    gallery.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    });
    controls.append(previous, status, next); gallery.append(controls); show(0);
  }
  title.after(gallery);
  section.append(copy); container.append(section);
});
