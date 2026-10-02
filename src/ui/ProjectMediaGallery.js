import { assetUrl } from '../data/projects.js';

export default class ProjectMediaGallery {
  constructor(element) {
    this.element = element;
    this.items = [];
    this.selected = -1;
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    element.innerHTML = `
      <div class="media-preview"></div>
      <div class="media-carousel">
        <button type="button" class="media-arrow media-previous" aria-label="Scroll to previous thumbnails" hidden>←</button>
        <div class="media-thumbnails" role="group" aria-label="Project media thumbnails"></div>
        <button type="button" class="media-arrow media-next" aria-label="Scroll to next thumbnails" hidden>→</button>
      </div>
      <p class="media-caption" aria-live="polite"></p>`;
    this.preview = element.querySelector('.media-preview');
    this.strip = element.querySelector('.media-thumbnails');
    this.caption = element.querySelector('.media-caption');
    this.previous = element.querySelector('.media-previous');
    this.next = element.querySelector('.media-next');
    this.previous.addEventListener('click', () => this.scroll(-1));
    this.next.addEventListener('click', () => this.scroll(1));
    this.strip.addEventListener('scroll', () => this.updateControls(), { passive: true });
    this.observer = new ResizeObserver(() => this.updateControls());
    this.observer.observe(this.strip);
  }

  thumbnail(item) {
    if (item.thumbnail) return assetUrl(item.thumbnail);
    if (item.type === 'youtube' && /^[\w-]{11}$/.test(item.videoId ?? '')) return `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`;
    if (item.type === 'image') return assetUrl(item.src);
    return item.poster ? assetUrl(item.poster) : null;
  }

  label(item, index) { return item.title || item.alt || `Media ${index + 1}`; }

  createImage(src, alt, isThumbnail = false) {
    const image = document.createElement('img');
    image.src = src; image.alt = alt; image.decoding = 'async';
    image.draggable = false;
    if (isThumbnail) image.loading = 'lazy';
    image.addEventListener('error', () => {
      const fallback = document.createElement('span'); fallback.className = 'media-unavailable';
      fallback.textContent = isThumbnail ? 'Preview unavailable' : 'Image unavailable';
      image.replaceWith(fallback);
    }, { once: true });
    return image;
  }

  setMedia(items = []) {
    this.clear();
    this.items = items.filter((item) => ['image', 'youtube', 'video'].includes(item.type));
    this.element.hidden = this.items.length === 0;
    this.items.forEach((item, index) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'media-thumbnail';
      const isVideo = item.type !== 'image';
      button.setAttribute('aria-label', `${isVideo ? 'Play' : 'View'} ${this.label(item, index)}`);
      button.setAttribute('aria-pressed', 'false');
      const src = this.thumbnail(item);
      if (src) button.append(this.createImage(src, '', true));
      else { const text = document.createElement('span'); text.textContent = 'Video'; button.append(text); }
      if (isVideo) {
        const play = document.createElement('span'); play.className = 'media-play-icon'; play.textContent = '▶';
        play.setAttribute('aria-hidden', 'true'); button.append(play);
      }
      button.addEventListener('click', () => this.select(index, true));
      button.addEventListener('focus', () => {
        // Scroll only this strip, never the document or the panel's vertical scroller.
        if (button.offsetLeft < this.strip.scrollLeft) this.strip.scrollLeft = button.offsetLeft;
        else if (button.offsetLeft + button.offsetWidth > this.strip.scrollLeft + this.strip.clientWidth) {
          this.strip.scrollLeft = button.offsetLeft + button.offsetWidth - this.strip.clientWidth;
        }
      });
      this.strip.append(button);
    });
    if (this.items.length) this.select(0);
    this.strip.scrollLeft = 0;
    requestAnimationFrame(() => this.updateControls());
  }

  stopPlayback() {
    this.preview.querySelectorAll('video').forEach((video) => {
      video.pause(); video.removeAttribute('src'); video.load();
    });
    // Removing an iframe tears down its player and prevents hidden audio.
    this.preview.replaceChildren();
  }

  select(index, userActivated = false) {
    const item = this.items[index];
    if (!item) return;
    if (this.selected === index && this.preview.querySelector('iframe, video')) return;
    this.stopPlayback(); this.selected = index;
    [...this.strip.children].forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    this.caption.textContent = `${String(index + 1).padStart(2, '0')} / ${String(this.items.length).padStart(2, '0')} — ${this.label(item, index)}`;
    if (item.type === 'image') {
      this.preview.append(this.createImage(assetUrl(item.src), item.alt || item.title || 'Project screenshot'));
    } else if (item.type === 'video') {
      const video = document.createElement('video');
      video.controls = true; video.playsInline = true; video.preload = 'metadata';
      video.src = assetUrl(item.src); video.setAttribute('aria-label', this.label(item, index));
      if (item.poster) video.poster = assetUrl(item.poster);
      video.addEventListener('error', () => {
        if (!video.isConnected) return;
        const message = document.createElement('p'); message.className = 'media-unavailable';
        message.textContent = 'Video unavailable'; this.preview.replaceChildren(message);
      });
      this.preview.append(video);
    } else if (!/^[\w-]{11}$/.test(item.videoId ?? '')) {
      const message = document.createElement('p'); message.className = 'media-unavailable';
      message.textContent = 'Trailer unavailable'; this.preview.append(message);
    } else if (userActivated) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${item.videoId}?autoplay=1&playsinline=1&rel=0`;
      iframe.title = this.label(item, index); iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      this.preview.append(iframe);
    } else {
      // A video first in the array stays a poster until an explicit play action.
      const play = document.createElement('button'); play.type = 'button'; play.className = 'media-poster';
      play.setAttribute('aria-label', `Play ${this.label(item, index)}`);
      play.append(this.createImage(this.thumbnail(item), item.title || 'Video preview'));
      const label = document.createElement('span'); label.className = 'media-poster-label'; label.textContent = '▶ Play video';
      play.append(label); play.addEventListener('click', () => { this.select(index, true); this.preview.querySelector('iframe')?.focus(); });
      this.preview.append(play);
    }
  }

  scroll(direction) {
    this.strip.scrollBy({ left: direction * this.strip.clientWidth * 0.8, behavior: this.reducedMotion.matches ? 'instant' : 'smooth' });
  }

  updateControls() {
    const overflow = this.strip.scrollWidth > this.strip.clientWidth + 2;
    this.previous.hidden = this.next.hidden = !overflow;
    this.previous.disabled = this.strip.scrollLeft < 2;
    this.next.disabled = this.strip.scrollLeft + this.strip.clientWidth >= this.strip.scrollWidth - 2;
  }

  clear() {
    this.stopPlayback(); this.items = []; this.selected = -1;
    this.strip.replaceChildren(); this.caption.textContent = '';
    this.previous.hidden = this.next.hidden = true;
  }
}
