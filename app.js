(() => {
  const topbar = document.querySelector('.topbar');
  const progress = document.querySelector('.scroll-progress span');
  const bgImage = document.querySelector('.site-background img');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback && !img.dataset.fallbackUsed) {
        img.dataset.fallbackUsed = 'true';
        img.src = img.dataset.fallback;
      }
    });
  });

  const updateScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${Math.min(100, (y / max) * 100)}%`;
    topbar.classList.toggle('scrolled', y > 30);
    if (!reduceMotion && bgImage) {
      bgImage.style.transform = `scale(1.12) translate3d(0, ${Math.min(42, y * 0.028)}px, 0)`;
    }
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    reveals.forEach((el, index) => {
      if (!el.dataset.delay) el.dataset.delay = String((index % 3) * 85);
      observer.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('visible'));
  }

  document.querySelectorAll('[data-tilt]').forEach((figure) => {
    const scene = figure.querySelector('.photo-model__scene');
    if (!scene || reduceMotion) return;
    let raf = null;
    scene.addEventListener('pointermove', (event) => {
      const rect = scene.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const ry = (px - .5) * 5.5;
      const rx = (.5 - py) * 4;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        scene.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      });
    });
    scene.addEventListener('pointerleave', () => {
      cancelAnimationFrame(raf);
      scene.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });

  const copy = {
    car: {
      aero: ['Active aerodynamics', 'Vertical front flaps manage cooling and drag, opening only when the car needs more air or stability.'],
      engine: ['Rear-mounted flat-six', 'Placing the compact boxer engine behind the rear axle creates the traction and response that define the 911.'],
      brakes: ['High-performance brakes', 'Large ventilated discs manage repeated energy transfer, while optional ceramic brakes reduce unsprung mass.'],
      cockpit: ['Porsche digital interaction', 'A curved digital cluster, PCM and customisable widgets place information around the driver rather than around a generic screen.'],
      rearsteer: ['Rear-axle steering', 'At low speed the rear wheels steer opposite the fronts for agility; at higher speed they align for stability.']
    },
    powertrain: {
      flat6: ['3.6-litre flat-six', 'A newly developed rear-mounted boxer engine forms the combustion core of the lightweight T-Hybrid system.'],
      turbo: ['Electric exhaust turbocharger', 'An electric motor accelerates the compressor quickly, reducing delay while also recovering energy from exhaust flow.'],
      pdk: ['Motor inside the PDK', 'The electric motor integrated into the dual-clutch transmission adds torque directly and can recover energy during deceleration.'],
      battery: ['Compact 400-volt battery', 'A small high-power battery stores recuperated energy for rapid deployment rather than long electric-only driving.']
    }
  };

  const focusPositions = {
    aero: ['27%', '57%', '23%'],
    engine: ['72%', '47%', '24%'],
    brakes: ['75%', '71%', '18%'],
    cockpit: ['44%', '34%', '21%'],
    rearsteer: ['65%', '66%', '20%']
  };

  document.querySelectorAll('.hotspot').forEach((button) => {
    button.addEventListener('click', () => {
      const model = button.dataset.model;
      const part = button.dataset.part;
      const data = copy[model]?.[part];
      if (!data) return;

      const layout = button.closest('.model-layout');
      layout.querySelectorAll('.hotspot').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');

      document.getElementById(`${model}-title`).textContent = data[0];
      document.getElementById(`${model}-copy`).textContent = data[1];

      if (model === 'car') {
        const ring = layout.querySelector('.focus-ring');
        const [left, top, width] = focusPositions[part];
        ring.style.left = left;
        ring.style.top = top;
        ring.style.width = width;
        ring.classList.add('active');
      } else {
        layout.querySelectorAll('.engine-zone').forEach((zone) => zone.classList.remove('active'));
        layout.querySelector(`.engine-zone--${part}`)?.classList.add('active');
      }
    });
  });
  document.querySelector('.hotspot--aero')?.click();

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const finishIntro = () => {
    document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('visible'));
    document.body.classList.add('intro-ready');
    document.body.classList.remove('is-loading');
    document.getElementById('intro-loader')?.classList.add('is-finished');
  };
  if (document.readyState === 'complete') {
    window.setTimeout(finishIntro, reduceMotion ? 0 : 500);
  } else {
    window.addEventListener('load', () => window.setTimeout(finishIntro, reduceMotion ? 0 : 500), { once: true });
  }
  window.setTimeout(finishIntro, 2400);

  const tourParts = [
    ['aero', 'Active aerodynamics', 'Cooling openings and airflow devices react to speed and thermal demand.'],
    ['engine', 'Rear-mounted flat-six', 'The boxer engine sits behind the rear axle and shapes the car’s traction and sound.'],
    ['brakes', 'High-performance brakes', 'Large discs and carefully managed cooling convert speed into heat repeatedly.'],
    ['cockpit', 'Porsche digital interaction', 'The interface blends a digital cluster, PCM, physical controls and connected services.'],
    ['rearsteer', 'Rear-axle steering', 'Software-controlled rear steering changes the car’s agility and stability with speed.']
  ];
  const tourPanel = document.getElementById('tour-panel');
  const tourStep = document.getElementById('tour-step');
  const tourHeading = document.getElementById('tour-heading');
  const tourCopy = document.getElementById('tour-copy');
  let tourIndex = 0;

  const showTourStep = (index, shouldScroll = false) => {
    if (!tourPanel) return;
    tourIndex = (index + tourParts.length) % tourParts.length;
    const [part, title, description] = tourParts[tourIndex];
    tourPanel.hidden = false;
    tourPanel.classList.remove('is-changing');
    void tourPanel.offsetWidth;
    tourPanel.classList.add('is-changing');
    tourStep.textContent = `${String(tourIndex + 1).padStart(2, '0')} / ${String(tourParts.length).padStart(2, '0')}`;
    tourHeading.textContent = title;
    tourCopy.textContent = description;
    document.querySelector(`.hotspot[data-model="car"][data-part="${part}"]`)?.click();
    if (shouldScroll) document.getElementById('car')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };
  const startTour = () => showTourStep(0, true);
  document.getElementById('tour-start')?.addEventListener('click', startTour);
  document.getElementById('hero-tour-start')?.addEventListener('click', startTour);
  document.getElementById('tour-next')?.addEventListener('click', () => showTourStep(tourIndex + 1));
  document.getElementById('tour-prev')?.addEventListener('click', () => showTourStep(tourIndex - 1));
  document.getElementById('tour-close')?.addEventListener('click', () => { tourPanel.hidden = true; });

  const variants = {
    carrera: {
      name: '911 Carrera', kicker: 'THE PURE STARTING POINT',
      summary: 'The core rear-wheel-drive 911 keeps the broadest balance of performance, usability and identity.',
      length: '4.1 s', span: '290 kW / 394 PS', range: '294 km/h', capacity: 'Rear-wheel drive',
      engine: '3.0-litre twin-turbo', mission: 'Everyday sports car', scale: .74
    },
    carreras: {
      name: '911 Carrera S', kicker: 'MORE POWER, SAME BALANCE',
      summary: 'A stronger twin-turbo engine and upgraded performance hardware sharpen the Carrera formula.',
      length: '3.5 s', span: '353 kW / 480 PS', range: '308 km/h', capacity: 'Rear-wheel drive',
      engine: '3.0-litre twin-turbo', mission: 'Fast road performance', scale: .82
    },
    st: {
      name: '911 S/T', kicker: 'RUBY STAR NEO / LIGHTWEIGHT',
      summary: 'A 60th-anniversary special combining a naturally aspirated 4.0-litre flat-six with extreme lightweight construction.',
      length: '3.7 s', span: '386 kW / 525 PS', range: '300 km/h', capacity: 'Rear-wheel drive',
      engine: '4.0-litre naturally aspirated', mission: 'Pure road engagement', scale: .88
    },
    gt3: {
      name: '911 GT3', kicker: 'MOTORSPORT WITHOUT A TURBO',
      summary: 'A naturally aspirated 4.0-litre engine, up to 9,000 rpm and track-developed aero prioritise feedback.',
      length: '3.4 s', span: '375 kW / 510 PS', range: '311 km/h', capacity: 'Rear-wheel drive',
      engine: '4.0-litre naturally aspirated', mission: 'Road and circuit precision', scale: .91
    },
    turbos: {
      name: '911 Turbo S', kicker: 'THE LIMIT OF THE ROAD CAR',
      summary: 'All-wheel drive, twin electric turbochargers and T-Hybrid assistance create the fastest current 911.',
      length: '2.5 s', span: '523 kW / 711 PS', range: '322 km/h', capacity: 'All-wheel drive',
      engine: '3.6-litre T-Hybrid', mission: 'Maximum all-weather speed', scale: 1
    }
  };
  const variantDisplay = document.querySelector('.variant-display');
  const variantEls = {
    kicker: document.getElementById('variant-kicker'), name: document.getElementById('variant-name'),
    summary: document.getElementById('variant-summary'), length: document.getElementById('variant-length'),
    span: document.getElementById('variant-span'), range: document.getElementById('variant-range'),
    capacity: document.getElementById('variant-capacity'), engine: document.getElementById('variant-engine'),
    mission: document.getElementById('variant-mission'), body: document.getElementById('variant-scale-body')
  };
  const selectVariant = (key) => {
    const data = variants[key];
    if (!data) return;
    document.querySelectorAll('.variant-tab').forEach((tab) => {
      const active = tab.dataset.variant === key;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    Object.entries(variantEls).forEach(([field, el]) => {
      if (!el || field === 'body') return;
      el.textContent = data[field];
    });
    variantEls.body.style.width = `${66 + data.scale * 29}%`;
    variantDisplay.classList.remove('is-changing');
    void variantDisplay.offsetWidth;
    variantDisplay.classList.add('is-changing');
  };
  const tabs = [...document.querySelectorAll('.variant-tab')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectVariant(tab.dataset.variant));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'ArrowRight' ? index + 1 : index - 1;
      const target = tabs[(next + tabs.length) % tabs.length];
      target.focus();
      target.click();
    });
  });
  selectVariant('st');
})();