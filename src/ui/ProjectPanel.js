import { assetUrl } from '../data/projects.js';

export default class ProjectPanel {
  constructor(onChange) {
    this.element = document.querySelector('#project-panel'); this.onChange = onChange; this.isOpen = false;
    this.element.querySelector('.panel-close').addEventListener('click', () => this.close());
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') this.close(); });
  }
  open(project) {
    if (!this.isOpen) this.previousFocus = document.activeElement;
    for (const [key, value] of Object.entries({ title: project.title, subtitle: project.subtitle, description: project.description, role: project.role, tools: project.tools.join(' / '), index: 'Project notes' })) {
      document.querySelector(`#panel-${key}`).textContent = value;
    }
    document.querySelector('#panel-link').href = assetUrl(project.page);
    this.element.inert = false; this.element.setAttribute('aria-hidden', 'false');
    this.element.classList.add('is-open'); this.isOpen = true; this.onChange(true);
    this.element.querySelector('.panel-close').focus({ preventScroll: true });
  }
  close() {
    if (!this.isOpen) return;
    const restore = this.element.contains(document.activeElement);
    this.element.inert = true; this.element.setAttribute('aria-hidden', 'true');
    this.element.classList.remove('is-open'); this.isOpen = false; this.onChange(false);
    if (restore && this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
  }
}
