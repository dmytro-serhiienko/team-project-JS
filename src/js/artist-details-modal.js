/* DMYTRO SERHIIENKO  */
import axios from 'axios';
import { showLoader, hideLoader } from './artists-loader.js';

const API_BASE_URL = 'https://sound-wave.b.goit.study/api';

const refs = {
  backdrop: document.querySelector('[data-artist-modal]'),
  closeBtn: null,
  content: null,
};

let currentEventListeners = [];

document.addEventListener('DOMContentLoaded', () => {
  refs.closeBtn = document.querySelector('[data-artist-modal-close]');
  refs.content = document.querySelector('.artist-modal-content');

  if (refs.closeBtn) {
    refs.closeBtn.addEventListener('click', closeModal);
  }

  if (refs.backdrop) {
    refs.backdrop.addEventListener('click', onBackdropClick);
  }
});

export function openArtistModal(artistId) {
  showLoader();
  refs.backdrop.classList.remove('is-hidden');
  document.body.style.overflow = 'hidden';

  fetchArtistDetails(artistId);
  document.addEventListener('keydown', onEscapeKey);
}

function closeModal() {
  refs.backdrop.classList.add('is-hidden');
  document.body.style.overflow = '';

  removeAllEventListeners();
  document.removeEventListener('keydown', onEscapeKey);

  if (refs.content) {
    refs.content.innerHTML = '';
  }
}

function onBackdropClick(event) {
  if (event.target === refs.backdrop) {
    closeModal();
  }
}

function onEscapeKey(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

function removeAllEventListeners() {
  currentEventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  currentEventListeners = [];
}

function addTrackedEventListener(element, event, handler) {
  element.addEventListener(event, handler);
  currentEventListeners.push({ element, event, handler });
}

async function fetchArtistDetails(artistId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/artists/${artistId}/albums`
    );
    const data = response.data;
    renderArtistDetails(data);
    hideLoader();
  } catch (error) {
    console.error('Error fetching artist details:', error);
    hideLoader();
    showError();
  }
}

function formatYearsActive(lifeSpan) {
  if (!lifeSpan) return 'Information missing';

  const begin = lifeSpan.begin;
  const end = lifeSpan.end;

  if (!begin && !end) {
    return 'Information missing';
  }

  if (begin && !end) {
    const beginYear =
      typeof begin === 'number' ? begin : new Date(begin).getFullYear();
    return `${beginYear}-present`;
  }

  if (begin && end) {
    const beginYear =
      typeof begin === 'number' ? begin : new Date(begin).getFullYear();
    const endYear = typeof end === 'number' ? end : new Date(end).getFullYear();
    return `${beginYear}-${endYear}`;
  }

  return 'Information missing';
}

function formatDuration(duration) {
  if (!duration) return '--';

  if (typeof duration === 'string' && duration.includes(':')) {
    return duration;
  }

  const durationNum =
    typeof duration === 'string' ? parseInt(duration, 10) : duration;

  const totalSeconds =
    durationNum > 10000 ? Math.floor(durationNum / 1000) : durationNum;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getYouTubeUrl(track) {
  if (track.youtubeUrl) {
    return track.youtubeUrl;
  }

  const artistName = track.artistName || '';
  const trackTitle = track.title || track.strTrack || '';

  if (trackTitle) {
    const searchQuery = encodeURIComponent(
      `${artistName} ${trackTitle}`.trim()
    );
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  }

  return null;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderArtistDetails(data) {
  const name = data.strArtist || data.name || 'Unknown Artist';
  const image = data.strArtistThumb || data.image || '';
  const country = data.strCountry || data.country || 'Unknown';
  const biography =
    data.strBiographyEN ||
    data.biography ||
    data.bio ||
    'No biography available.';
  const type = data.strType || data.type || 'Unknown';
  const gender = data.strGender || data.gender;
  const members = data.intMembers || data.members;

  const lifeSpan = {
    begin: data.intBornYear || data.intFormedYear || data.bornYear || null,
    end: data.intDiedYear || data.endYear || null,
  };

  let genres = [];
  if (data.genres && Array.isArray(data.genres)) {
    genres = data.genres;
  } else if (data.strGenre) {
    genres = [data.strGenre];
  }

  const albums = data.albumsList || data.albums || [];
  //   console.log('Processed albums:', albums);

  let membersHtml = '';
  if (members && members !== '0' && members > 0) {
    membersHtml = `<div class="artist-info-item">
         <span class="artist-info-label">Members</span>
         <span class="artist-info-value">${members}</span>
       </div>`;
  }

  let genderHtml = '';
  if (gender) {
    genderHtml = `<div class="artist-info-item">
         <span class="artist-info-label">Sex</span>
         <span class="artist-info-value">${gender}</span>
       </div>`;
  }

  let imageHtml = '';
  if (image) {
    imageHtml = `<img src="${image}" alt="${name}" class="artist-image" />`;
  } else {
    imageHtml = '<div class="artist-image-placeholder">No Image</div>';
  }

  let html = `
    <div class="artist-header">
      <h2 class="artist-name">${name}</h2>
      ${imageHtml}
    </div>
    
    <div class="artist-info">
      <div class="artist-info-item">
        <span class="artist-info-label">Years active</span>
        <span class="artist-info-value">${formatYearsActive(lifeSpan)}</span>
      </div>
      
      ${genderHtml}
      ${membersHtml}
      
      <div class="artist-info-item">
        <span class="artist-info-label">Country</span>
        <span class="artist-info-value">${country}</span>
      </div>
    </div>
  `;

  if (biography) {
    html += `
      <div class="artist-biography">
        <h3 class="artist-section-title__bio">Biography</h3>
        <p class="artist-biography-text">${biography}</p>
      </div>
    `;
  }

  if (genres && genres.length > 0) {
    html += `
      <div class="artist-genres">
        ${genres.map(genre => `<span class="genre-tag__modal">${genre}</span>`).join('')}
      </div>
    `;
  }

  if (albums && albums.length > 0) {
    html += `
      <h3 class="artist-section-title__alb">Albums</h3>
      <div class="artist-albums">
        ${renderAlbums(albums)}
      </div>
    `;
  }

  refs.content.innerHTML = html;
}

function renderAlbums(albums) {
  return albums
    .map(album => {
      const albumTitle = album.title || album.strAlbum || 'Unknown Album';
      const tracks = album.tracks || [];

      let tracksHtml = '';
      if (tracks && tracks.length > 0) {
        tracksHtml = renderTracks(tracks);
      } else {
        tracksHtml = '<p class="no-tracks">No tracks available</p>';
      }

      return `
    <div class="album-item">
      <h4 class="album-title">${albumTitle}</h4>
      ${tracksHtml}
    </div>
  `;
    })
    .join('');
}

function renderTracks(tracks) {
  return `
    <div class="tracks-table">
      <div class="tracks-header">
        <span class="track-header-name">Track</span>
        <span class="track-header-time">Time</span>
        <span class="track-header-action">Link</span>
      </div>
      <div class="tracks-list">
        ${tracks
          .map((track, index) => {
            const trackTitle = track.title || track.strTrack || 'Unknown Track';
            const duration =
              track.length || track.intDuration || track.strDuration;
            const youtubeUrl =
              track.strMusicVid || track.youtubeUrl || getYouTubeUrl(track);

            let youtubeLinkHtml = '';
            if (youtubeUrl) {
              youtubeLinkHtml = `
                <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" class="track-youtube-link">
                  <svg width="20" height="20">
                    <use href="${import.meta.env.BASE_URL}img/icons.svg#icon-youtube"></use>
                  </svg>
                </a>
              `;
            } else {
              youtubeLinkHtml = '<span class="track-no-link"></span>';
            }

            return `
            <div class="track-item" data-track-index="${index}">
              <span class="track-name">${escapeHtml(trackTitle)}</span>
              <span class="track-time">${formatDuration(duration)}</span>
              ${youtubeLinkHtml}
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function showError() {
  refs.content.innerHTML = `
    <div class="artist-error">
      <p>Failed to load artist details. Please try again later.</p>
    </div>
  `;
}

/* DMYTRO SERHIIENKO  */
