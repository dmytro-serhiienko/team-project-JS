import axios from 'axios';
import { openArtistModal } from './artist-details-modal';
import iconsUrl from '../img/icons.svg';

const API_BASE = 'https://sound-wave.b.goit.study/api';

// ===== DOM =====
const artistsList = document.querySelector('.artists__list');
const loadMoreBtn = document.querySelector('.artists__load-more-btn');
const loader = document.querySelector('.loader');
const emptyMsg = document.querySelector('[data-empty]');

const genresBtn = document.querySelector('[data-genres-btn]');
const genresMenu = document.querySelector('[data-genres-menu]');
const sortBtn = document.querySelector('[data-sort-btn]');
const sortMenu = document.querySelector('[data-sort-menu]');
const searchForm = document.querySelector('[data-search-form]');
const searchInput = document.querySelector('[data-search-input]');
const resetBtn = document.querySelector('[data-reset-btn]');

// ===== STATE =====
const state = {
  page: 1,
  limit: 8,
  genre: '',
  sort: '', // 'asc' | 'desc' | ''
  search: '',
  // якщо треба стабільно щоб "працювало навіть коли API не підтримує" —
  // під час фільтрів будемо тягнути більший список і фільтрувати локально
  clientPool: [],
  clientMode: false,
  clientPoolLimit: 120, // не дуже велике, але достатньо, щоб фільтри працювали
};

// ===== UI helpers =====
function toggleLoader(show) {
  if (!loader) return;
  loader.classList.toggle('visually-hidden', !show);
}

function showEmpty(show) {
  if (!emptyMsg) return;
  emptyMsg.classList.toggle('visually-hidden', !show);
}

function closeDropdowns() {
  genresMenu?.classList.remove('is-open');
  sortMenu?.classList.remove('is-open');
}

function toggleDropdown(menu) {
  const open = menu.classList.contains('is-open');
  closeDropdowns();
  if (!open) menu.classList.add('is-open');
}

document.addEventListener('click', e => {
  const inside =
    genresBtn?.contains(e.target) ||
    genresMenu?.contains(e.target) ||
    sortBtn?.contains(e.target) ||
    sortMenu?.contains(e.target);

  if (!inside) closeDropdowns();
});

// ===== Text helpers (твій код) =====
function truncateText(text, maxLength) {
  if (typeof text !== 'string') return '';

  const screenWidth = window.innerWidth;
  if (screenWidth < 768) maxLength = 60;
  else if (screenWidth < 1440) maxLength = 160;
  else maxLength = 144;

  if (text.length > maxLength) return text.slice(0, maxLength) + '...';
  return text;
}

function sanitizeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[,/]/g, ' ');
}

// ===== Markup =====
function generateArtistsMarkup(arr) {
  return (
    arr
      .map(
        ({ _id, genres, strArtist, strArtistThumb, strBiographyEN }) => `
      <li class="artists__card">
        <img class="artists__card-image" src="${strArtistThumb}" alt="${strArtist}"/>

        <ul class="artists__card-genres">
          ${(genres || [])
            .map(
              genre =>
                `<li class="artists__card-genre">${sanitizeText(genre)}</li>`
            )
            .join('')}
        </ul>

        <p class="artists__card-name">${strArtist || ''}</p>
        <p class="artists__card-description">${truncateText(strBiographyEN, 144)}</p>

        <button class="artists__card-btn open-artist-modal" data-artist-id="${_id}">
          Learn More
          <svg class="artists__card-btn-icon" width="24" height="24">
            <use href="${iconsUrl}#icon-caret-right"></use>
          </svg>
        </button>
      </li>
    `
      )
      .join('') || ''
  );
}

// ===== API calls =====
async function fetchArtistsFromApi({ page, limit, genre, sort, search }) {
  const params = { page, limit };

  // пробуємо передати — якщо бек підтримує, буде супер
  if (genre) params.genre = genre;
  if (search) params.search = search;
  if (sort) params.sort = sort; // або asc/desc

  const res = await axios.get(`${API_BASE}/artists`, { params });
  return res.data?.artists || [];
}

async function fetchGenresFromApi() {
  const res = await axios.get(`${API_BASE}/genres`);
  // може бути {genres:[...]} або просто [...]
  const data = res.data;
  const list = Array.isArray(data) ? data : data?.genres || [];
  // приводимо до строк
  return list
    .map(g => (typeof g === 'string' ? g : g?.name || g?.genre || ''))
    .filter(Boolean);
}

// ===== Client-side filters (fallback) =====
function applyClientFilters(list) {
  let out = [...list];

  if (state.genre) {
    out = out.filter(a => (a.genres || []).includes(state.genre));
  }

  if (state.search) {
    const q = state.search.toLowerCase();
    out = out.filter(a => (a.strArtist || '').toLowerCase().includes(q));
  }

  if (state.sort === 'asc') {
    out.sort((a, b) => (a.strArtist || '').localeCompare(b.strArtist || ''));
  }
  if (state.sort === 'desc') {
    out.sort((a, b) => (b.strArtist || '').localeCompare(a.strArtist || ''));
  }

  return out;
}

async function buildClientPool() {
  // тягнемо кілька сторінок, щоб фільтри реально працювали
  const pagesToFetch = Math.ceil(state.clientPoolLimit / state.limit);
  const all = [];

  for (let p = 1; p <= pagesToFetch; p += 1) {
    const chunk = await fetchArtistsFromApi({
      page: p,
      limit: state.limit,
      genre: '', // навмисно без фільтрів — щоб мати базу
      sort: '',
      search: '',
    });
    all.push(...chunk);
  }

  state.clientPool = all;
}

// ===== Render =====
async function renderFirstPage() {
  toggleLoader(true);
  showEmpty(false);

  try {
    state.page = 1;

    // якщо є хоч один фільтр — вмикаємо clientMode (гарантовано “щось” працює)
    state.clientMode = Boolean(state.genre || state.sort || state.search);

    let pageItems = [];

    if (state.clientMode) {
      if (!state.clientPool.length) await buildClientPool();

      const filtered = applyClientFilters(state.clientPool);
      const start = 0;
      const end = state.limit;

      pageItems = filtered.slice(start, end);

      artistsList.innerHTML = generateArtistsMarkup(pageItems);
      showEmpty(filtered.length === 0);

      // load more показуємо тільки якщо є ще
      loadMoreBtn.style.display = filtered.length > end ? 'flex' : 'none';
    } else {
      const items = await fetchArtistsFromApi({
        page: state.page,
        limit: state.limit,
        genre: state.genre,
        sort: state.sort,
        search: state.search,
      });

      artistsList.innerHTML = generateArtistsMarkup(items);
      showEmpty(items.length === 0);

      loadMoreBtn.style.display = items.length ? 'flex' : 'none';
    }
  } catch (e) {
    console.log(e);
    showEmpty(true);
    loadMoreBtn.style.display = 'none';
  } finally {
    toggleLoader(false);
  }
}

async function loadMore() {
  toggleLoader(true);

  try {
    state.page += 1;

    if (state.clientMode) {
      const filtered = applyClientFilters(state.clientPool);
      const start = (state.page - 1) * state.limit;
      const end = state.page * state.limit;

      const next = filtered.slice(start, end);
      if (!next.length) {
        loadMoreBtn.style.display = 'none';
        return;
      }

      artistsList.insertAdjacentHTML('beforeend', generateArtistsMarkup(next));
      loadMoreBtn.style.display = filtered.length > end ? 'flex' : 'none';
    } else {
      const items = await fetchArtistsFromApi({
        page: state.page,
        limit: state.limit,
        genre: state.genre,
        sort: state.sort,
        search: state.search,
      });

      if (!items.length) {
        loadMoreBtn.style.display = 'none';
        return;
      }

      artistsList.insertAdjacentHTML('beforeend', generateArtistsMarkup(items));
      loadMoreBtn.style.display = 'flex';
    }
  } catch (e) {
    console.log(e);
  } finally {
    toggleLoader(false);
  }
}

// ===== Modal click =====
artistsList.addEventListener('click', e => {
  const btn = e.target.closest('.open-artist-modal');
  if (!btn) return;

  const id = btn.dataset.artistId;
  if (id) openArtistModal(id);
});

// ===== Controls events =====
genresBtn?.addEventListener('click', () => toggleDropdown(genresMenu));
sortBtn?.addEventListener('click', () => toggleDropdown(sortMenu));

genresMenu?.addEventListener('click', e => {
  const item = e.target.closest('[data-genre]');
  if (!item) return;

  state.genre = item.dataset.genre || '';
  state.page = 1;

  genresBtn.textContent = state.genre ? state.genre : 'Genres';

  // щоб фільтри працювали стабільно
  state.clientPool = [];
  closeDropdowns();
  renderFirstPage();
});

sortMenu?.addEventListener('click', e => {
  const item = e.target.closest('[data-sort]');
  if (!item) return;

  state.sort = item.dataset.sort || '';
  state.page = 1;

  sortBtn.textContent =
    state.sort === 'asc' ? 'A–Z' : state.sort === 'desc' ? 'Z–A' : 'Sort';

  state.clientPool = [];
  closeDropdowns();
  renderFirstPage();
});

searchForm?.addEventListener('submit', e => {
  e.preventDefault();
  state.search = (searchInput.value || '').trim();
  state.page = 1;

  state.clientPool = [];
  renderFirstPage();
});

resetBtn?.addEventListener('click', () => {
  state.genre = '';
  state.sort = '';
  state.search = '';
  state.page = 1;
  state.clientMode = false;
  state.clientPool = [];

  if (searchInput) searchInput.value = '';
  if (genresBtn) genresBtn.textContent = 'Genres';
  if (sortBtn) sortBtn.textContent = 'Sort';

  closeDropdowns();
  renderFirstPage();
});

loadMoreBtn?.addEventListener('click', loadMore);

// ===== Init genres dropdown =====
async function initGenresDropdown() {
  try {
    const genres = await fetchGenresFromApi();

    // якщо бек нічого не дав — все одно показуємо "All genres"
    const items = [
      `<li class="dropdown__item" data-genre="">All genres</li>`,
      ...genres.map(
        g => `<li class="dropdown__item" data-genre="${g}">${g}</li>`
      ),
    ];

    genresMenu.innerHTML = items.join('');
  } catch (e) {
    console.log(e);
    genresMenu.innerHTML = `<li class="dropdown__item" data-genre="">All genres</li>`;
  }
}

// ===== START =====
initGenresDropdown();
renderFirstPage();
