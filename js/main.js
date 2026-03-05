/**
 * Pictures Publicidade - Main JavaScript
 * Handles: Navigation, Scroll Reveal, Media Lightbox, Carousel, Video Playback
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initSmoothScroll();
  initImageRowArrows();
  initCarousels();
  initVideoPlayback();
  initMediaLightbox();
});

/* ================================================================
   NAVIGATION
   ================================================================ */
function initNavigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('active');
      document.body.style.overflow = links.classList.contains('active') ? 'hidden' : '';
    });

    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

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
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => observer.observe(el));
}

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
function initSmoothScroll() {
  const nav = document.getElementById('nav');
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      requestAnimationFrame(() => {
        const navHeight = nav.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      });
    });
  });
}

/* ================================================================
   IMAGE ROW ARROWS (Feed + Stories navigation)
   ================================================================ */
function initImageRowArrows() {
  document.querySelectorAll('.image-row').forEach(row => {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'image-row-wrapper';

    // Transfer margin-bottom from row to wrapper
    const mb = row.style.marginBottom;
    if (mb) {
      wrapper.style.marginBottom = mb;
      row.style.marginBottom = '0';
    }

    // Insert wrapper before the row, then move row inside
    row.parentNode.insertBefore(wrapper, row);
    wrapper.appendChild(row);

    // Create arrows
    const prevBtn = document.createElement('button');
    prevBtn.className = 'image-row-arrow arrow-prev';
    prevBtn.setAttribute('aria-label', 'Anterior');
    prevBtn.innerHTML = '&#8249;';

    const nextBtn = document.createElement('button');
    nextBtn.className = 'image-row-arrow arrow-next';
    nextBtn.setAttribute('aria-label', 'Próximo');
    nextBtn.innerHTML = '&#8250;';

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    const scrollAmount = 300;

    let arrowRaf;
    function updateArrows() {
      if (arrowRaf) return;
      arrowRaf = requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = row;
        prevBtn.classList.toggle('hidden', scrollLeft <= 5);
        nextBtn.classList.toggle('hidden', scrollLeft + clientWidth >= scrollWidth - 5);
        arrowRaf = null;
      });
    }

    prevBtn.addEventListener('click', () => {
      row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    row.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    window.addEventListener('resize', updateArrows, { passive: true });
  });
}

/* ================================================================
   CAROUSEL
   ================================================================ */
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');

    if (!track || !prevBtn || !nextBtn) return;

    const scrollAmount = 300;

    let carouselRaf;
    function updateArrows() {
      if (carouselRaf) return;
      carouselRaf = requestAnimationFrame(() => {
        const { scrollLeft, scrollWidth, clientWidth } = track;
        prevBtn.classList.toggle('hidden', scrollLeft <= 5);
        nextBtn.classList.toggle('hidden', scrollLeft + clientWidth >= scrollWidth - 5);
        carouselRaf = null;
      });
    }

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    window.addEventListener('resize', updateArrows, { passive: true });
  });
}

/* ================================================================
   VIDEO PLAYBACK (play on hover / click for carousel items)
   ================================================================ */
function initVideoPlayback() {
  const videos = document.querySelectorAll('.carousel-item video, .stacked-video-item video');

  videos.forEach(video => {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.preload = 'metadata';

    const container = video.closest('.carousel-item, .stacked-video-item');
    if (!container) return;

    // Play on hover (desktop) - only preview, lightbox handles full playback
    container.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });

    container.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // Auto-play stacked videos when in view
  const stackedVideos = document.querySelectorAll('.stacked-video-item video');
  if (stackedVideos.length) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.5 });

    stackedVideos.forEach(vid => videoObserver.observe(vid));
  }
}

/* ================================================================
   MEDIA LIGHTBOX (unified: images + videos)
   Opens images in lightbox, videos in fullscreen modal with controls.
   Works on: carousel items, grid images, stacked videos.
   ================================================================ */
function initMediaLightbox() {
  // Create lightbox overlay
  const lightbox = document.createElement('div');
  lightbox.className = 'media-lightbox';
  lightbox.id = 'mediaLightbox';
  lightbox.innerHTML = `
    <button class="mlb-close" aria-label="Fechar">&times;</button>
    <button class="mlb-nav mlb-prev" aria-label="Anterior">&#8249;</button>
    <button class="mlb-nav mlb-next" aria-label="Próximo">&#8250;</button>
    <div class="mlb-content">
      <img class="mlb-img" src="" alt="" style="display:none">
      <video class="mlb-video" controls playsinline style="display:none"></video>
    </div>
    <div class="mlb-counter"></div>
  `;
  document.body.appendChild(lightbox);

  const mlbImg = lightbox.querySelector('.mlb-img');
  const mlbVideo = lightbox.querySelector('.mlb-video');
  const mlbClose = lightbox.querySelector('.mlb-close');
  const mlbPrev = lightbox.querySelector('.mlb-prev');
  const mlbNext = lightbox.querySelector('.mlb-next');
  const mlbCounter = lightbox.querySelector('.mlb-counter');

  let mediaItems = [];
  let currentIndex = 0;

  // Collect all clickable media grouped by section
  function collectMediaInContext(clickedEl) {
    // Find the closest section/container that groups media together
    const section = clickedEl.closest('.portfolio-client, .media-section, .gallery-section, .video-section, .carousel, .stacked-videos, .image-grid-scroll, .image-row');

    if (!section) return [clickedEl];

    const items = [];

    // Collect images
    section.querySelectorAll('.carousel-item img, .grid-img img, .gallery-item img, .image-row img, [data-lightbox] img').forEach(img => {
      items.push({ type: 'image', src: img.src, alt: img.alt || '', element: img.closest('.carousel-item, .grid-img, .gallery-item, [data-lightbox], .image-row > *') || img });
    });

    // Collect videos
    section.querySelectorAll('.carousel-item video, .stacked-video-item video').forEach(vid => {
      const src = vid.src || vid.querySelector('source')?.src;
      if (src) {
        items.push({ type: 'video', src: src, element: vid.closest('.carousel-item, .stacked-video-item') || vid });
      }
    });

    return items;
  }

  function openLightbox(items, index) {
    mediaItems = items;
    currentIndex = index;
    showCurrentItem();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show/hide nav if only 1 item
    const hasNav = mediaItems.length > 1;
    mlbPrev.style.display = hasNav ? '' : 'none';
    mlbNext.style.display = hasNav ? '' : 'none';
    mlbCounter.style.display = hasNav ? '' : 'none';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    mlbVideo.pause();
    mlbVideo.removeAttribute('src');
    mlbVideo.style.display = 'none';
    mlbImg.style.display = 'none';
  }

  function showCurrentItem() {
    const item = mediaItems[currentIndex];
    if (!item) return;

    if (item.type === 'image') {
      mlbVideo.pause();
      mlbVideo.style.display = 'none';
      mlbImg.src = item.src;
      mlbImg.alt = item.alt;
      mlbImg.style.display = '';
    } else {
      mlbImg.style.display = 'none';
      mlbVideo.src = item.src;
      mlbVideo.style.display = '';
      mlbVideo.play().catch(() => {});
    }

    mlbCounter.textContent = `${currentIndex + 1} / ${mediaItems.length}`;
  }

  function navigate(dir) {
    mlbVideo.pause();
    currentIndex = (currentIndex + dir + mediaItems.length) % mediaItems.length;
    showCurrentItem();
  }

  // Event listeners
  mlbClose.addEventListener('click', closeLightbox);
  mlbPrev.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  mlbNext.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('mlb-content')) closeLightbox();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': navigate(-1); break;
      case 'ArrowRight': navigate(1); break;
    }
  });

  // Swipe support (mobile)
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 60) {
      navigate(diff > 0 ? -1 : 1);
    }
  }, { passive: true });

  // --- Attach click handlers to all media elements ---

  // 1. Carousel images (index page)
  document.querySelectorAll('.carousel-item.item-image').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const items = collectMediaInContext(item);
      const idx = items.findIndex(m => m.element === item);
      openLightbox(items, idx >= 0 ? idx : 0);
    });
  });

  // 2. Carousel videos (reels + horizontal videos - index + dedicated pages)
  document.querySelectorAll('.carousel-item.item-reel, .carousel-item.item-video').forEach(item => {
    item.style.cursor = 'pointer';
    // Add play icon overlay
    if (!item.querySelector('.play-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'play-overlay';
      overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';
      item.appendChild(overlay);
    }

    function openVideoItem(e) {
      e.preventDefault();
      e.stopPropagation();
      const vid = item.querySelector('video');
      if (vid) vid.pause();
      const items = collectMediaInContext(item);
      const idx = items.findIndex(m => m.element === item);
      openLightbox(items, idx >= 0 ? idx : 0);
    }

    // Click on overlay opens lightbox
    item.querySelector('.play-overlay').addEventListener('click', openVideoItem);
    // Click on the item itself also opens lightbox
    item.addEventListener('click', openVideoItem);
  });

  // 3. Image grid items (DUBOM dedicated page)
  document.querySelectorAll('.grid-img[data-lightbox], .gallery-item[data-lightbox]').forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const items = collectMediaInContext(item);
      const idx = items.findIndex(m => m.element === item);
      openLightbox(items, idx >= 0 ? idx : 0);
    });
  });

  // 4. Image row items (feed/stories rows)
  document.querySelectorAll('.image-row img').forEach(img => {
    const wrapper = img.closest('.image-row > *') || img;
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', (e) => {
      e.preventDefault();
      const items = collectMediaInContext(wrapper);
      const idx = items.findIndex(m => m.src === img.src);
      openLightbox(items, idx >= 0 ? idx : 0);
    });
  });

  // 5. Stacked videos (dedicated pages)
  document.querySelectorAll('.stacked-video-item').forEach(item => {
    item.style.cursor = 'pointer';
    // Add play overlay
    if (!item.querySelector('.play-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'play-overlay';
      overlay.innerHTML = '<svg viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>';
      item.style.position = 'relative';
      item.appendChild(overlay);
    }

    item.addEventListener('click', (e) => {
      // Don't intercept native controls clicks
      if (e.target.closest('video')) {
        // Only open lightbox if click is not on controls area (bottom 40px)
        const rect = item.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        if (clickY > rect.height - 50) return; // Let native controls work
      }
      e.preventDefault();
      const vid = item.querySelector('video');
      if (vid) vid.pause();
      const items = collectMediaInContext(item);
      const idx = items.findIndex(m => m.element === item);
      openLightbox(items, idx >= 0 ? idx : 0);
    });
  });
}
