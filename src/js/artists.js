import axios from 'axios';
import { openArtistModal } from './artist-details-modal';

// іконки
import iconsUrl from '../img/icons.svg';

async function fetchArtists(page = 1) {
  try {
    const response = await axios.get(
      `https://sound-wave.b.goit.study/api/artists?limit=8&page=${page}`
    );
    return response.data.artists;
  } catch (error) {
    console.log(error.message);
  }
}

const artistsList = document.querySelector('.artists__list');

let currentPage = 0;

renderArtists();

async function renderArtists() {
  const artists = await fetchArtists();
  const markup = generateArtistsMarkup(artists);
  artistsList.innerHTML = markup;
  currentPage = 1;
}

// Кнопка loadMore
const loadMoreBtn = document.querySelector('.artists__load-more-btn');
loadMoreBtn.addEventListener('click', loadMoreArtists);
async function loadMoreArtists() {
  try {
    toggleLoader(true);
    loadMoreBtn.style.display = 'none';
    currentPage += 1;
    const artists = await fetchArtists(currentPage);
    if (artists.length === 0) {
      loadMoreBtn.style.display = 'none';
    }

    const markup = generateArtistsMarkup(artists);
    const beforeCount = artistsList.children.length;
    artistsList.insertAdjacentHTML('beforeend', markup);
  } catch (error) {
    console.log(error);
  } finally {
    toggleLoader(false);
    loadMoreBtn.style.display = 'flex';
  }
}

function truncateText(text, maxLength) {
  // якщо text undefined, розвертаємо...
  if (typeof text !== 'string') {
    return '';
  }
  // різна довжина
  const screenWidth = window.innerWidth;
  if (screenWidth < 768) {
    maxLength = 60;
  } else if (screenWidth < 1440) {
    maxLength = 160;
  } else {
    maxLength = 144;
  }

  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
}
function sanitizeText(text) {
  return text.replace(/[,/]/g, ' ');
}

// розмітка
function generateArtistsMarkup(arr) {
  return (
    arr
      .map(
        ({ _id, genres, strArtist, strArtistThumb, strBiographyEN }) =>
          `
      <li class="artists__card">

        <img class="artists__card-image" src="${strArtistThumb}" alt="${strArtist}"/>

        <ul class="artists__card-genres">
        ${genres
          .map(
            genre =>
              `<li class="artists__card-genre">${sanitizeText(genre)}</li>`
          )
          .join('')}
        </ul>
        <p class="artists__card-name">${strArtist}</p>
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

// відкриття модалки
artistsList.addEventListener('click', handleArtistCardClick);
function handleArtistCardClick(event) {
  const targetButton = event.target.closest('.open-artist-modal');

  if (targetButton) {
    // Ай-ді артиста
    const artistId = targetButton.dataset.artistId;
    if (artistId) {
      openArtistModal(artistId);
    } else {
      console.error('Artist ID not found 😱.');
    }
  }
}

// LOADER ВКЛЮЧИТИ/ВИКЛЮЧИТИ
const loader = document.querySelector('.loader');
function toggleLoader(show) {
  if (show) {
    loader.style.display = 'inline-block';
  } else {
    loader.style.display = 'none';
  }
}
