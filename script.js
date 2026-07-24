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

  function getCategoryCount(category) {
    if (category === 'ALL') return projects.length;
    return projects.filter(p =>
      p.categories.some(c => c.toUpperCase() === category)
    ).length;
  }

  function renderFilters() {
    if (!filterContainer) return;
    filterContainer.innerHTML = '';
    getAllCategories().forEach(category => {
      const group = document.createElement('div');
      group.className = 'filter-group';

      const button = document.createElement('button');
      button.className = 'filter-item';
      button.type = 'button';
      if (category === activeFilter) button.classList.add('active');
      button.textContent = category;

      const count = document.createElement('span');
      count.className = 'filter-count';
      count.textContent = getCategoryCount(category);

      button.addEventListener('click', () => {
        activeFilter = category;
        renderFilters();
        renderProjects(currentView);
      });

      group.appendChild(button);
      group.appendChild(count);
      filterContainer.appendChild(group);
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
    document.fonts.ready.then(runMarquees);
  }

  if (gridBtn) gridBtn.addEventListener('click', () => renderProjects('grid'));
  if (listBtn) listBtn.addEventListener('click', () => renderProjects('list'));

  function runMarquees() {
    var selector = currentView === 'grid'
      ? '.work .desc h3'
      : '.work .meta p';

    container.querySelectorAll(selector).forEach(function (el) {
      var track = el.querySelector('.title-track');
      var originalText;

      if (track) {
        // Already initialised: recover original text from the single primary span
        originalText = track.firstElementChild.textContent;
        // Remove any clone that was added on a previous run
        var staleClone = track.querySelector('[aria-hidden="true"]');
        if (staleClone) staleClone.remove();
        // Clear animation state so measurement is unaffected
        track.classList.remove('is-scrolling');
        track.style.removeProperty('--marquee-offset');
        track.style.removeProperty('--marquee-duration');
      } else {
        // Fresh element: plain text, wrap in a single-span track
        originalText = el.textContent.trim();
        el.innerHTML = '';

        track = document.createElement('span');
        track.className = 'title-track';

        var primary = document.createElement('span');
        primary.textContent = originalText;
        track.appendChild(primary);
        el.appendChild(track);
      }

      // Measure with exactly one copy present — no clone bias
      var singleCopy = track.firstElementChild;
      var containerW = el.clientWidth;
      var textW = singleCopy.offsetWidth;

      // Title fits: leave it static, do not create a clone
      if (textW <= containerW) return;

      // Title overflows: add clone and start marquee
      var clone = document.createElement('span');
      clone.setAttribute('aria-hidden', 'true');
      clone.textContent = originalText;
      track.appendChild(clone);

      var gapPx = parseFloat(getComputedStyle(track).columnGap) || 32;
      var offset = textW + gapPx;
      var duration = Math.max(4, offset / 50);

      track.style.setProperty('--marquee-offset', '-' + offset + 'px');
      track.style.setProperty('--marquee-duration', duration + 's');
      track.classList.add('is-scrolling');
    });
  }

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(runMarquees, 200);
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(runMarquees, 350);
  });

  renderFilters();
  renderProjects(currentView);
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