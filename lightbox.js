/* Portfolio media lightbox
 * Makes images & videos in the body clickable to open enlarged in a modal.
 * Close with ESC, the × button, or by clicking the backdrop.
 * Excludes: logos (src/alt contains "logo"), linked media (inside <a>),
 * and anything marked [data-no-zoom] (or inside one).
 * Delegation-based + CSS rule injection, so it survives Design Component re-renders.
 */
(function () {
  if (window.__mediaLightboxInit) return;
  window.__mediaLightboxInit = true;

  var FONT = "'Bricolage Grotesque','Hanken Grotesk',-apple-system,system-ui,sans-serif";

  /* --- cursor + affordance styles (CSS rule, not per-node, so re-renders keep it) --- */
  var style = document.createElement('style');
  style.textContent = [
    'img:not([data-no-zoom]):not([src*="logo"]):not([src*="Logo"]),',
    'video:not([data-no-zoom]) { cursor: zoom-in; }',
    'a img, a video { cursor: pointer; }',
    '[data-no-zoom] img, [data-no-zoom] video { cursor: inherit; }',
    /* modal */
    '.mlb-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
    'padding:clamp(20px,5vw,64px);background:rgba(15,12,9,0.22);-webkit-backdrop-filter:blur(5px) saturate(1.05);backdrop-filter:blur(5px) saturate(1.05);',
    'opacity:0;transition:opacity .22s cubic-bezier(.2,.8,.2,1);}',
    '.mlb-overlay.mlb-open{opacity:1;}',
    '.mlb-stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:100%;max-height:100%;',
    'transform:scale(.96);transition:transform .26s cubic-bezier(.2,.8,.2,1);}',
    '.mlb-overlay.mlb-open .mlb-stage{transform:scale(1);}',
    '.mlb-media{display:block;max-width:92vw;max-height:84vh;width:auto;height:auto;border-radius:14px;',
    'box-shadow:0 24px 70px rgba(0,0,0,.5),0 4px 14px rgba(0,0,0,.35);background:#15120F;}',
    '.mlb-cap{max-width:min(720px,90vw);margin:0;text-align:center;font-family:' + FONT + ';',
    'font-size:14px;line-height:1.5;color:rgba(252,250,247,.82);text-wrap:pretty;}',
    '.mlb-close{position:fixed;top:clamp(14px,2.4vw,26px);right:clamp(14px,2.4vw,26px);width:44px;height:44px;',
    'display:flex;align-items:center;justify-content:center;border:none;border-radius:50%;cursor:pointer;',
    'background:rgba(252,250,247,.12);color:#FCFAF7;font-size:0;line-height:0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);',
    'transition:background .15s ease,transform .15s ease;}',
    '.mlb-close:hover{background:rgba(252,250,247,.24);transform:scale(1.06);}',
    '.mlb-close svg{width:20px;height:20px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round;}',
    '.mlb-lock{overflow:hidden !important;}',
    /* mobile: rotate landscape media 90° to use the full phone screen widescreen */
    '.mlb-overlay.mlb-rotate{overflow:hidden;}',
    '.mlb-overlay.mlb-rotate .mlb-media{max-width:90vh;max-height:92vw;transform:rotate(90deg);transform-origin:center;}',
    '.mlb-overlay.mlb-rotate .mlb-cap{display:none !important;}'
  ].join('');
  (document.head || document.documentElement).appendChild(style);

  /* --- modal shell (single instance, lives on <body>, outside any framework root) --- */
  var overlay, mediaHolder, caption, closeBtn, lastFocus = null;

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'mlb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Enlarged media');

    var stage = document.createElement('div');
    stage.className = 'mlb-stage';

    mediaHolder = document.createElement('div');
    mediaHolder.style.display = 'flex';
    mediaHolder.style.justifyContent = 'center';
    mediaHolder.style.maxWidth = '100%';
    mediaHolder.style.maxHeight = '84vh';

    caption = document.createElement('p');
    caption.className = 'mlb-cap';

    stage.appendChild(mediaHolder);
    stage.appendChild(caption);

    closeBtn = document.createElement('button');
    closeBtn.className = 'mlb-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

    overlay.appendChild(stage);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    // close interactions
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === stage) close();
    });
  }

  function captionFor(el) {
    var fig = el.closest('figure');
    if (fig) {
      var fc = fig.querySelector('figcaption');
      if (fc && fc.textContent.trim()) return fc.textContent.trim();
    }
    return (el.getAttribute('alt') || '').trim();
  }

  function open(el) {
    if (!overlay) build();
    lastFocus = document.activeElement;
    mediaHolder.innerHTML = '';

    var node;
    if (el.tagName === 'VIDEO') {
      node = document.createElement('video');
      node.src = el.currentSrc || el.getAttribute('src') || '';
      if (el.getAttribute('poster')) node.poster = el.getAttribute('poster');
      node.controls = true;
      node.autoplay = true;
      node.loop = true;
      node.playsInline = true;
      node.setAttribute('playsinline', '');
    } else {
      node = document.createElement('img');
      node.src = el.currentSrc || el.getAttribute('src') || '';
      node.alt = el.getAttribute('alt') || '';
    }
    node.className = 'mlb-media';
    mediaHolder.appendChild(node);

    var cap = captionFor(el);
    caption.textContent = cap;
    caption.style.display = cap ? '' : 'none';

    // mobile + portrait + landscape media → rotate 90° to fill the screen widescreen
    var rect = el.getBoundingClientRect();
    var isLandscape = rect.width > rect.height * 1.15;
    var isPhone = Math.min(window.innerWidth, window.innerHeight) <= 760;
    var isPortrait = window.innerHeight >= window.innerWidth;
    if (isPhone && isPortrait && isLandscape) overlay.classList.add('mlb-rotate');
    else overlay.classList.remove('mlb-rotate');

    document.documentElement.classList.add('mlb-lock');
    document.body.classList.add('mlb-lock');
    overlay.style.display = 'flex';
    // force reflow then animate in
    void overlay.offsetWidth;
    overlay.classList.add('mlb-open');
    closeBtn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('mlb-open');
    document.documentElement.classList.remove('mlb-lock');
    document.body.classList.remove('mlb-lock');
    window.setTimeout(function () {
      overlay.style.display = 'none';
      mediaHolder.innerHTML = ''; // stop/unload any playing video
    }, 240);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function zoomable(target) {
    var el = target.closest && target.closest('img, video');
    if (!el) return null;
    if (el.closest('a')) return null;                 // linked media → let the link win
    if (el.closest('[data-no-zoom]')) return null;    // opted out
    var src = el.currentSrc || el.getAttribute('src') || '';
    var alt = el.getAttribute('alt') || '';
    if (/logo/i.test(src) || /logo/i.test(alt)) return null;
    return el;
  }

  document.addEventListener('click', function (e) {
    if (overlay && overlay.style.display === 'flex') return; // modal handles its own clicks
    var el = zoomable(e.target);
    if (!el) return;
    e.preventDefault();
    open(el);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') close();
  });
})();
