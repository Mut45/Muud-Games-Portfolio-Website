import { assetUrl } from '../data/projects.js';
import ProjectMediaGallery from './ProjectMediaGallery.js';

export default class ProjectPanel {
  constructor(onChange) {
    this.element = document.querySelector('#project-panel'); this.onChange = onChange; this.isOpen = false;
    this.gallery = new ProjectMediaGallery(this.element.querySelector('.project-media'));
    this.navigation = document.querySelector('.navigation');
    this.updateBounds = () => {
      if (!this.isOpen || !this.section) return;
      const section = this.section.getBoundingClientRect();
      const top = Math.max(this.navigation.getBoundingClientRect().bottom + 16, section.top + 16);
      const bottom = Math.min(innerHeight - 24, section.bottom - 16);
      this.element.style.setProperty('--panel-center', `${(top + bottom) / 2}px`);
      this.element.style.setProperty('--panel-available-height', `${Math.max(0, bottom - top)}px`);
    };
    window.addEventListener('scroll', this.updateBounds, { passive: true });
    window.addEventListener('resize', this.updateBounds);
    this.element.querySelector('.panel-close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') this.close(); });
  }
  open(project) {
    if (!this.isOpen) this.previousFocus = document.activeElement;
    for (const [key, value] of Object.entries({ title: project.title, subtitle: project.subtitle, description: project.description, role: project.role, tools: project.tools.join(' / '), index: 'Games' })) {
      document.querySelector(`#panel-${key}`).textContent = value;
    }
    document.querySelector('#panel-link').href = assetUrl(project.page);
    this.gallery.setMedia(project.media ?? []);
    this.element.querySelector('.panel-body').scrollTop = 0;
    this.element.inert = false; this.element.setAttribute('aria-hidden', 'false');
    this.element.classList.add('is-open'); this.isOpen = true; this.onChange(true);
    this.section = document.getElementById(project.id);
    this.updateBounds();
    this.element.querySelector('.panel-close').focus({ preventScroll: true });
  }
  close() {
    if (!this.isOpen) return;
    this.gallery.clear();
    const restore = this.element.contains(document.activeElement);
    this.element.inert = true; this.element.setAttribute('aria-hidden', 'true');
    this.element.classList.remove('is-open'); this.isOpen = false; this.onChange(false);
    if (restore && this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
