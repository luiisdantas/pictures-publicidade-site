/**
 * Pictures Publicidade - Main JavaScript
 * Handles: Navigation, Scroll Reveal, Lightbox, Carousel, Video Playback
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initLightbox();
  initSmoothScroll();
  initCarousels();
  initVideoPlayback();
});

/* ================================================================
   NAVIGATION
   ================================================================ */
function initNavigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    // Close on link click
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && links.classList.contains('active')) {
        toggle.classList.remove('active');
        links.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

/* ================================================================
   SCROLL REVEAL
   ================================================================ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = document.getElementById('nav').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    });
  });
}

/* ================================================================
   CAROUSEL
   ================================================================ */
function initCarousels() {
  const carousels = document.querySelectorAll('.carousel');

  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');

    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 300;

    function updateArrows() {
      const { scrollLeft, scrollWidth, clientWidth } = track;
      prevBtn.classList.toggle('hidden', scrollLeft <= 5);
      nextBtn.classList.toggle('hidden', scrollLeft + clientWidth >= scrollWidth - 5);
    }

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateArrows, { passive: true });

    // Initial state
    updateArrows();

    // Update on resize
    window.addEventListener('resize', updateArrows, { passive: true });
  });
}

/* ================================================================
   VIDEO PLAYBACK (play on hover / click)
   ================================================================ */
function initVideoPlayback() {
  const videos = document.querySelectorAll('.carousel-item video, .stacked-video-item video, .image-grid-scroll video');

  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'metadata';

    // Play on hover (desktop)
    video.closest('.carousel-item, .stacked-video-item')?.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    video.closest('.carousel-item, .stacked-video-item')?.addEventListener('mouseleave', () => {
      video.pause();
    });

    // Play on click (mobile) - toggle
    video.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  });

  // Also handle IntersectionObserver for stacked videos to auto-play when in view
  const stackedVideos = document.querySelectorAll('.stacked-video-item video');
  if (stackedVideos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.5 });

    stackedVideos.forEach(vid => videoObserver.observe(vid));
  }
}

/* ================================================================
   LIGHTBOX (for portfolio pages)
   ================================================================ */
function initLightbox() {
  const galleryItems = document.querySelectorAll('[data-lightbox]');

  if (!galleryItems.length) return;

  // Create lightbox element
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.id = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Fechar">&times;</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Anterior">&#8249;</button>
    <button class="lightbox-nav lightbox-next" aria-label="Proximo">&#8250;</button>
    <img src="" alt="" id="lightboxImg">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let currentIndex = 0;
  const images = Array.from(galleryItems);

  function openLightbox(index) {
    currentIndex = index;
    const item = images[currentIndex];
    const img = item.querySelector('img') || item;
    const src = img.dataset?.full || img.src;

    if (!src) return;

    lightboxImg.src = src;
    lightboxImg.alt = img.alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(direction) {
    currentIndex = (currentIndex + direction + images.length) % images.length;
    const item = images[currentIndex];
    const img = item.querySelector('img') || item;
    const src = img.dataset?.full || img.src;

    if (src) {
      lightboxImg.style.opacity = '0';
      setTimeout(() => {
        lightboxImg.src = src;
        lightboxImg.alt = img.alt || '';
        lightboxImg.style.opacity = '1';
      }, 150);
    }
  }

  // Event listeners
  images.forEach((item, index) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': navigate(-1); break;
      case 'ArrowRight': navigate(1); break;
    }
  });
}
