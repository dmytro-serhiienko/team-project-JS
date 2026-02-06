import { domRefs } from './modalElements.js';
import { formatDuration } from './time-format.js';
import { organizeTracksByAlbum } from './albumGrouping.js';

export function renderArtistAlbums(tracksList, artistName) {
  const albumsContainer = domRefs.albums.container;
  if (!albumsContainer) return;

  const albumsMap = organizeTracksByAlbum(tracksList, artistName); // Обʼєкт: { albumName: [tracks] }
  albumsContainer.innerHTML = '';

  const ul = document.createElement('ul');
  ul.classList.add('modal__albums-list');

  for (const [albumName, tracks] of Object.entries(albumsMap)) {
    const albumItem = document.createElement('li');
    albumItem.className = 'modal__album-item';

    const title = document.createElement('h4');
    title.className = 'modal__album-title';
    title.textContent = albumName;
    albumItem.appendChild(title);

    const wrapper = document.createElement('div');
    wrapper.className = 'modal__tracks-wrapper';

    // Заголовки колонок
    const headerList = document.createElement('ul');
    headerList.className = 'modal__tracks-header';
    headerList.innerHTML = `
      <li class="modal__track-name-col">track</li>
      <li class="modal__track-time-col">time</li>
      <li class="modal__track-link-col">link</li>
    `;
    wrapper.appendChild(headerList);

    // Список треків
    tracks.forEach(track => {
      const trackList = document.createElement('ul');
      trackList.className = 'modal__track-item';

      const name = document.createElement('li');
      name.className = 'modal__track-name';
      name.textContent = track.strTrack || '';

      const time = document.createElement('li');
      time.className = 'modal__track-time';
      time.textContent = track.intDuration
        ? formatDuration(track.intDuration)
        : '';

      const link = document.createElement('li');
      link.className = 'modal__track-link';

      if (track.movie) {
        const a = document.createElement('a');
        a.href = track.movie;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = `
        <svg width="16" height="16">
          <use href="icons.svg#icon-youtube"></use>
        </svg>`;
        link.appendChild(a);
      }

      trackList.append(name, time, link);
      wrapper.appendChild(trackList);
    });

    albumItem.appendChild(wrapper);
    ul.appendChild(albumItem);
  }

  albumsContainer.appendChild(ul);
}

export function renderArtistDetails(data) {
  const { name, thumb, years, gender, members, country, bio } = domRefs.artist;

  name.textContent = data.strArtist ?? 'No name';
  thumb.src =
    data.strArtistThumb || 'https://via.placeholder.com/200x200?text=No+Image';
  thumb.alt = `Artist photo ${data.strArtist ?? ''}`;
  bio.textContent = data.strBiographyEN ?? 'No description';

  years.textContent = data.intFormedYear
    ? `${data.intFormedYear} - ${data.intDiedYear || 'present'}`
    : 'No data';
  gender.textContent = data.strGender || 'No data';
  members.textContent = data.intMembers || 'No data';
  country.textContent = data.strCountry || 'No data';
}

export function renderArtistGenres(container, genres) {
  if (!(container instanceof HTMLElement)) {
    console.error('container not DOM-element:', container);
    return;
  }

  container.innerHTML = '';

  if (genres && genres.length > 0) {
    genres.forEach(genreKey => {
      const genreEl = document.createElement('span');
      genreEl.classList.add('modal__genres-item');
      genreEl.textContent = genreKey;
      container.appendChild(genreEl);
    });
  } else {
    const noGenresEl = document.createElement('span');
    noGenresEl.classList.add('modal__genres-item');
    noGenresEl.textContent = 'Genres not available';
    container.appendChild(noGenresEl);
  }
}
