export default function createSections(projects, onActivate, onOpen) {
  const main = document.querySelector('#games');
  const sections = projects.map((project, index) => {
    const section = document.createElement('section');
    section.className = 'project-section'; section.id = project.id;
    section.setAttribute('aria-labelledby', `title-${project.id}`);
    section.innerHTML = `<div class="section-label"><span>Selected work</span><span>${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</span></div><div class="project-caption"><p class="eyebrow"></p><h1 id="title-${project.id}"><button type="button" aria-haspopup="dialog"></button></h1><p class="project-subtitle"></p></div>`;
    section.querySelector('.eyebrow').textContent = `Game ${String(index + 1).padStart(2, '0')}`;
    section.querySelector('button').textContent = project.title;
    section.querySelector('button').addEventListener('click', () => onOpen(project));
    section.querySelector('.project-subtitle').textContent = project.subtitle;
    main.append(section); return section;
  });
  document.querySelector('.nav-count').textContent = `/ ${String(projects.length).padStart(2, '0')}`;
  // The central strip identifies the section containing the viewport midpoint.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) onActivate(projects[sections.indexOf(entry.target)]); });
  }, { rootMargin: '-49% 0px -49% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
