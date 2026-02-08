import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const URL = 'https://sound-wave.b.goit.study/api/feedbacks?limit=10&page=1';
const feedbackContainer = document.getElementById('feedback-container');

async function loadFeedbacks() {
  try {
    const response = await fetch(
      'https://sound-wave.b.goit.study/api/feedbacks?limit=10&page=1'
    );
    const result = await response.json();
    if (!result.data) {
      console.error('Поле "data" відсутнє в отриманні!');
      return;
    }
    const feedbacksArray = result.data;
    renderFeedbacks(feedbacksArray);
    initSwiper();
  } catch (error) {
    console.error('4. Помилка до виклику рендеру:', error.message);
  }
}

function renderFeedbacks(feedbacks) {
  //console.log("renderFeedbacks");
  const markup = feedbacks
    .map(({ rating, descr, name }) => {
      const roundedRating = Math.round(rating);
      const stars = Array.from(
        { length: 5 },
        (_, i) =>
          `<span class="star ${i < roundedRating ? 'filled' : 'star-empty'}">★</span>`
      ).join('');

      return `
      <div class="swiper-slide">
        <div class="stars-container">${stars}</div>
        <p class="feedback-text">"${descr}"</p>
        <p class="feedback-user-name">${name}</p>
      </div>
    `;
    })
    .join('');

  feedbackContainer.innerHTML = markup;
}

function initSwiper() {
  const isDesktop = window.matchMedia('(min-width: 1440px)').matches;

  const swiperConfig = {
    modules: [Navigation, Pagination],
    slidesPerView: 1,
    spaceBetween: 0,
    grabCursor: false, // для свайпу
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      renderBullet: function (index, className) {
        // index === 0 (перший), 1 (середній), 2 (останній)
        if (index < 3) {
          return `<span class="${className} custom-bullet-${index}"></span>`;
        }
        return '';
      },
    },
    on: {
      slideChange: function () {
        const activeIndex = this.realIndex;
        const bullets = document.querySelectorAll('.swiper-pagination-bullet');

        bullets.forEach(b =>
          b.classList.remove('swiper-pagination-bullet-active')
        );

        if (activeIndex === 0) {
          bullets[0]?.classList.add('swiper-pagination-bullet-active');
        } else if (activeIndex === 9) {
          bullets[2]?.classList.add('swiper-pagination-bullet-active');
        } else {
          bullets[1]?.classList.add('swiper-pagination-bullet-active');
        }
      },
    },
  };

  // Додаємо navigation тільки на десктопі
  if (isDesktop) {
    swiperConfig.navigation = {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    };
  }

  new Swiper('.feedback-slider', swiperConfig);
}

loadFeedbacks();
