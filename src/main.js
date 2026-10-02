import './styles/main.scss';
import projects from './data/projects.js';
import createSections from './ui/ProjectSections.js';
import ProjectPanel from './ui/ProjectPanel.js';

let viewer;
let activeProject = projects[0];
const panel = new ProjectPanel((open) => {
  document.body.classList.toggle('panel-open', open);
  if (viewer) viewer.panelOpen = open;
});
document.addEventListener('click', (event) => {
  if ((!viewer || document.querySelector('#interaction').style.display === 'none') && !event.target.closest('a, button, .panel')) panel.close();
});
createSections(projects, (project) => {
  if (activeProject.id !== project.id) panel.close();
  activeProject = project; viewer?.activate(project);
}, (project) => panel.open(project));

try {
  const { default: PortfolioScene } = await import('./three/Scene.js');
  viewer = new PortfolioScene(projects, (project) => panel.open(project), () => panel.close());
  viewer.activate(activeProject);
  viewer.panelOpen = panel.isOpen;
} catch (error) {
  console.warn('3D view unavailable:', error);
  document.querySelector('#scene').hidden = true;
  document.querySelector('#interaction').hidden = true;
  document.querySelector('.viewer-status').textContent = '3D view unavailable. Select a project title to explore.';
  document.body.classList.add('no-webgl');
}
