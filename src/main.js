import './styles/main.scss';
import projects, { about, assetUrl } from './data/projects.js';
import createSections from './ui/ProjectSections.js';
import ProjectPanel from './ui/ProjectPanel.js';

let viewer;
const entries = [about, ...projects];
let activeProject = entries[0];
const scrollHint = document.querySelector('#scroll-hint');
const backToTop = document.querySelector('#back-to-top');
backToTop.addEventListener('click', () => {
  panel.close();
  document.querySelector('.wordmark').focus({ preventScroll: true });
  history.replaceState(history.state, '', `${location.pathname}${location.search}`);
  window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
});
const panel = new ProjectPanel((open) => {
  document.body.classList.toggle('panel-open', open);
  if (viewer) viewer.panelOpen = open;
});
document.addEventListener('click', (event) => {
  if ((!viewer || document.querySelector('#interaction').style.display === 'none') && !event.target.closest('a, button, .panel')) panel.close();
});
const openEntry = (entry) => {
  if (entry.kind === 'about') window.location.assign(assetUrl(entry.page));
  else panel.open(entry);
};
createSections(entries, (project) => {
  const isLast = project.id === entries[entries.length - 1].id;
  scrollHint.hidden = isLast;
  backToTop.hidden = !isLast;
  if (activeProject.id !== project.id) panel.close();
  activeProject = project; viewer?.activate(project);
}, openEntry);

// Sections are created dynamically, so resolve incoming links after they exist.
const scrollToHash = () => {
  if (!window.location.hash) return;
  let id;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return; // Ignore malformed URL fragments.
  }
  const target = document.getElementById(id);
  if (!target || !document.querySelector('#portfolio').contains(target)) return;
  target.scrollIntoView({ behavior: 'instant', block: 'start' });
};
window.addEventListener('hashchange', scrollToHash);
scrollToHash();

try {
  const { default: PortfolioScene } = await import('./three/Scene.js');
  viewer = new PortfolioScene(entries, openEntry, () => panel.close());
  viewer.activate(activeProject);
  viewer.panelOpen = panel.isOpen;
} catch (error) {
  console.warn('3D view unavailable:', error);
  document.querySelector('#scene').hidden = true;
  document.querySelector('#interaction').hidden = true;
  document.querySelector('.viewer-status').textContent = '3D view unavailable. Select a project title to explore.';
  document.body.classList.add('no-webgl');
}
