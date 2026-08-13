(function () {
  'use strict';

  var promoBar = document.getElementById('promo-bar');
  var promoToggle = document.getElementById('promo-toggle');
  var promoContent = document.getElementById('promo-content');
  var promoClose = document.getElementById('promo-close');

  if (promoBar && localStorage.getItem('innovet_promo_hidden') === '1') {
    promoBar.classList.add('is-hidden');
  }

  if (promoToggle && promoContent) {
    promoToggle.addEventListener('click', function () {
      var open = promoToggle.getAttribute('aria-expanded') === 'true';
      promoToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (open) {
        promoContent.hidden = true;
        promoToggle.querySelector('.promo-bar__more') &&
          (promoToggle.querySelector('.promo-bar__more').childNodes[0].textContent = 'See More ');
      } else {
        promoContent.hidden = false;
        promoToggle.querySelector('.promo-bar__more') &&
          (promoToggle.querySelector('.promo-bar__more').childNodes[0].textContent = 'See Less ');
      }
    });
  }

  if (promoClose && promoBar) {
    promoClose.addEventListener('click', function () {
      promoBar.classList.add('is-hidden');
      try { localStorage.setItem('innovet_promo_hidden', '1'); } catch (e) {}
    });
  }

  // Desktop dropdowns (keyboard)
  document.querySelectorAll('.has-dropdown').forEach(function (item) {
    var btn = item.querySelector('.nav-parent');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!item.contains(e.target)) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile nav
  var mobileNav = document.getElementById('mobile-nav');
  var mobileToggle = document.getElementById('mobile-nav-toggle');
  var mobileClose = document.getElementById('mobile-nav-close');

  function openMobile() {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.hidden = false;
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobile() {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.hidden = true;
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (mobileToggle) mobileToggle.addEventListener('click', openMobile);
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);
  if (mobileNav) {
    mobileNav.addEventListener('click', function (e) {
      if (e.target === mobileNav) closeMobile();
    });
  }
  window.addEventListener('resize', function () {
    if (window.innerWidth > 1024) closeMobile();
  });

  document.querySelectorAll('.mobile-accordion > button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var li = btn.parentElement;
      var open = li.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  // Carousels
  function bindCarousel(trackSelector, prevSelector, nextSelector) {
    var track = document.querySelector(trackSelector);
    var prev = document.querySelector(prevSelector);
    var next = document.querySelector(nextSelector);
    if (!track) return;
    var amount = function () { return Math.min(track.clientWidth * 0.85, 360); };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -amount(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: amount(), behavior: 'smooth' }); });
  }
  bindCarousel('#services-track', '#services-prev', '#services-next');
  bindCarousel('#reviews-track', '#reviews-prev', '#reviews-next');

  // Lightbox
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = document.getElementById('lightbox-close');
  document.querySelectorAll('[data-lightbox]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = btn.getAttribute('data-full') || btn.querySelector('img').src;
      lightboxImg.alt = btn.getAttribute('data-alt') || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    });
  });
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLightbox(); closeMobile(); }
  });

  // Back to top
  var backTop = document.getElementById('back-to-top');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.hidden = window.scrollY < 500;
    }, { passive: true });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Form validation
  document.querySelectorAll('form[data-validate="true"]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var valid = true;
      var status = form.querySelector('.form-status');
      form.querySelectorAll('[required]').forEach(function (field) {
        field.classList.remove('is-invalid');
        if (!field.value.trim()) {
          valid = false;
          field.classList.add('is-invalid');
        }
      });
      var email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        valid = false;
        email.classList.add('is-invalid');
      }
      if (!valid) {
        e.preventDefault();
        if (status) status.textContent = 'Please complete the required fields.';
      } else if (status) {
        status.textContent = 'Sending…';
      }
    });
  });
})();
