// support.js — Sanchaya support bar + donation/contribution popup,
// ported from fonts.sanchaya.net for static (serverless) hosting.
// Shows the popup every visit (no user data is captured or stored).
(function () {
  function initContributionPopup() {
    var popup = document.getElementById('contribution-popup');
    var supportBar = document.getElementById('support-bar');

    function openPopup() {
      if (popup) popup.style.display = 'block';
    }

    function closePopup() {
      if (popup) popup.style.display = 'none';
    }

    function togglePopup() {
      if (popup && popup.style.display === 'block') {
        closePopup();
      } else {
        openPopup();
      }
    }

    // Support bar click toggles the popup
    if (supportBar) {
      supportBar.addEventListener('click', togglePopup);
    }

    // Close buttons (header × and footer button)
    var closeBtns = document.querySelectorAll('.close-popup');
    for (var i = 0; i < closeBtns.length; i++) {
      closeBtns[i].addEventListener('click', closePopup);
    }

    // Overlay click to close
    if (popup) {
      popup.addEventListener('click', function (e) {
        if (e.target === popup) {
          closePopup();
        }
      });
    }

    // Pop up the portal a few seconds after the page opens, every visit
    setTimeout(openPopup, 5000);
  }

  // Hamburger slide menu
  function initSlideMenu() {
    var baner = document.querySelector('.slide-menu-baner');
    var menu = document.querySelector('.slide-menu');
    var gap = document.querySelector('.gap-filler');
    var open = document.querySelector('.hamburger-icon');
    var close = document.querySelector('.close-btn');

    function toggle(flag) {
      if (!baner || !menu) return;
      if (flag) {
        baner.classList.add('open');
        menu.classList.add('open');
      } else {
        baner.classList.remove('open');
        menu.classList.remove('open');
      }
    }

    if (open) open.addEventListener('click', function () { toggle(true); });
    if (close) close.addEventListener('click', function () { toggle(false); });
    if (gap) gap.addEventListener('click', function () { toggle(false); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initContributionPopup();
      initSlideMenu();
    });
  } else {
    initContributionPopup();
    initSlideMenu();
  }
})();