function initRating() {
  const rating = document.querySelector('.rating');
  if (!rating) return;

  const stars = rating.querySelectorAll('.rating-star');
  const input = document.querySelector('#rating-input');

  if (!stars.length || !input) return;

  if (rating.dataset.initialized === 'true') return;
  rating.dataset.initialized = 'true';

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = Number(star.dataset.value);

      input.value = value;

      stars.forEach(s => {
        const v = Number(s.dataset.value);
        s.classList.toggle('active', v <= value);
      });
    });
  });
}

function showError(input, message) {
  input.classList.add('feedback-error');

  let errorEl = input.parentElement.querySelector('.feedback-error-text');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'feedback-error-text';
    input.parentElement.appendChild(errorEl);
  }

  errorEl.textContent = message;
}

function clearError(input) {
  input.classList.remove('feedback-error');

  const errorEl = input.parentElement.querySelector('.feedback-error-text');
  if (errorEl) errorEl.remove();
}
// -------------------------------------------------------------------------------------

function initFeedbackForm() {
  const form = document.querySelector('.js-feedback-form');
  if (!form) return;

  const nameInput = form.querySelector('input[name="name"]');
  const messageInput = form.querySelector('textarea[name="message"]');
  const ratingInput = form.querySelector('#rating-input');
  const ratingBlock = form.querySelector('.rating');

  const submitText = form.querySelector('.js-submit-text');
  const submitLoader = form.querySelector('.js-submit-loader');

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const descr = messageInput.value.trim();
    const rating = Number(ratingInput.value);

    clearError(nameInput);
    clearError(messageInput);
    clearError(ratingBlock);

    let hasError = false;

    if (name.length < 2 || name.length > 16) {
      showError(nameInput, 'Name must be 2–16 characters');
      hasError = true;
    }

    if (descr.length < 10 || descr.length > 512) {
      showError(messageInput, 'Message must be 10–512 characters');
      hasError = true;
    }

    if (rating < 1 || rating > 5) {
      showError(ratingBlock, 'Please select a rating');
      hasError = true;
    }

    if (hasError) return;

    const payload = { name, rating, descr };

    submitText.hidden = true;
    submitLoader.hidden = false;

    try {
      const response = await fetch(
        'https://sound-wave.b.goit.study/api/feedbacks',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) return;

      const data = await response.json();

      form.reset();
      ratingInput.value = 0;
      document
        .querySelectorAll('.rating-star')
        .forEach(star => star.classList.remove('active'));

      if (window.feedbackModal?.close) {
        window.feedbackModal.close();
      }
    } catch (error) {
      console.log('❌ Network error:', error);
    } finally {
      submitText.hidden = false;
      submitLoader.hidden = true;
    }
  });
}

function lockScroll() {
  document.body.classList.add('body-no-scroll');
}

function unlockScroll() {
  document.body.classList.remove('body-no-scroll');
}

function initFeedbackModal() {
  const backdrop = document.querySelector('.js-feedback-backdrop');
  const modal = document.querySelector('.feedback-modal');
  const closeBtn = document.querySelector('.js-feedback-close');

  if (!backdrop || !modal || !closeBtn) return;

  function openModal() {
    backdrop.hidden = false;
    lockScroll();
  }

  function closeModal() {
    backdrop.hidden = true;
    unlockScroll();
  }

  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  window.feedbackModal = {
    open: openModal,
    close: closeModal,
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initFeedbackModal();
  initRating();
  initFeedbackForm();
});
