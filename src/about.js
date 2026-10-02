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
  const text = document.createElement('p'); text.textContent = interest.description;
  copy.append(number, title, text);
  const gallery = document.createElement('div'); gallery.className = 'interest-gallery';
  if (!interest.images?.length) {
    const slot = document.createElement('div'); slot.className = 'photo-placeholder';
    slot.textContent = 'Photo space';
    gallery.append(slot);
  }
  for (const photo of interest.images ?? []) {
    const figure = document.createElement('figure');
    const image = document.createElement('img'); image.src = assetUrl(photo.src); image.alt = photo.alt ?? '';
    image.loading = 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => {
      const fallback = document.createElement('div'); fallback.className = 'photo-placeholder';
      fallback.textContent = photo.alt || 'Photo unavailable'; image.replaceWith(fallback);
    }, { once: true });
    figure.append(image);
    if (photo.caption) { const caption = document.createElement('figcaption'); caption.textContent = photo.caption; figure.append(caption); }
    gallery.append(figure);
  }
  section.append(copy, gallery); container.append(section);
});
