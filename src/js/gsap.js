// GSAP Hero Animation
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Перевірка чи це десктоп (768px і більше)
const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

// Ініціалізувати анімації тільки для десктопу
if (isDesktop()) {
  gsap.set('.hero-title', {
    opacity: 0,
    y: -50,
    scale: 0.9,
  });

  gsap.set('.hero-subtitle', {
    opacity: 0,
    y: 30,
  });

  gsap.set('.hero-btn', {
    opacity: 0,
    scale: 0.8,
    y: 20,
  });

  gsap.set('.hero-img', {
    opacity: 0,
    x: 50,
    scale: 0.95,
  });

  const heroTimeline = gsap.timeline({
    defaults: {
      ease: 'power3.out',
    },
  });

  heroTimeline
    .to('.hero-title', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.2,
      ease: 'elastic.out(1, 0.6)',
    })
    .to(
      '.hero-subtitle',
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.6'
    )
    .to(
      '.hero-btn',
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      },
      '-=0.4'
    )
    .to(
      '.hero-img',
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 1,
        ease: 'power3.out',
      },
      '-=0.8'
    );

  const exploreBtn = document.querySelector('.hero-btn');

  if (exploreBtn) {
    exploreBtn.addEventListener('mouseenter', () => {
      gsap.to('.hero-btn', {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to('.hero-btn-icon', {
        x: 5,
        duration: 0.3,
        ease: 'power2.out',
      });
    });

    exploreBtn.addEventListener('mouseleave', () => {
      gsap.to('.hero-btn', {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      });

      gsap.to('.hero-btn-icon', {
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
  }

  // ARTISTS SECTION
  const artistsTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.artists',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  artistsTimeline
    .from('.artists__title', {
      opacity: 0,
      y: -30,
      duration: 0.8,
      ease: 'power3.out',
    })
    .from(
      '.artists__subtitle',
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      },
      '-=0.5'
    );

  ScrollTrigger.create({
    trigger: '.artists__list',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const artistCards = document.querySelectorAll('.artists__list li');
      if (artistCards.length > 0) {
        gsap.from(artistCards, {
          opacity: 0,
          y: 50,
          scale: 0.9,
          stagger: 0.1,
          duration: 0.6,
          ease: 'back.out(1.2)',
        });
      }
    },
  });

  gsap.from('.artists__load-more-btn', {
    scrollTrigger: {
      trigger: '.artists__load-more-btn',
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power3.out',
  });

  // ABOUT US SECTION - Анімація при скролі
  ScrollTrigger.create({
    trigger: '.about-us',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      const aboutTimeline = gsap.timeline();

      aboutTimeline
        .from('.about-us-image', {
          opacity: 0,
          x: -50,
          scale: 0.95,
          duration: 1,
          ease: 'power3.out',
        })
        .from(
          '.about-us-logo-icon',
          {
            opacity: 0,
            scale: 0,
            rotation: -180,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          '-=0.5'
        )
        .from(
          '.about-us-title',
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.5'
        )
        .from(
          '.about-us-text',
          {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.6'
        );
    },
  });

  // FEEDBACK SECTION - Анімація при скролі (вимкнено)
  // ScrollTrigger.create({
  //   trigger: '.feedback',
  //   start: 'top bottom',
  //   once: true,
  //   onEnter: () => {
  //     const feedbackTimeline = gsap.timeline();

  //     feedbackTimeline.from('.feedback-slider', {
  //       opacity: 0,
  //       y: 50,
  //       scale: 0.95,
  //       duration: 1,
  //       ease: 'power3.out',
  //     });

  //     // Анімація стрілок тільки на десктопі (1440px+)
  //     if (window.matchMedia('(min-width: 1440px)').matches) {
  //       feedbackTimeline
  //         .from(
  //           '.swiper-button-prev',
  //           {
  //             opacity: 0,
  //             x: -20,
  //             duration: 0.6,
  //             ease: 'power3.out',
  //           },
  //           '-=0.5'
  //         )
  //         .from(
  //           '.swiper-button-next',
  //           {
  //             opacity: 0,
  //             x: 20,
  //             duration: 0.6,
  //             ease: 'power3.out',
  //           },
  //           '-=0.6'
  //         );
  //     }

  //     feedbackTimeline.from(
  //       '.feedback-btn',
  //       {
  //         opacity: 0,
  //         y: 20,
  //         scale: 0.9,
  //         duration: 0.6,
  //         ease: 'back.out(1.7)',
  //       },
  //       '-=0.4'
  //     );
  //   },
  // });

  // ScrollTrigger.create({
  //   trigger: '.feedback',
  //   start: 'top 75%',
  //   once: true,
  //   onEnter: () => {
  //     const slides = document.querySelectorAll(
  //       '#feedback-container .swiper-slide'
  //     );
  //     if (slides.length > 0) {
  //       gsap.from(slides, {
  //         opacity: 0,
  //         scale: 0.9,
  //         stagger: 0.1,
  //         duration: 0.6,
  //         delay: 0.5,
  //         ease: 'power3.out',
  //       });
  //     }
  //   },
  // });
}

export function animateNewArtistCards(cards) {
  if (isDesktop() && cards && cards.length > 0) {
    gsap.from(cards, {
      opacity: 0,
      y: 50,
      scale: 0.9,
      stagger: 0.1,
      duration: 0.6,
      ease: 'back.out(1.2)',
    });
  }
}
