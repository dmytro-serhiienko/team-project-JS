const ratingContainer = document.querySelector('.js-rating');
const stars = ratingContainer.querySelectorAll('.star');

stars.forEach(star => {
  star.addEventListener('click', () => {
    const value = Number(star.dataset.value);
    setRating(value);
  });
});

function setRating(value) {
  ratingContainer.dataset.rating = value;

  stars.forEach(star => {
    const starValue = Number(star.dataset.value);

    if (starValue <= value) {
      star.classList.add('active');
      star
        .querySelector('use')
        .setAttribute('href', '../img/icons.svg#icon-star-filled');
    } else {
      star.classList.remove('active');
      star
        .querySelector('use')
        .setAttribute('href', '../img/icons.svg#icon-star-outline');
    }
  });
}
