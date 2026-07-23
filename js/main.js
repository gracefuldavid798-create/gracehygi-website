/* ============================================================
   Graceful International (HK) Limited — Main JavaScript
   Interactivity, animations, forms, lazy loading
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollEffects();
  initMobileMenu();
  initBackToTop();
  initLazyLoading();
  initSmoothScroll();
  initContactForm();
  initSampleModal();
});

/* --- Navigation Scroll Effect --- */
function initNavigation() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });
}

/* --- Scroll Animations --- */
function initScrollEffects() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  /* Observe elements with .reveal class for staggered fade-in */
  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  /* Also observe section-level elements for a base reveal */
  document.querySelectorAll('.section, .section-sm, .trust-bar, .cta-banner').forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      observer.observe(el);
    }
  });

  /* Trigger on-load — reveal elements already in viewport */
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) {
        el.classList.add('revealed');
      }
    });
  });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
  });

  /* Close menu on link click */
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  });

  /* Close on outside click */
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      toggle.classList.remove('active');
      links.classList.remove('open');
    }
  });
}

/* --- Back to Top --- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Lazy Loading Images --- */
function initLazyLoading() {
  if ('loading' in HTMLImageElement.prototype) {
    /* Native lazy loading supported */
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    });
    return;
  }

  /* Fallback: Intersection Observer */
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.getAttribute('data-src')) {
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* --- Smooth Scroll for Anchor Links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.nav')?.offsetHeight || 72;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    /* Basic validation */
    const name = form.querySelector('#contact-name')?.value.trim();
    const email = form.querySelector('#contact-email')?.value.trim();
    const country = form.querySelector('#contact-country')?.value.trim();
    const message = form.querySelector('#contact-message')?.value.trim();

    if (!name || !email || !country || !message) {
      showToast(I18N.current === 'zh' ? '请填写所有必填字段' : 'Please fill in all required fields', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(I18N.current === 'zh' ? '请输入有效的邮箱地址' : 'Please enter a valid email address', 'error');
      return;
    }

    /* Simulate submission (in production, send to server) */
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = I18N.current === 'zh' ? '发送中...' : 'Sending...';
    submitBtn.disabled = true;

    setTimeout(() => {
      showToast(I18N.t('form_success'), 'success');
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }, 1500);
  });
}

/* --- Sample Request Modal --- */
function initSampleModal() {
  const modal = document.querySelector('#sample-modal');
  if (!modal) return;

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');
  const form = modal.querySelector('#sample-form');

  /* Open modal */
  document.querySelectorAll('.btn-free-sample, [data-action="sample"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product') || '';
      const productSelect = form?.querySelector('#sample-product');
      if (productSelect && product) {
        productSelect.value = product;
      }
      modal.style.display = 'flex';
      setTimeout(() => overlay.classList.add('active'), 10);
      document.body.style.overflow = 'hidden';
    });
  });

  /* Close modal */
  function closeModal() {
    overlay.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }

  closeBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  /* Form submission */
  form?.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = form.querySelector('#sample-name')?.value.trim();
    const email = form.querySelector('#sample-email')?.value.trim();
    const company = form.querySelector('#sample-company')?.value.trim();
    const country = form.querySelector('#sample-country')?.value.trim();
    const product = form.querySelector('#sample-product')?.value;

    if (!name || !email || !company || !country || !product) {
      showToast(I18N.current === 'zh' ? '请填写所有必填字段' : 'Please fill in all required fields', 'error');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = I18N.current === 'zh' ? '提交中...' : 'Submitting...';
    submitBtn.disabled = true;

    setTimeout(() => {
      showToast(I18N.t('sample_success'), 'success');
      form.reset();
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      closeModal();
    }, 1500);
  });
}

/* --- Toast Notification --- */
function showToast(message, type = 'success') {
  /* Remove existing toast */
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  /* Trigger animation */
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  /* Auto remove */
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* --- Counter Animation for Stats --- */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(target * eased);
          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target;
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* Initialize counter animation on load */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(animateCounters, 500);
});

/* ============================================================
   Module Video Play Button (homepage factory tour)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('.module-video-wrapper');
  const video = document.querySelector('.module-video-player');
  const playBtn = document.querySelector('.module-video-play');

  if (!wrapper || !video || !playBtn) return;

  const startPlay = () => {
    video.play().then(() => {
      wrapper.classList.add('playing');
    }).catch(() => {
      // Autoplay blocked or no source — leave overlay visible
    });
  };

  playBtn.addEventListener('click', startPlay);

  // When user clicks anywhere on the overlay area, start playing
  const overlay = document.querySelector('.module-video-overlay');
  if (overlay) {
    overlay.addEventListener('click', startPlay);
  }

  // When video is paused, show overlay again
  video.addEventListener('pause', () => {
    wrapper.classList.remove('playing');
  });
  video.addEventListener('ended', () => {
    wrapper.classList.remove('playing');
  });
});
