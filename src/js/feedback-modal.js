// ================================================
// 1. HELPERS
// ================================================

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

function lockScroll() {
  document.body.classList.add('body-no-scroll');
}

function unlockScroll() {
  document.body.classList.remove('body-no-scroll');
}

function showError(target, message) {
  target.classList.add('feedback-error');

  let error = target.parentElement.querySelector('.feedback-error-text');
  if (!error) {
    error = document.createElement('div');
    error.className = 'feedback-error-text';
    target.parentElement.appendChild(error);
  }

  error.textContent = message;
}

function clearError(target) {
  target.classList.remove('feedback-error');
  const error = target.parentElement.querySelector('.feedback-error-text');
  if (error) error.remove();
}

function clearAllErrors() {
  document.querySelectorAll('.feedback-error').forEach(el => {
    clearError(el);
  });

  const serverError = document.querySelector('.server-error-message');
  if (serverError) serverError.remove();
}

// ================================================
// 2. MODAL
// ================================================

const backdrop = document.querySelector('.js-feedback-backdrop');

function openModal() {
  backdrop.removeAttribute('hidden');
  lockScroll();
  clearAllErrors();
}

function closeModal() {
  backdrop.setAttribute('hidden', '');
  unlockScroll();
}

function initModal() {
  const closeBtn = document.querySelector('.js-feedback-close');
  if (!backdrop || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !backdrop.hasAttribute('hidden')) {
      closeModal();
    }
  });
}

// ================================================
// 3. OPEN BY "Leave feedback" BUTTON
// ================================================

function initOpenButton() {
  const openBtn = document.querySelector('.feedback-btn');
  if (!openBtn) return;

  openBtn.addEventListener('click', e => {
    e.preventDefault(); // ❗ важно
    openModal();
  });
}

// ================================================
// 4. RATING (A → stars)
// ================================================

function initRating() {
  const rating = document.querySelector('.rating');
  if (!rating) return;

  const stars = rating.querySelectorAll('.rating-star');
  const input = document.getElementById('rating-input');

  stars.forEach(star => {
    star.addEventListener('click', e => {
      e.preventDefault(); // ❗ НЕ прыгаем вверх

      const value = Number(star.dataset.value);
      input.value = value;

      stars.forEach(s => {
        s.classList.toggle('active', Number(s.dataset.value) <= value);
      });

      clearError(rating);
    });
  });
}

// ================================================
// 5. FORM
// ================================================

function initForm() {
  const form = document.querySelector('.js-feedback-form');
  if (!form) return;

  const nameInput = form.querySelector('[name="name"]');
  const messageInput = form.querySelector('[name="message"]');
  const ratingInput = document.getElementById('rating-input');
  const ratingBlock = form.querySelector('.rating');

  const submitBtn = form.querySelector('.feedback-submit-btn');
  const submitText = form.querySelector('.js-submit-text');
  const submitLoader = form.querySelector('.js-submit-loader');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearAllErrors();

    const name = nameInput.value.trim();
    const descr = messageInput.value.trim();
    const rating = Number(ratingInput.value);

    let valid = true;

    if (!name) {
      iziToast.error({
        title: 'Помилка',
        message: 'Імʼя обовʼязкове',
        position: 'topRight',
        timeout: 3000,
      });
      valid = false;
    }

    if (!descr || descr.length < 10) {
      iziToast.error({
        title: 'Помилка',
        message: 'Мінімум 10 символів',
        position: 'topRight',
        timeout: 3000,
      });
      valid = false;
    }

    if (rating < 1 || rating > 5) {
      iziToast.error({
        title: 'Помилка',
        message: 'Оберіть рейтинг',
        position: 'topRight',
        timeout: 3000,
      });
      valid = false;
    }

    if (!valid) return;

    submitBtn.disabled = true;
    submitText.hidden = true;
    submitLoader.hidden = false;

    try {
      const res = await fetch('https://sound-wave.b.goit.study/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, rating, descr }),
      });

      if (!res.ok) throw new Error('Server error');

      form.reset();
      ratingInput.value = '0';
      document
        .querySelectorAll('.rating-star')
        .forEach(s => s.classList.remove('active'));

      closeModal();

      iziToast.success({
        title: 'Успіх',
        message: 'Дякуємо за відгук!',
        position: 'topRight',
        timeout: 3000,
        backgroundColor: '#4caf50',
        messageColor: '#fff',
        titleColor: '#fff',
        progressBarColor: '#2e7d32',
      });
    } catch {
      iziToast.error({
        title: 'Помилка',
        message: 'Помилка відправки. Спробуйте ще раз',
        position: 'topRight',
        timeout: 5000,
      });
    } finally {
      submitBtn.disabled = false;
      submitText.hidden = false;
      submitLoader.hidden = true;
    }
  });
}

// ================================================
// 6. INIT
// ================================================

document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initOpenButton(); // ← ВАЖНО
  initRating();
  initForm();
});
