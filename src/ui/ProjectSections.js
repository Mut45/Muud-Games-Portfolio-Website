export default function createSections(projects, onActivate, onOpen) {
  const main = document.querySelector('#portfolio');
  const games = projects.filter((project) => project.kind !== 'about');
  const sections = projects.map((project, index) => {
    const section = document.createElement('section');
    section.className = 'project-section'; section.id = project.id;
    const isAbout = project.kind === 'about';
    const gameIndex = games.indexOf(project);
    if (isAbout) section.classList.add('about-section');
    if (gameIndex === 0) {
      const anchor = document.createElement('span'); anchor.id = 'games'; anchor.className = 'section-anchor';
      section.append(anchor);
    }
    section.setAttribute('aria-labelledby', `title-${project.id}`);
    section.insertAdjacentHTML('beforeend', `<div class="section-label"><span>${isAbout ? 'Muud Games' : 'Selected work'}</span><span>${isAbout ? '' : `${String(gameIndex + 1).padStart(2, '0')} / ${String(games.length).padStart(2, '0')}`}</span></div><div class="project-caption"><p class="eyebrow"></p><h1 id="title-${project.id}">${isAbout ? '<a></a>' : '<button type="button" aria-haspopup="dialog"></button>'}</h1><p class="project-subtitle"></p></div>`);
    section.querySelector('.eyebrow').textContent = isAbout ? 'Introduction' : `Game ${String(gameIndex + 1).padStart(2, '0')}`;
    const trigger = section.querySelector('h1 a, h1 button');
    trigger.textContent = project.title;
    if (isAbout) trigger.href = project.page;
    else trigger.addEventListener('click', () => onOpen(project));
    section.querySelector('.project-subtitle').textContent = project.subtitle;
    main.append(section); return section;
  });
  document.querySelector('.nav-count').textContent = `/ ${String(games.length).padStart(2, '0')}`;
  // The central strip identifies the section containing the viewport midpoint.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) onActivate(projects[sections.indexOf(entry.target)]); });
  }, { rootMargin: '-49% 0px -49% 0px', threshold: 0 });
  sections.forEach((section) => observer.observe(section));
}
