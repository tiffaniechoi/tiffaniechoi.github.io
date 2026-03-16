/* ============================================================
   main.js — Personal Portfolio
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === SCROLL REVEAL ===
  // Keeps observing so elements re-animate when scrolled back into view.
  // Direction flips based on which side the element exited (top vs bottom).
  const ALL_DIR_CLASSES = [
    'reveal--from-left', 'reveal--from-right',
    'reveal--from-top-left', 'reveal--from-top-right', 'reveal--from-top'
  ];
  const cardDirections = new Map();
  const settleTimers   = new Map();

  // Assign alternating directions to card tiles
  const cardSelectors = '.exp-card.reveal, .proj-card.reveal, .edu-card.reveal, .fun-card.reveal, .quick-fact.reveal';
  document.querySelectorAll(cardSelectors).forEach((card, i) => {
    const dir = i % 2 === 0 ? 'reveal--from-left' : 'reveal--from-right';
    card.classList.add(dir);
    cardDirections.set(card, dir);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;

        if (entry.isIntersecting) {
          // Animate in
          el.classList.add('visible');

          // After reveal settles, switch to fast transition so hover lift feels snappy
          clearTimeout(settleTimers.get(el));
          const delayMs = parseFloat(el.style.getPropertyValue('--delay')) || 0;
          settleTimers.set(el, setTimeout(() => {
            el.style.transition = 'transform 250ms ease, box-shadow 250ms ease';
          }, 700 + delayMs));

        } else {
          // Instantly hide — no transition so it snaps off-screen cleanly
          clearTimeout(settleTimers.get(el));
          el.style.transition = 'none';
          el.classList.remove('visible');

          // Set direction for next re-entry based on which side it exited
          const leftFromTop = entry.boundingClientRect.top < 0;
          el.classList.remove(...ALL_DIR_CLASSES);
          const base = cardDirections.get(el);
          if (base) {
            // Cards: flip to top-* variant when exiting upward
            el.classList.add(leftFromTop ? base.replace('from-', 'from-top-') : base);
          } else if (leftFromTop) {
            // Headings/labels: come from above when scrolling back up
            el.classList.add('reveal--from-top');
          }

          // Re-enable CSS transition after one frame so next reveal animates
          requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.transition = '';
          }));
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.reveal').forEach((el) => {
    revealObserver.observe(el);
  });


  // === NAV SCROLL BEHAVIOR ===
  // Adds .nav--scrolled after 40px for frosted-glass effect
  const nav = document.getElementById('site-nav');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run once on load


  // === SKILLS PILL BUILDER ===
  // Reads data-skills CSV attribute → creates <span class="skill-pill"> children
  document.querySelectorAll('[data-skills]').forEach((container) => {
    const raw = container.getAttribute('data-skills') || '';
    const skills = raw.split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('{{'));

    skills.forEach((skill) => {
      const pill = document.createElement('span');
      pill.className = 'skill-pill';
      pill.textContent = skill;
      container.appendChild(pill);
    });
  });


  // === EXPERIENCE EXPAND ===
  // Parses data-more CSV into <li> elements on first click,
  // toggles hidden attribute + aria-expanded, updates button label
  document.querySelectorAll('.exp-card__toggle').forEach((btn) => {
    const card = btn.closest('.exp-card');
    const moreList = card.querySelector('.exp-card__more-bullets');

    if (!moreList) return;

    // Check if there are actually more bullets to show
    const moreData = moreList.getAttribute('data-more') || '';
    const moreBullets = moreData.split(',').map((s) => s.trim()).filter(Boolean);

    // Hide toggle if no extra bullets
    if (moreBullets.length === 0) {
      btn.style.display = 'none';
      return;
    }

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Build bullet list on first open
      if (!moreList.dataset.built) {
        moreBullets.forEach((text) => {
          const li = document.createElement('li');
          li.textContent = text;
          moreList.appendChild(li);
        });
        moreList.dataset.built = 'true';
      }

      if (isExpanded) {
        // Collapse
        moreList.hidden = true;
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = 'Show more <i class="exp-card__toggle-icon" aria-hidden="true">↓</i>';
      } else {
        // Expand
        moreList.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
        btn.innerHTML = 'Show less <i class="exp-card__toggle-icon" aria-hidden="true">↓</i>';
      }
    });
  });


  // === ACTIVE NAV HIGHLIGHT ===
  // IntersectionObserver with rootMargin to highlight nav link as section enters viewport
  const navLinks = document.querySelectorAll('.nav__link[data-nav-section]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            if (link.getAttribute('data-nav-section') === id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  document.querySelectorAll('section[id]').forEach((section) => {
    sectionObserver.observe(section);
  });


});
