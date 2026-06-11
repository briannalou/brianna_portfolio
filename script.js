/* gallery */
(function () {
  const container = document.querySelector('.work-list');
  const gridBtn = document.getElementById('grid-view');
  const listBtn = document.getElementById('list-view');
  const filterContainer = document.getElementById('list');

  if (!container) return;

  let currentView = 'grid';
  let activeFilter = 'ALL';

  function getAllCategories() {
    const set = new Set();
    projects.forEach(project => {
      project.categories.forEach(category => set.add(category.toUpperCase()));
    });
    return ['ALL', ...set];
  }

  function getFilteredProjects() {
    if (activeFilter === 'ALL') return projects;
    return projects.filter(project =>
      project.categories.some(category => category.toUpperCase() === activeFilter)
    );
  }

  function renderFilters() {
    if (!filterContainer) return;
    filterContainer.innerHTML = '';
    getAllCategories().forEach(category => {
      const button = document.createElement('button');
      button.className = 'filter-item';
      button.type = 'button';
      button.textContent = category;
      if (category === activeFilter) button.classList.add('active');
      button.addEventListener('click', () => {
        activeFilter = category;
        renderFilters();
        renderProjects(currentView);
      });
      filterContainer.appendChild(button);
    });
  }

  function renderProjects(view = 'grid') {
    currentView = view;
    container.classList.remove('grid-view', 'list-view');
    container.classList.add(`${view}-view`);
    container.innerHTML = '';
    getFilteredProjects().forEach(project => {
      const item = document.createElement('a');
      item.className = 'work';
      item.href = project.link;
      if (view === 'grid') {
        item.innerHTML = `
          <div class="desc">
            <h3>${project.title}</h3>
            <span class="desc__year">${project.time}</span>
          </div>
          <img src="${project.image}" alt="${project.alt}" loading="lazy">
        `;
      } else {
        item.innerHTML = `
          <div class="meta">
            <p>${project.title}</p>
            <h3>${project.time}</h3>
            <h3>${project.categories.join(', ')}</h3>
          </div>
          <div class="hover-image">
            <img src="${project.image}" alt="${project.alt}" loading="lazy">
          </div>
        `;
      }
      container.appendChild(item);
    });
    if (gridBtn) gridBtn.classList.toggle('active', currentView === 'grid');
    if (listBtn) listBtn.classList.toggle('active', currentView === 'list');
  }

  if (gridBtn) gridBtn.addEventListener('click', () => renderProjects('grid'));
  if (listBtn) listBtn.addEventListener('click', () => renderProjects('list'));

  renderFilters();
  renderProjects(currentView);
})();

/* contact widget */
(function () {
  const widget = document.querySelector('.contact-widget');
  if (!widget) return;

  const trigger = widget.querySelector('.contact-widget__trigger');
  const popup   = widget.querySelector('.contact-widget__popup');
  const menu    = widget.querySelector('.contact-widget__menu');
  const slider  = widget.querySelector('.contact-widget__slider');
  const links   = widget.querySelectorAll('.contact-widget__link');

  let closeTimer;
  let useHover = true;

  function open() {
    clearTimeout(closeTimer);
    widget.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  function close() {
    widget.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  function scheduleClose() {
    closeTimer = setTimeout(close, 150);
  }

  function placeSlider(el) {
    slider.style.top    = el.offsetTop + 'px';
    slider.style.height = el.offsetHeight + 'px';
  }

  slider.style.transition = 'none';
  placeSlider(links[0]);
  requestAnimationFrame(() => { slider.style.transition = ''; });

  links.forEach(link => {
    link.addEventListener('mouseenter', () => placeSlider(link));
    link.addEventListener('touchstart',  () => placeSlider(link), { passive: true });
  });
  menu.addEventListener('mouseleave', () => placeSlider(links[0]));

  trigger.addEventListener('touchstart', () => { useHover = false; }, { once: true, passive: true });

  trigger.addEventListener('mouseenter', () => { if (useHover) open(); });
  trigger.addEventListener('mouseleave', () => { if (useHover) scheduleClose(); });
  popup.addEventListener('mouseenter',   () => { if (useHover) clearTimeout(closeTimer); });
  popup.addEventListener('mouseleave',   () => { if (useHover) scheduleClose(); });

  trigger.addEventListener('click', () => {
    if (useHover) return;
    widget.classList.contains('is-open') ? close() : open();
  });

  document.addEventListener('click', (e) => {
    if (useHover) return;
    if (!widget.contains(e.target)) close();
  });
})();

/* reading reveal */
(function () {
  const article = document.querySelector('article');
  if (!article) return;

  const p = article.querySelector('p');
  if (!p) return;

  const text = p.textContent;
  const fragment = document.createDocumentFragment();
  text.split('').forEach(char => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char;
    fragment.appendChild(span);
  });
  p.innerHTML = '';
  p.appendChild(fragment);

  const chars = p.querySelectorAll('.char');

  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    chars.forEach((char, i) => {
      setTimeout(() => char.classList.add('is-revealed'), i * 25);
    });
    observer.unobserve(article);
  }, { threshold: 0.1 });

  observer.observe(article);
})();

/* ny clock */
(function () {
  const el = document.getElementById('ny-clock');
  if (!el) return;

  function update() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
    });
    el.textContent = time + ', New York, NY';
  }

  update();

  const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;
  setTimeout(function () {
    update();
    setInterval(update, 60000);
  }, msUntilNextMinute);
})();

/* pill nav */
(function () {
  const nav = document.querySelector('.pill-nav');
  if (!nav) return;

  const slider = nav.querySelector('.pill-nav__slider');
  const links  = nav.querySelectorAll('a');

  function place(el) {
    slider.style.left  = el.offsetLeft + 'px';
    slider.style.width = el.offsetWidth + 'px';
  }

  function findActive() {
    const path = window.location.pathname;
    for (const link of links) {
      const href = new URL(link.href).pathname;
      if (
        href === path ||
        href.replace('/index.html', '/') === path ||
        href.replace('/index.html', '') === path
      ) return link;
    }
    for (const link of links) {
      const dir = new URL(link.href).pathname.replace(/index\.html$/, '');
      if (dir.length > 1 && path.startsWith(dir)) return link;
    }
    return links[0];
  }

  const active = findActive();
  active.classList.add('is-active');

  slider.style.transition = 'none';
  place(active);
  requestAnimationFrame(() => { slider.style.transition = ''; });

  links.forEach(link => {
    link.addEventListener('mouseenter', () => place(link));
    link.addEventListener('touchstart', () => place(link), { passive: true });
  });

  nav.addEventListener('mouseleave', () => place(active));
})();