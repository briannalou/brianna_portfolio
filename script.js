/* portrait image detection */
(function () {
  function detect(img) {
    if (img.closest && img.closest('.pj-hero')) return;
    if (!img.naturalWidth || img.naturalHeight <= img.naturalWidth) return;

    // Gallery half-grid: swap container class so image shows at natural proportions
    var galleryHalf = img.closest && img.closest('.pj-gallery__half');
    if (galleryHalf) {
      galleryHalf.classList.remove('pj-gallery__half');
      galleryHalf.classList.add('pj-gallery__vertical');
      return;
    }

    // Already in a vertical gallery container (manually placed): skip
    if (img.closest && img.closest('.pj-gallery__vertical')) return;
  }

  function watch(img) {
    if (img.complete && img.naturalWidth > 0) {
      detect(img);
    } else {
      img.addEventListener('load', function () { detect(img); }, { once: true });
    }
  }

  document.querySelectorAll('img').forEach(watch);

  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'IMG') {
          watch(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('img').forEach(watch);
        }
      });
    });
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();

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
  }

  if (gridBtn) gridBtn.addEventListener('click', () => renderProjects('grid'));
  if (listBtn) listBtn.addEventListener('click', () => renderProjects('list'));

  renderFilters();
  renderProjects(currentView);
})();

/* recent work on home page */
(function () {
  var list = document.getElementById('recent-list');
  if (!list) return;

  var sorted = projects.slice().sort(function (a, b) {
    return Number(b.time) - Number(a.time);
  });
  var recent = sorted.slice(0, 3);

  recent.forEach(function (project) {
    var a = document.createElement('a');
    a.className = 'recent-item';
    if (project.link) a.href = project.link;
    a.innerHTML =
      '<div class="recent-meta">' +
        '<span class="r-title">' + project.title + '</span>' +
        '<span class="r-year">'  + project.time + '</span>' +
        '<span class="r-cat">'   + project.categories.join(', ') + '</span>' +
        '<span class="r-desc">'  + (project.desc || '') + '</span>' +
      '</div>' +
      '<img src="' + project.image + '" alt="' + project.title + '" loading="lazy">';
    list.appendChild(a);
  });
})();

/* home gallery — projects 4–10 */
(function () {
  var track = document.getElementById('hgal-track');
  if (!track) return;

  var sorted = projects.slice().sort(function (a, b) { return Number(b.time) - Number(a.time); });
  var items = sorted.slice(3, 10);

  if (items.length === 0) {
    var section = track.closest('.home-gallery');
    if (section) section.hidden = true;
    return;
  }

  items.forEach(function (project) {
    var a = document.createElement('a');
    a.className = 'hgal-item';
    if (project.link) a.href = project.link;
    var img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;
    img.loading = 'lazy';
    a.appendChild(img);
    track.appendChild(a);
  });

  var showAll = document.createElement('a');
  showAll.className = 'hgal-item hgal-item--all';
  showAll.href = '/projects/index.html';
  showAll.textContent = 'Show all';
  track.appendChild(showAll);

  var gallery = track.closest('.home-gallery');

  // Desktop only: convert vertical wheel to horizontal scroll on the gallery
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  gallery.addEventListener('wheel', function (e) {
    // Trackpad horizontal swipe (deltaX dominant): let browser handle natively
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

    var atLeft  = track.scrollLeft <= 0;
    var atRight = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

    // At a boundary scrolling further in the same direction: pass through to page
    if ((e.deltaY < 0 && atLeft) || (e.deltaY > 0 && atRight)) return;

    e.preventDefault();
    track.scrollLeft += e.deltaY;
  }, { passive: false });
})();

/* pj-end bottom nav — slide in when mouse nears screen bottom */
(function () {
  var pjEnd = document.querySelector('.pj-end');
  if (!pjEnd) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var THRESHOLD = 80;
  var nearBottom = false;
  var onNav = false;
  var rafId = null;

  function update() {
    pjEnd.classList.toggle('is-visible', nearBottom || onNav);
  }

  document.addEventListener('mousemove', function (e) {
    if (rafId) return;
    rafId = requestAnimationFrame(function () {
      rafId = null;
      nearBottom = (window.innerHeight - e.clientY) <= THRESHOLD;
      update();
    });
  });

  document.addEventListener('mouseleave', function () {
    nearBottom = false;
    update();
  });

  pjEnd.addEventListener('mouseenter', function () {
    onNav = true;
    update();
  });

  pjEnd.addEventListener('mouseleave', function () {
    onNav = false;
    update();
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
      setTimeout(() => char.classList.add('is-revealed'), i * 1);
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

  function place(el) {}

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

  place(active);

  links.forEach(link => {
    link.addEventListener('mouseenter', () => place(link));
    link.addEventListener('touchstart', () => place(link), { passive: true });
  });

  nav.addEventListener('mouseleave', () => place(active));
})();

/* video sound toggle */
(function () {
    function hasAudio(video) {
        if (typeof video.audioTracks !== 'undefined') return video.audioTracks.length > 0;
        if (typeof video.mozHasAudio !== 'undefined') return video.mozHasAudio;
        return true; // API unavailable — show button as safe default
    }

    document.querySelectorAll('video').forEach(function (video) {
        // Wrap video in a relatively-positioned container for the button
        var wrap = document.createElement('div');
        wrap.className = 'vid-wrap';
        video.parentNode.insertBefore(wrap, video);
        wrap.appendChild(video);

        // Build button — hidden until audio track is confirmed
        var btn = document.createElement('button');
        btn.className = 'vid-sound';
        btn.textContent = 'Sound On';
        btn.setAttribute('aria-pressed', 'false');
        btn.style.display = 'none';
        wrap.appendChild(btn);

        // Reveal button only if the video has an audio track
        video.addEventListener('loadedmetadata', function () {
            if (hasAudio(video)) btn.style.display = '';
        });

        // Toggle mute — each button controls only its own video
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            video.muted = !video.muted;
            btn.textContent = video.muted ? 'Sound On' : 'Sound Off';
            btn.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
        });
    });
})();