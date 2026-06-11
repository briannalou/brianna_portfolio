(function () {


  const musicPool = [
    { title: 'Wild Card',        artist: 'Ghost',          link: 'https://open.spotify.com/track/0sWb7IYPU3T33YhRC93XSc?si=98abcf59d81c4bfe', src: '/media/wildcard.jpg' },
    { title: 'Step Outside',     artist: 'José González',  link: 'https://open.spotify.com/track/0P0vjAUzsleEw8X4aZcOrg?si=4f7dbefe0c6547d2', src: '/media/stepoutside.jpg' },
    { title: 'Never Enough',     artist: 'Loren Allred',   link: 'https://open.spotify.com/track/0Gl5s8IhMmQE5YQwM8Qx1J?si=d32ec64b9bef4bfe', src: '/media/neverenough.jpg' },
    { title: 'I Confess',     artist: 'FTISLAND',   link: 'https://open.spotify.com/track/2SEUyfGwcVgTQaU2ctBYfP?si=95dd76f97cb44232', src: '/media/iconfess.jpg' },
    { title: 'Living in the Moment',     artist: 'Jason Mraz',   link: 'https://open.spotify.com/track/3ce7k1L4EkZppZPz1EJWTS?si=d05d175da4534918', src: '/media/living.jpg' },
  ];

  const imagePool = [
    { src: '/media/bird.jpg' },
    { src: '/media/desktop.jpg' },
    { src: '/media/fabric.jpg' },
    { src: '/media/etch.jpg' },
    { src: '/media/shot.jpg' },
    { src: '/media/food.jpg' },
  ];

  const textPool = [
    { label: 'blender modeling' },
    { label: 'material recycling' },
    { label: 'game design' },
    { label: 'interactive installations' },
    { label: 'bird shooting' },
    { label: 'singing' },
    { label: 'brainstorming' },
    { label: 'cooking' },
  ];

  // ──────────────────────────────────────────────────────────

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(pool, n) {
    return shuffle(pool).slice(0, n);
  }

  //─────────────────────────────

  const music  = pick(musicPool, 3).map((item, i) => ({ type: 'music', ...item, mod: ['a','b','c'][i] }));
  const images = pick(imagePool, 2).map((item, i) => ({ type: 'image', ...item, mod: ['a','b'][i] }));
  const texts  = pick(textPool,  4).map((item, i) => ({ type: 'text',  ...item, mod: ['1','2','3','4'][i] }));

  const interests = [
    music[0], images[0], texts[0],
    music[1], texts[1],  images[1],
    texts[2], music[2],  texts[3],
  ];

  //──────────────────────────────────────────────────────────────

  function buildMusic(item) {
    const unit = document.createElement('div');
    unit.className = `vinyl-unit vinyl-unit--${item.mod}`;

    const disc = document.createElement('div');
    disc.className = 'vinyl';

    if (item.src) {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      disc.appendChild(img);
    }

    const hole = document.createElement('span');
    hole.className = 'vinyl__hole';
    disc.appendChild(hole);

    if (item.link) {
      disc.addEventListener('click', () => window.open(item.link, '_blank', 'noopener noreferrer'));
    }

    const meta = document.createElement('div');
    meta.className = 'vinyl__meta';

    const trackEl = document.createElement('span');
    trackEl.className = 'vinyl__track';
    trackEl.textContent = item.title;

    const artistEl = document.createElement('span');
    artistEl.className = 'vinyl__artist';
    artistEl.textContent = item.artist;

    meta.append(trackEl, artistEl);
    unit.append(disc, meta);
    return unit;
  }

  function buildImage(item) {
    const blob = document.createElement('div');
    blob.className = `img-blob img-blob--${item.mod}`;

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = '';
    blob.appendChild(img);

    return blob;
  }

  function buildText(item) {
    const tag = document.createElement('span');
    tag.className = `interest-tag interest-tag--${item.mod}`;
    tag.textContent = item.label;
    return tag;
  }

  //────────────────────────────────────────────────────────────────

  const builders = {
    music: buildMusic,
    image: buildImage,
    text:  buildText
  };

  document.addEventListener('DOMContentLoaded', function () {
    const field = document.querySelector('.interests__field');
    if (!field) return;
    for (const item of interests) {
      const el = builders[item.type]?.(item);
      if (el) field.appendChild(el);
    }
  });

})();
