/* portrait image detection */
(function () {
  function detect(img) {
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

/* cursor pager — left/right quarters of an area act as Previous / Next.
   Shared by project detail pages (whole window) and the Archive modal (dialog box). */
function createCursorPager(opts) {
  // opts.host:   element the follower text lives in (inside a <dialog> when used there)
  // opts.state:  element that gets .is-paging (hides the system cursor via CSS)
  // opts.labels: { prev, next } elements whose text the follower shows
  // opts.ignore: selector for elements that keep their own cursor and click behaviour
  // opts.area:   optional () => DOMRect limiting the zones; defaults to the window
  // opts.active: optional () => boolean; zones only work while it returns true
  // opts.onPage: (dir) => void, dir is 'prev' or 'next'
  var cursor = document.createElement('div');
  cursor.className = 'pj-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  opts.host.appendChild(cursor);

  var x = 0, y = 0, target = null, rafId = null;

  function zoneAt(px, py, el) {
    if (!el || (opts.active && !opts.active())) return null;
    if (el.closest && el.closest(opts.ignore)) return null;
    var r = opts.area ? opts.area() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight, width: window.innerWidth };
    if (px < r.left || px > r.right || py < r.top || py > r.bottom) return null;
    if (px < r.left + r.width / 4) return 'prev';
    if (px > r.left + r.width * 3 / 4) return 'next';
    return null;
  }

  function render() {
    rafId = null;
    var zone = zoneAt(x, y, target);
    opts.state.classList.toggle('is-paging', !!zone);
    cursor.classList.toggle('is-on', !!zone);
    if (!zone) return;
    var text = opts.labels[zone].textContent;
    if (cursor.textContent !== text) cursor.textContent = text;
    cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) translate(-50%,-50%)';
  }
  function schedule() { if (!rafId) rafId = requestAnimationFrame(render); }

  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY; target = e.target;
    schedule();
  });

  // Hide when the pointer leaves the window
  document.addEventListener('mouseout', function (e) {
    if (e.relatedTarget) return;
    target = null;
    schedule();
  });

  document.addEventListener('click', function (e) {
    var dir = zoneAt(e.clientX, e.clientY, e.target);
    if (!dir || e.button !== 0) return;
    e.preventDefault();
    opts.onPage(dir);
  });

  return { refresh: schedule };
}

/* desc can be a string or an array of { text, link } paragraphs (Archive modal);
   places that show a single line use the first paragraph's text */
function descText(desc) {
  if (Array.isArray(desc)) return desc.length ? desc[0].text || '' : '';
  return desc || '';
}

/* all projects — index + images */
(function () {
  var media = document.querySelector('.ap-media');
  if (!media) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function byTimeDesc(a, b) { return Number(b.time) - Number(a.time); }
  var groups = {
    main:  projects.filter(function (p) { return p.type !== 'small'; }).sort(byTimeDesc),
    small: projects.filter(function (p) { return p.type === 'small'; }).sort(byTimeDesc)
  };

  var links = [];   // left-column links, in display order
  var items = [];   // right-column items, same order
  var archive = []; // Archive entries in grid order: { project, item, index into items }

  Object.keys(groups).forEach(function (key) {
    var list = document.getElementById('ap-list-' + key);
    var box  = document.getElementById('ap-media-' + key);

    if (groups[key].length === 0) {
      document.querySelectorAll('.ap-group[data-group="' + key + '"]').forEach(function (el) {
        el.hidden = true;
      });
      return;
    }

    groups[key].forEach(function (project) {
      var id = 'ap-' + project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      var item;
      if (key === 'main') {
        item = document.createElement('a');
        item.href = project.link;
      } else {
        // Archive projects have no detail page: open the modal instead
        item = document.createElement('button');
        item.type = 'button';
        var archiveIndex = archive.length;
        archive.push({ project: project, item: item, index: items.length });
        item.addEventListener('click', function () { openModal(archiveIndex); });
      }
      item.className = 'ap-item';
      item.id = id;
      if (key === 'main') {
        var meta = document.createElement('div');
        meta.className = 'ap-meta';
        meta.innerHTML = '<span class="ap-meta__text"></span><span class="ap-meta__year"></span>';
        meta.firstChild.textContent = descText(project.desc);
        meta.lastChild.textContent = project.time;
        item.appendChild(meta);
      }
      var img = document.createElement('img');
      img.src = project.image;
      img.alt = project.alt || project.title;
      img.loading = 'lazy';
      item.appendChild(img);
      box.appendChild(item);

      var li = document.createElement('li');
      var link = document.createElement('a');
      link.className = 'ap-link';
      link.href = '#' + id;
      link.textContent = project.title;
      li.appendChild(link);
      list.appendChild(li);

      links.push(link);
      items.push(item);
    });
  });

  // Archive modal (native <dialog> in projects/index.html)
  var modal  = document.querySelector('.ap-modal');
  var mImg   = modal.querySelector('.ap-modal__media img');
  var mTitle = modal.querySelector('.pj-title');
  var mTime  = modal.querySelector('.ap-modal__time');
  var mTags  = modal.querySelector('.pj-tags');
  var mDesc  = modal.querySelector('.ap-modal__desc');
  var mText  = modal.querySelector('.ap-modal__text');
  var mPrev  = modal.querySelector('.pj-end__link[data-dir="prev"]');
  var mNext  = modal.querySelector('.pj-end__link[data-dir="next"]');
  var current = 0;
  var closeTimer = null;
  var switchTimer = null;

  function fill(project) {
    mImg.src = project.image;
    mImg.alt = project.title;
    mTitle.textContent = project.title;
    mTime.textContent = project.time;
    mTags.innerHTML = '';
    (project.tags || []).concat(project.tools || []).forEach(function (t) {
      var tag = document.createElement('span');
      tag.className = 'pj-tag';
      tag.textContent = t;
      mTags.appendChild(tag);
    });
    renderDesc(project.desc);
    mText.scrollTop = 0;
    modal.scrollTop = 0;
  }

  // Description: a string → one paragraph; an array → one paragraph per item,
  // each optionally followed by a link (built with elements, no innerHTML)
  function renderDesc(desc) {
    mDesc.textContent = '';
    var paras = Array.isArray(desc) ? desc : (desc ? [{ text: desc }] : []);
    paras.forEach(function (para) {
      var p = document.createElement('p');
      p.textContent = para.text || '';
      if (para.link && para.link.url) {
        p.appendChild(document.createTextNode(' '));
        var a = document.createElement('a');
        a.href = para.link.url;
        a.textContent = para.link.text || para.link.url;
        if (/^https?:\/\//i.test(para.link.url)) { a.target = '_blank'; a.rel = 'noopener'; }
        p.appendChild(a);
      }
      mDesc.appendChild(p);
    });
  }

  // Warm the cache for the neighbours so switching is instant
  function preloadAround(i) {
    [i - 1, i + 1].forEach(function (n) {
      new Image().src = archive[(n + archive.length) % archive.length].project.image;
    });
  }

  // Previous / Next inside the modal: Archive projects only, grid order, looping
  function page(dir) {
    if (!modal.open || archive.length < 2) return;
    current = (current + (dir === 'prev' ? -1 : 1) + archive.length) % archive.length;
    var project = archive[current].project;
    preloadAround(current);
    clearTimeout(switchTimer);
    if (reduceMotion) { fill(project); return; }
    modal.classList.add('is-switching');
    switchTimer = setTimeout(function () {
      fill(project);
      modal.classList.remove('is-switching');
    }, 150);
  }

  function openModal(i) {
    clearTimeout(closeTimer);
    clearTimeout(switchTimer);
    modal.classList.remove('is-open', 'is-switching');
    current = i;
    fill(archive[i].project);
    preloadAround(i);
    if (!modal.open) modal.showModal();
    lockScroll();
    void modal.offsetWidth; // commit the hidden state so the fade-in transition runs
    modal.classList.add('is-open');
  }

  // Lock background scroll without layout shift: hiding the scrollbar widens the page,
  // so pad the body by the scrollbar's width while locked
  var scrollY = 0;
  function lockScroll() {
    var root = document.documentElement;
    if (root.classList.contains('has-modal')) return;
    var scrollbar = window.innerWidth - root.clientWidth;
    scrollY = window.scrollY;
    root.classList.add('has-modal');
    if (scrollbar > 0) document.body.style.paddingRight = scrollbar + 'px';
  }
  function unlockScroll() {
    document.documentElement.classList.remove('has-modal');
    document.body.style.paddingRight = '';
    window.scrollTo(0, scrollY);
  }

  // Every way of closing (button, Esc, backdrop) goes through here
  function closeModal() {
    if (!modal.open) return;
    modal.classList.remove('is-open');
    closeTimer = setTimeout(function () {
      modal.close();
      modal.classList.remove('is-switching');
      unlockScroll();
      // Focus and highlight the project that was showing last
      var shown = archive[current];
      setActive(shown.index);
      shown.item.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 200);
  }

  modal.querySelector('.ap-modal__close').addEventListener('click', closeModal);
  // Clicks on the dialog element itself land on the backdrop (the inner wrapper fills the box)
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  modal.addEventListener('cancel', function (e) { e.preventDefault(); closeModal(); });
  modal.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); page('prev'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); page('next'); }
  });
  mPrev.addEventListener('click', function () { page('prev'); });
  mNext.addEventListener('click', function () { page('next'); });

  // Touch: swipe left / right on the image
  var touchX = 0, touchY = 0;
  var mMedia = modal.querySelector('.ap-modal__media');
  mMedia.addEventListener('touchstart', function (e) {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  mMedia.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) page(dx > 0 ? 'prev' : 'next');
  });

  // Mouse: left / right quarters of the modal box (same cursor as project detail pages)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    modal.classList.add('has-pager');
    var mInner = modal.querySelector('.ap-modal__inner');
    createCursorPager({
      host: modal,
      state: modal,
      labels: { prev: mPrev, next: mNext },
      ignore: 'a, button, video, input, select, textarea, label, [role="button"], .pj-tag',
      area: function () { return mInner.getBoundingClientRect(); },
      active: function () { return modal.open; },
      onPage: page
    });
  }

  var lockUntil = 0;

  function setActive(index) {
    links.forEach(function (link, i) { link.classList.toggle('is-active', i === index); });
  }

  // Click on index: scroll right column to the matching image
  links.forEach(function (link, i) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var item = items[i];
      item.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setActive(i);
      lockUntil = Date.now() + 1000;

      if (item.parentElement.classList.contains('ap-small')) {
        item.classList.add('is-flash');
        setTimeout(function () { item.classList.remove('is-flash'); }, 1200);
      }
    });
  });

  // Scroll highlight: among items in the band below the nav, the last one
  // whose top has passed a reading line (so a tall previous item doesn't win)
  var navH = (document.querySelector('.pill-nav') || { offsetHeight: 0 }).offsetHeight;
  var visible = new Set();

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    if (Date.now() < lockUntil) return;
    var line = navH + window.innerHeight * 0.3;
    var active = -1;
    for (var i = 0; i < items.length; i++) {
      if (!visible.has(items[i])) continue;
      if (active === -1 || items[i].getBoundingClientRect().top <= line) active = i;
    }
    if (active !== -1) setActive(active);
  }, { rootMargin: '-' + navH + 'px 0px -50% 0px' });

  items.forEach(function (item) { observer.observe(item); });
})();

/* recent work on home page */
(function () {
  var list = document.getElementById('recent-list');
  if (!list) return;

  var sorted = projects.filter(function (p) { return p.type === 'main'; }).sort(function (a, b) {
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
        '<span class="r-desc">'  + descText(project.desc) + '</span>' +
      '</div>' +
      '<img src="' + project.image + '" alt="' + project.title + '" loading="lazy">';
    list.appendChild(a);
  });
})();

/* project detail — divider wherever media and a text section meet */
(function () {
  document.querySelectorAll('.pj-gallery').forEach(function (gallery) {
    var kids = Array.prototype.slice.call(gallery.children);
    for (var i = 1; i < kids.length; i++) {
      var aText = kids[i - 1].classList.contains('pj-section');
      var bText = kids[i].classList.contains('pj-section');
      if (aText === bText) continue;
      var hr = document.createElement('hr');
      hr.className = 'pj-divider';
      gallery.insertBefore(hr, kids[i]);
    }
  });
})();

/* project pager — left/right quarters of the screen act as Previous / Next */
(function () {
  // Detail pages use links; the Archive modal's buttons are handled in the All Projects block
  var prev = document.querySelector('a.pj-end__link[data-dir="prev"]');
  var next = document.querySelector('a.pj-end__link[data-dir="next"]');
  if (!prev || !next) return;

  // Loop through main projects only, newest first (same order as All Projects)
  var mains = projects.filter(function (p) { return p.type === 'main'; })
    .sort(function (a, b) { return Number(b.time) - Number(a.time); });
  var here = -1;
  mains.forEach(function (p, i) { if (p.link === window.location.pathname) here = i; });
  if (here !== -1) {
    prev.href = mains[(here - 1 + mains.length) % mains.length].link;
    next.href = mains[(here + 1) % mains.length].link;
  }

  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var root = document.documentElement;
  root.classList.add('has-pager');

  createCursorPager({
    host: document.body,
    state: root,
    labels: { prev: prev, next: next },
    ignore: 'a, button, video, input, select, textarea, label, [role="button"], .pill-nav, .site-footer',
    onPage: function (dir) { window.location.href = (dir === 'prev' ? prev : next).href; }
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

/* site footer — rendered on every page from `site` in data.js */
(function () {
  if (typeof site === 'undefined') return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function block(cls, title) {
    var b = el('div', 'sf-block ' + cls);
    if (title) b.appendChild(el('p', 'sf-title', title));
    return b;
  }
  function mail(cls, text) {
    var a = el('a', cls, text);
    a.href = 'mailto:' + site.email;
    return a;
  }

  var footer = el('footer', 'site-footer');

  // DOM order = mobile order: id → contact → currently → links → time → copyright
  var id = block('sf-id');
  id.appendChild(el('p', null, site.name));
  id.appendChild(el('p', null, site.role));
  id.appendChild(el('p', null, site.location));

  var contact = block('sf-contact', site.contactTitle);
  contact.appendChild(el('p', null, site.email));
  var cta = mail('sf-cta');
  cta.appendChild(el('span', null, site.emailCta));
  cta.appendChild(el('span', 'sf-cta__arrow', '→'));
  contact.appendChild(cta);

  var currently = block('sf-currently', site.currentlyTitle);
  var dl = el('dl', 'sf-table');
  site.currently.forEach(function (row) {
    dl.appendChild(el('dt', null, row[0]));
    dl.appendChild(el('dd', null, row[1]));
  });
  currently.appendChild(dl);

  var links = block('sf-links');
  var ul = el('ul');
  site.links.forEach(function (link) {
    var li = el('li');
    var a = el('a', null, link.label);
    a.href = link.href;
    if (link.external) { a.target = '_blank'; a.rel = 'noopener'; }
    li.appendChild(a);
    ul.appendChild(li);
  });
  links.appendChild(ul);

  var time = block('sf-time');
  var clock = el('p', 'sf-clock');
  time.appendChild(clock);

  var copy = block('sf-copy');
  copy.appendChild(el('p', null, '©' + new Date().getFullYear()));

  [id, contact, currently, links, time, copy].forEach(function (b) { footer.appendChild(b); });
  document.body.appendChild(footer);

  // New York time, independent of the visitor's own time zone
  var TZ = 'America/New_York';
  var timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  var abbrFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'short' });
  var offsetFmt;
  try { offsetFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'shortOffset' }); } catch (e) { offsetFmt = null; }

  function zonePart(fmt, date) {
    var part = fmt.formatToParts(date).filter(function (p) { return p.type === 'timeZoneName'; })[0];
    return part ? part.value : '';
  }
  function utcOffset(date) {
    var hours;
    if (offsetFmt) {
      var m = zonePart(offsetFmt, date).match(/GMT([+-]\d+)?/);
      hours = m && m[1] ? parseInt(m[1], 10) : 0;
    } else {
      // Fallback: compare New York wall-clock time with UTC
      var ny = new Date(date.toLocaleString('en-US', { timeZone: TZ }));
      var utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      hours = Math.round((ny - utc) / 3600000);
    }
    return hours === 0 ? 'UTC' : 'UTC' + (hours < 0 ? '−' : '+') + Math.abs(hours);
  }

  function render() {
    var now = new Date();
    clock.textContent = timeFmt.format(now) + ' New York · ' + zonePart(abbrFmt, now) + ' · ' + utcOffset(now);
  }
  function tick() {
    render();
    setTimeout(tick, 60000 - (Date.now() % 60000) + 20); // next whole minute
  }
  tick();
})();

/* about — notes board: random layout, drag (Pointer Events), shuffle */
(function () {
  var board = document.getElementById('notes-board');
  if (!board || typeof notes === 'undefined') return;

  var INSET = 4; // keeps hover-scaled notes (1.03) inside the board
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var layer = document.createElement('div');
  layer.className = 'notes-layer';
  board.insertBefore(layer, board.firstChild);

  // Position is stored as a 0–1 fraction of the free space (board minus note),
  // so a note can never leave the board whatever the window size
  var PLAY = board.dataset.play || 'Play';
  var PAUSE = board.dataset.pause || 'Pause';
  var playing = null; // the one audio note playing right now
  var videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.play().catch(function () {});
      else entry.target.pause();
    });
  }) : null;

  // Order inside a note: title → media → text (each one optional)
  var items = notes.map(function (n) {
    var el = document.createElement('article');
    el.className = 'note';
    var item = { el: el, fx: 0, fy: 0, justDragged: false };
    if (n.title) {
      var t = document.createElement('p');
      t.className = 'note__title';
      t.textContent = n.title;
      el.appendChild(t);
    }
    if (n.media) {
      el.classList.add('has-media');
      el.appendChild(buildMedia(n.media, item));
    }
    if (n.text) {
      var p = document.createElement('p');
      p.className = 'note__text';
      p.textContent = n.text;
      el.appendChild(p);
    }
    layer.appendChild(el);
    return item;
  });
  var topZ = items.length;

  function buildMedia(m, item) {
    if (m.type === 'image') {
      var img = document.createElement('img');
      img.className = 'note__media';
      img.src = m.src;
      img.alt = m.alt || '';
      img.loading = 'lazy';
      img.draggable = false;
      img.addEventListener('load', function () { place(item); }); // height known now
      return img;
    }
    if (m.type === 'video') {
      var v = document.createElement('video');
      v.className = 'note__media';
      v.src = m.src;
      v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.preload = 'metadata';
      if (m.alt) v.setAttribute('aria-label', m.alt);
      v.addEventListener('loadedmetadata', function () { place(item); });
      if (videoObserver) videoObserver.observe(v); // play only while on screen
      return v;
    }
    // audio: a plain text button instead of the browser player
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'note__audio';
    var audio = new Audio();
    audio.preload = 'none';
    audio.src = m.src;
    function label(on) {
      btn.textContent = on ? PAUSE : PLAY;
      btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    label(false);
    audio.addEventListener('play', function () {
      if (playing && playing !== audio) playing.pause(); // one audio at a time
      playing = audio;
      label(true);
    });
    audio.addEventListener('pause', function () { if (playing === audio) playing = null; label(false); });
    audio.addEventListener('ended', function () { audio.currentTime = 0; });
    btn.addEventListener('click', function () {
      if (item.justDragged) return;
      if (audio.paused) audio.play().catch(function () {});
      else audio.pause();
    });
    return btn;
  }

  function range(item) {
    return {
      x: Math.max(0, board.clientWidth - item.el.offsetWidth - INSET * 2),
      y: Math.max(0, board.clientHeight - item.el.offsetHeight - INSET * 2)
    };
  }
  function place(item) {
    var r = range(item);
    item.el.style.setProperty('--x', (INSET + item.fx * r.x) + 'px');
    item.el.style.setProperty('--y', (INSET + item.fy * r.y) + 'px');
  }
  function placeAll() { items.forEach(place); }

  // Jittered grid: one cell per note, cells shuffled, random offset inside each cell
  function shuffle() {
    var n = items.length;
    var cols = Math.max(1, Math.round(Math.sqrt(n * board.clientWidth / board.clientHeight)));
    var rows = Math.ceil(n / cols);
    var cells = [];
    for (var c = 0; c < cols * rows; c++) cells.push(c);
    for (var i = cells.length - 1; i > 0; i--) {
      var k = Math.floor(Math.random() * (i + 1));
      var tmp = cells[i]; cells[i] = cells[k]; cells[k] = tmp;
    }
    items.forEach(function (item, i) {
      var cell = cells[i];
      item.fx = ((cell % cols) + Math.random()) / cols;
      item.fy = (Math.floor(cell / cols) + Math.random()) / rows;
      item.el.classList.toggle('is-yellow', Math.random() < 0.5);
      item.el.style.zIndex = i + 1;
    });
    topZ = items.length;
    placeAll();
  }

  shuffle();
  if (document.fonts) document.fonts.ready.then(placeAll);

  // No native image/video dragging inside the board
  board.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // Drag with Pointer Events (mouse + touch); only notes block touch scrolling.
  // A press only becomes a drag after moving more than DRAG_THRESHOLD px, so
  // buttons inside notes (audio) still receive normal clicks.
  var DRAG_THRESHOLD = 5;
  items.forEach(function (item) {
    var el = item.el;
    var pointerId = null, startX, startY, baseX, baseY, nextX, nextY, r, rafId = null, moved = false;

    function apply() {
      rafId = null;
      el.style.setProperty('--x', nextX + 'px');
      el.style.setProperty('--y', nextY + 'px');
    }

    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      el.style.zIndex = ++topZ;
      pointerId = e.pointerId;
      r = range(item);
      startX = e.clientX; startY = e.clientY;
      baseX = nextX = INSET + item.fx * r.x;
      baseY = nextY = INSET + item.fy * r.y;
      moved = false;
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });

    function move(e) {
      if (e.pointerId !== pointerId) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved) {
        if (Math.sqrt(dx * dx + dy * dy) <= DRAG_THRESHOLD) return;
        moved = true;
        try { el.setPointerCapture(pointerId); } catch (err) {}
        el.classList.add('is-dragging');
        board.classList.add('is-dragging');
      }
      nextX = Math.min(INSET + r.x, Math.max(INSET, baseX + dx));
      nextY = Math.min(INSET + r.y, Math.max(INSET, baseY + dy));
      if (!rafId) rafId = requestAnimationFrame(apply);
    }

    function end(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (!moved) return;
      if (rafId) { cancelAnimationFrame(rafId); apply(); }
      item.fx = r.x ? (nextX - INSET) / r.x : 0;
      item.fy = r.y ? (nextY - INSET) / r.y : 0;
      el.classList.remove('is-dragging');
      board.classList.remove('is-dragging');
      // A drag that ends on the audio button must not also toggle playback
      item.justDragged = true;
      setTimeout(function () { item.justDragged = false; }, 0);
    }
  });

  // Shuffle button: new random layout + colours, 0.5s transition
  var shuffleTimer;
  board.querySelector('.notes-shuffle').addEventListener('click', function () {
    clearTimeout(shuffleTimer);
    if (!reduceMotion) board.classList.add('is-shuffling');
    shuffle();
    shuffleTimer = setTimeout(function () { board.classList.remove('is-shuffling'); }, 500);
  });

  // Keep notes inside the board when the window resizes (no animation while resizing)
  var resizeTimer, resizeRaf = null;
  window.addEventListener('resize', function () {
    board.classList.add('is-resizing');
    if (!resizeRaf) resizeRaf = requestAnimationFrame(function () { resizeRaf = null; placeAll(); });
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { board.classList.remove('is-resizing'); }, 150);
  });
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
        if (video.closest('.note')) return; // notes board videos are always muted
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