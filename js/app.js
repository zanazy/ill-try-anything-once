/* ───────────────────────────────────────────
   ZLog · Main Application
   Rendering, events, routing, editor,
   player, theme management, and quick tags
   ─────────────────────────────────────────── */
window.ZLog = window.ZLog || {};

(function (Z) {
  'use strict';

  const { Data } = Z;

  /* ═══════════════════════════════════════
     MINIMAL 1.5PX STROKE SVG ICONS (currentColor)
     ═══════════════════════════════════════ */
  const ICONS = {
    star: `<svg class="icon-star" width="13" height="13" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0L9.8 6.2L16 8L9.8 9.8L8 16L6.2 9.8L0 8L6.2 6.2L8 0Z"/></svg>`,
    play: `<svg class="icon-play" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg class="icon-pause" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    cassette: `<svg class="icon-cassette" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="12" r="2.5"/><circle cx="16" cy="12" r="2.5"/><path d="M10.5 12h3"/><path d="M6 18h12"/></svg>`,
    waveform: `<svg class="icon-waveform" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10v4M7 6v12M11 3v18M15 7v10M19 5v14M23 10v4"/></svg>`,
    pin: `<svg class="icon-pin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    book: `<svg class="icon-book" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    disc: `<svg class="icon-disc" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`,
    yarn: `<svg class="icon-yarn" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10"/><path d="M9 3v18M15 3v18"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/></svg>`,
    sun: `<svg class="icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    moon: `<svg class="icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    close: `<svg class="icon-close" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    externalLink: `<svg class="icon-external" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`
  };

  /* ── State ── */
  let activeFilter = 'All';
  let currentTrack = null;   // { title, artist, note, url, parsed }
  let readerOpen = false;
  let editorOpen = false;

  /* ── DOM Cache ── */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {};

  function cacheDom() {
    dom.landingView     = $('#landing-view');
    dom.singleEntryView = $('#single-entry-view');
    dom.indexToggleBtn  = $('#index-toggle-btn');
    dom.indexSlideover  = $('#index-slideover');
    dom.indexCloseBtn   = $('#index-close-btn');
    dom.indexBackdrop   = $('#index-backdrop');
    dom.indexNav        = $('#index-nav');
    dom.filterBar       = $('#index-nav') || $('#filter-bar');
    dom.feedColumn      = $('#feed-column');
    dom.sidebarColumn   = $('#sidebar-column');
    dom.currentlyItems  = $('#currently-items');
    dom.readerOverlay   = $('#reader-overlay') || $('#single-entry-view');
    dom.readerContent   = $('#reader-content') || $('#single-entry-view');
    dom.readerClose     = $('#reader-close') || $('#single-entry-back-btn');
    dom.editorOverlay   = $('#editor-overlay');
    dom.canvasTopbar    = $('#canvas-topbar');
    dom.canvasBackBtn   = $('#canvas-back-btn');
    dom.canvasUndoBtn   = $('#canvas-undo-btn');
    dom.canvasRedoBtn   = $('#canvas-redo-btn');
    dom.canvasFormatBlock = $('#canvas-format-block');
    dom.canvasCodeBtn   = $('#canvas-code-btn');
    dom.canvasHighlightBtn = $('#canvas-highlight-btn');
    dom.canvasLinkBtn   = $('#canvas-link-btn');
    dom.canvasImageBtn  = $('#canvas-image-btn');
    dom.canvasImageInput = $('#canvas-image-input');
    dom.canvasSoundtrackToggle = $('#canvas-soundtrack-toggle');
    dom.canvasSoundtrackStrip = $('#canvas-soundtrack-strip');
    dom.canvasSoundtrackClose = $('#canvas-soundtrack-close');
    dom.canvasQuoteBtn  = $('#canvas-quote-btn');
    dom.canvasStickyBtn = $('#canvas-sticky-btn');
    dom.canvasHrBtn     = $('#canvas-hr-btn');
    dom.canvasPreviewBtn = $('#canvas-preview-btn');
    dom.canvasPublishBtn = $('#canvas-publish-btn');
    dom.canvasScrollBody = $('#canvas-scroll-body');
    dom.canvasContainer = $('#canvas-container');
    dom.canvasEditArea  = $('#canvas-edit-area');
    dom.canvasTitle     = $('#canvas-title');
    dom.canvasSubtitle  = $('#canvas-subtitle');
    dom.canvasCategoryTabs = $('#canvas-category-tabs');
    dom.canvasMdlPreview = $('#canvas-mdl-preview');
    dom.canvasMdlText   = $('#canvas-mdl-text');
    dom.canvasTrackUrl  = $('#canvas-track-url');
    dom.canvasTrackTitle = $('#canvas-track-title');
    dom.canvasTrackArtist = $('#canvas-track-artist');
    dom.canvasTrackNote = $('#canvas-track-note');
    dom.canvasTrackHint = $('#canvas-track-hint');
    dom.canvasBody      = $('#canvas-body');
    dom.canvasPreviewArea = $('#canvas-preview-area');
    dom.canvasPreviewMeta = $('#canvas-preview-meta');
    dom.canvasPreviewTitle = $('#canvas-preview-title');
    dom.canvasPreviewSubtitle = $('#canvas-preview-subtitle');
    dom.canvasPreviewSoundtrack = $('#canvas-preview-soundtrack');
    dom.canvasPreviewBody = $('#canvas-preview-body');
    dom.writeBtn        = $('#write-btn');
    dom.logoLink        = $('#logo-link');
    dom.themeToggle     = $('#theme-toggle');
    dom.themeIcon       = $('#theme-icon');
    dom.statusModal     = $('#status-modal');
    dom.editStatusBtn   = $('#edit-status-btn');
    dom.miniPlayer      = $('#mini-player');
    dom.miniVinyl       = $('#mini-vinyl');
    dom.miniTitle       = $('#mini-title');
    dom.miniArtist      = $('#mini-artist');
    dom.miniSourceBadge = $('#mini-source-badge');
    dom.miniCloseBtn    = $('#mini-close-btn');
    dom.miniVolume      = $('#mini-volume');
    dom.ytAudioHolder   = $('#yt-audio-holder');
    dom.directAudioBox  = $('#direct-audio-box');
    dom.directAudioEl   = $('#direct-audio-element');
    dom.directPlayBtn   = $('#direct-play-btn');
    dom.audioTimeCurrent= $('#audio-time-current');
    dom.audioTimeTotal  = $('#audio-time-total');
    dom.audioScrubber   = $('#audio-scrubber');
    dom.embedIframeBox  = $('#embed-iframe-box');
    dom.edTrackUrl      = $('#ed-track-url');
    dom.edTrackTitle    = $('#ed-track-title');
    dom.edTrackArtist   = $('#ed-track-artist');
    dom.edTrackNote     = $('#ed-track-note');
    dom.edTrackUrlHint  = $('#ed-track-url-hint');
    dom.exportBtn       = $('#export-btn');
    dom.importInput     = $('#import-input');
    dom.progressBar     = $('#reading-progress');
    dom.authorSignoutBtn = $('#author-signout-btn');
    dom.runningDate     = $('#diary-running-date');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ═══════════════════════════════════════
     URL PARSER & AUDIO HELPERS
     ═══════════════════════════════════════ */

  function formatAudioTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function parseTrackUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    let url = rawUrl.trim();

    // If user pasted an iframe embed code, extract the src URL
    const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
    if (iframeSrcMatch) {
      url = iframeSrcMatch[1];
    }

    // Direct Audio Files (.mp3, .m4a, .wav, .ogg, .aac)
    if (/\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(url)) {
      return {
        type: 'audio',
        platform: 'Direct Audio',
        url: url,
        embedUrl: url
      };
    }

    // YouTube & YouTube Music
    // Matches: youtube.com/watch?v=ID, youtu.be/ID, music.youtube.com/watch?v=ID, /embed/ID, /shorts/ID
    const ytMatch = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/))([\w-]{11})/i);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const isMusic = url.includes('music.youtube.com');
      return {
        type: 'youtube',
        platform: isMusic ? 'YouTube Music' : 'YouTube',
        id: videoId,
        url: url,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`
      };
    }

    // Spotify (tracks, albums, playlists, episodes)
    // Matches: open.spotify.com/track/ID, open.spotify.com/album/ID, with optional intl-xx path
    const spotifyMatch = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2,4}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
    if (spotifyMatch) {
      const mediaType = spotifyMatch[1].toLowerCase();
      const mediaId = spotifyMatch[2];
      return {
        type: 'spotify',
        platform: 'Spotify',
        id: mediaId,
        mediaType: mediaType,
        url: url,
        embedUrl: `https://open.spotify.com/embed/${mediaType}/${mediaId}?utm_source=generator`
      };
    }
    if (/open\.spotify\.com\/embed\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i.test(url)) {
      const m = url.match(/open\.spotify\.com\/embed\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/i);
      return {
        type: 'spotify',
        platform: 'Spotify',
        id: m[2],
        mediaType: m[1],
        url: url,
        embedUrl: url.includes('utm_source=generator') ? url : `${url}${url.includes('?') ? '&' : '?'}utm_source=generator`
      };
    }

    // SoundCloud
    if (/soundcloud\.com\//i.test(url)) {
      if (url.includes('w.soundcloud.com/player/')) {
        return {
          type: 'soundcloud',
          platform: 'SoundCloud',
          url: url,
          embedUrl: url
        };
      }
      return {
        type: 'soundcloud',
        platform: 'SoundCloud',
        url: url,
        embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23537E60&auto_play=true`
      };
    }

    // Fallback generic web audio link
    if (/^https?:\/\//i.test(url)) {
      return {
        type: 'generic',
        platform: 'Audio Link',
        url: url,
        embedUrl: url
      };
    }

    return null;
  }

  /* ═══════════════════════════════════════
     THEME
     ═══════════════════════════════════════ */

  function initTheme() {
    // Force Light Mode as the default theme on load
    applyTheme('light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (dom.themeIcon) {
      dom.themeIcon.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    }
    Data.saveTheme(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ═══════════════════════════════════════
     AUTHOR MODE & SUPABASE AUTH
     ═══════════════════════════════════════ */

  let currentAuthSession = null;

  async function initAuthorAuth() {
    currentAuthSession = await Data.getAuthSession();
    updateAuthorState(currentAuthSession);

    const sb = Data.getSupabase();
    if (sb) {
      sb.auth.onAuthStateChange((event, session) => {
        currentAuthSession = session;
        updateAuthorState(session);
      });
    }
  }

  function updateAuthorState(session) {
    const isAuthed = Boolean((session && session.user) || Data.isAuthorMode());
    if (isAuthed) {
      document.body.classList.add('author-mode');
      const emailEl = $('#author-session-email');
      if (emailEl) emailEl.textContent = (session && session.user && session.user.email) ? session.user.email : 'Author Mode Active';
    } else {
      document.body.classList.remove('author-mode');
    }
  }

  function showToast(msg) {
    const toast = $('#toast-notice');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3200);
  }

  function openAuthorModal() {
    const modal = $('#author-modal');
    if (!modal) return;

    const isAuthed = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    const loginForm = $('#author-login-form');
    const sessionPanel = $('#author-session-panel');
    const errorEl = $('#author-login-error');
    const emailInput = $('#author-email-input');
    const passInput = $('#author-password-input');

    if (errorEl) errorEl.textContent = '';

    if (isAuthed) {
      if (loginForm) loginForm.style.display = 'none';
      if (sessionPanel) sessionPanel.style.display = 'block';
      const emailEl = $('#author-session-email');
      if (emailEl) emailEl.textContent = (currentAuthSession && currentAuthSession.user) ? currentAuthSession.user.email : 'Author Mode Active';
    } else {
      if (loginForm) loginForm.style.display = 'block';
      if (sessionPanel) sessionPanel.style.display = 'none';
      if (passInput) passInput.value = '';
    }

    modal.classList.add('open');
    if (!isAuthed && emailInput) {
      setTimeout(() => emailInput.focus(), 250);
    }
  }

  function closeAuthorModal() {
    const modal = $('#author-modal');
    if (modal) modal.classList.remove('open');
  }

  async function handleAuthorLoginSubmit(e) {
    e.preventDefault();
    const email = ($('#author-email-input') ? $('#author-email-input').value : '').trim();
    const password = $('#author-password-input') ? $('#author-password-input').value : '';
    const errorEl = $('#author-login-error');
    const submitBtn = $('#author-modal-submit');

    if (!email || !password) {
      if (errorEl) errorEl.textContent = 'Please enter both email and password.';
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing In…';
    }
    if (errorEl) errorEl.textContent = '';

    try {
      const session = await Data.signInAuthor(email, password);
      currentAuthSession = session;
      updateAuthorState(session);
      closeAuthorModal();
      showToast('Signed in as Author.');
      await syncAndRenderPosts();
      await syncLiveStatus();
    } catch (err) {
      console.warn('Login failed:', err);
      if (errorEl) {
        errorEl.textContent = err.message || 'Invalid email or password.';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
      }
    }
  }

  async function handleAuthorSignOut() {
    await Data.signOutAuthor();
    currentAuthSession = null;
    updateAuthorState(null);
    closeAuthorModal();
    showToast('Signed out. Public view active.');
    await syncAndRenderPosts();
  }

  async function syncAndRenderPosts() {
    await Data.fetchLivePosts();
    renderFeed();
  }

  async function syncLiveStatus() {
    await Data.fetchLiveStatus();
    renderCurrently();
  }

  /* ═══════════════════════════════════════
     QUICK TAGS & EDITORIAL BADGES
     ═══════════════════════════════════════ */

  function formatTagBadge(tag, entryId, mdlMap) {
    const clean = tag.toLowerCase().trim();
    let label = tag;
    let modifierClass = 'entry-tag--default';

    if (clean.startsWith('might delete later')) {
      const numStr = mdlMap && entryId ? (mdlMap.get(entryId) || '#01') : '#01';
      label = `might delete later ${numStr}`;
      modifierClass = 'entry-tag--mdl';
    } else if (clean === 'nocturnal thoughts') {
      label = 'nocturnal thoughts';
      modifierClass = 'entry-tag--nocturnal';
    } else if (clean === 'rants') {
      label = 'rants';
      modifierClass = 'entry-tag--rants';
    } else if (clean === 'brain dump') {
      label = 'brain dump';
      modifierClass = 'entry-tag--braindump';
    } else if (clean === 'tiny wins') {
      label = 'tiny wins';
      modifierClass = 'entry-tag--tinywins';
    } else if (clean === 'field notes') {
      label = 'field notes';
      modifierClass = 'entry-tag--fieldnotes';
    } else if (clean === 'slow afternoons') {
      label = 'slow afternoons';
      modifierClass = 'entry-tag--slowafternoons';
    }

    return `<span class="entry-tag ${modifierClass}" data-filter-tag="${clean}">${label}</span>`;
  }

  /* ═══════════════════════════════════════
     FILTERS (Vertical Editorial Sidebar Index)
     ═══════════════════════════════════════ */

  function renderFilters() {
    if (!dom.filterBar) return;
    const allEntries = Data.loadEntries();
    dom.filterBar.innerHTML = Data.TAGS.map((tag) => {
      const count = tag.toLowerCase() === 'all'
        ? allEntries.length
        : Data.getFilteredEntries(tag).length;
      const countPadded = String(count).padStart(2, '0');
      const isActive = tag.toLowerCase() === activeFilter.toLowerCase();
      const label = tag.toLowerCase();
      return `
        <button class="index-nav-item${isActive ? ' active' : ''}" data-tag="${tag}">
          <span class="index-item-left">
            <span class="index-indicator" aria-hidden="true">—</span>
            <span class="index-label">${label}</span>
          </span>
          <span class="index-count">${countPadded}</span>
        </button>
      `;
    }).join('');
  }

  function openIndexSlideover() {
    if (dom.indexSlideover) dom.indexSlideover.classList.add('open');
    if (dom.indexBackdrop) dom.indexBackdrop.classList.add('open');
  }

  function closeIndexSlideover() {
    if (dom.indexSlideover) dom.indexSlideover.classList.remove('open');
    if (dom.indexBackdrop) dom.indexBackdrop.classList.remove('open');
  }

  function toggleIndexSlideover() {
    if (!dom.indexSlideover) return;
    if (dom.indexSlideover.classList.contains('open')) {
      closeIndexSlideover();
    } else {
      openIndexSlideover();
    }
  }

  function handleFilterClick(e) {
    const item = e.target.closest('.index-nav-item, .filter-nav-btn, .filter-pill');
    if (!item) return;
    activeFilter = item.dataset.tag;
    renderFilters();
    closeIndexSlideover();
    if (readerOpen) closeReader();
    renderFeed();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ═══════════════════════════════════════
     FEED
     ═══════════════════════════════════════ */

  function formatDate(dateStr) {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderEntryCard(entry, mdlMap) {
    const coverHtml = entry.coverGradient
      ? `<div class="entry-cover"><div class="entry-cover-inner" style="background:${entry.coverGradient};"></div></div>`
      : '';

    let songPillHtml = '';
    const st = entry.soundtrack;
    if (st && (st.title || st.artist || st.url || entry.song_url)) {
      const songUrl = st.url || entry.song_url;
      const title = st.title || 'Soundtrack';
      const artist = st.artist || '';
      const displayLabel = artist ? `${title} — ${artist}` : title;

      if (songUrl) {
        const fullTrack = { ...st, url: songUrl, title, artist };
        const isPlaying = isTrackPlaying(fullTrack);
        const songPillIcon = isPlaying ? ICONS.waveform : ICONS.cassette;
        songPillHtml = `
          <div class="song-pill${isPlaying ? ' playing' : ''}"
               role="button"
               tabindex="0"
               title="Play soundtrack"
               data-entry-id="${entry.id}"
               data-track='${escapeHtml(JSON.stringify(fullTrack))}'>
            <span class="pill-icon">${songPillIcon}</span>
            <span>${escapeHtml(displayLabel)}</span>
          </div>`;
      } else {
        // Clean non-playable soundtrack note
        songPillHtml = `
          <div class="song-pill song-pill--note"
               title="Soundtrack note"
               data-entry-id="${entry.id}">
            <span class="pill-icon">${ICONS.cassette}</span>
            <span>${escapeHtml(displayLabel)}</span>
          </div>`;
      }
    }

    const tagsMetaHtml = (entry.tags || []).map(t =>
      `<span class="dot"></span>` + formatTagBadge(t, entry.id, mdlMap)
    ).join('');

    return `
      <article class="diary-paper-slip entry-card" data-entry-id="${entry.id}">
        <!-- V-notched botanical sage ribbon bookmark on top-right corner -->
        <div class="ribbon-bookmark" aria-hidden="true">
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <path d="M0 0 H16 V22 L8 16 L0 22 Z" fill="#537E60"/>
          </svg>
        </div>
        <div class="entry-meta">
          <span>${formatDate(entry.date || entry.createdAt)}</span>
          <span class="dot"></span>
          <span>${entry.readingTime || '?'} min read</span>
          ${tagsMetaHtml}
          <button type="button" class="entry-edit-pill author-only" data-entry-id="${entry.id}" title="Edit this entry">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
        </div>
        ${coverHtml}
        <h2>${entry.title}</h2>
        ${entry.subtitle ? `<p class="entry-subtitle">${entry.subtitle}</p>` : ''}
        ${songPillHtml}
      </article>
    `;
  }

  function renderFeed() {
    renderFilters();
    const allEntries = Data.loadEntries();
    const mdlMap = Data.getMightDeleteLaterMap(allEntries);
    const entries = Data.getFilteredEntries(activeFilter);

    if (entries.length === 0) {
      dom.feedColumn.innerHTML = `
        <div class="diary-paper-slip empty-state">
          <div class="ribbon-bookmark" aria-hidden="true">
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
              <path d="M0 0 H16 V22 L8 16 L0 22 Z" fill="#537E60"/>
            </svg>
          </div>
          <svg class="empty-state-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
            <line x1="9" y1="17" x2="13" y2="17"/>
          </svg>
          <p class="empty-state-text">Cool beans — nothing written here yet.</p>
        </div>
      `;
      return;
    }

    dom.feedColumn.innerHTML = entries.map(entry => renderEntryCard(entry, mdlMap)).join('');
  }

  function handleFeedClick(e) {
    // Edit entry pill click (Author only)
    const editPill = e.target.closest('.entry-edit-pill');
    if (editPill) {
      e.stopPropagation();
      e.preventDefault();
      const id = editPill.dataset.entryId;
      const entry = Data.getEntry(id);
      if (entry) {
        openEditor(entry);
      }
      return;
    }

    // Song pill click
    const pill = e.target.closest('.song-pill');
    if (pill) {
      e.stopPropagation();
      if (pill.classList.contains('song-pill--note')) {
        return;
      }
      let track = null;
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry && (entry.soundtrack || entry.song_url)) {
          const st = entry.soundtrack || {};
          const songUrl = st.url || entry.song_url;
          track = {
            title: st.title || entry.title || 'Soundtrack',
            artist: st.artist || 'Unknown Artist',
            note: st.note || '',
            url: songUrl
          };
        }
      }
      if (!track && pill.dataset.track) {
        try {
          track = JSON.parse(pill.dataset.track);
        } catch (_) {}
      }
      if (track) {
        toggleTrack(track);
      }
      return;
    }

    // Direct tag badge click from feed -> trigger filter
    const tagBadge = e.target.closest('.entry-tag');
    if (tagBadge && tagBadge.dataset.filterTag) {
      e.stopPropagation();
      const filterKey = tagBadge.dataset.filterTag;
      // Match against Data.TAGS
      const matched = Data.TAGS.find(t => t.toLowerCase() === filterKey || (filterKey.startsWith('might delete later') && t === 'might delete later'));
      if (matched) {
        activeFilter = matched;
        renderFilters();
        renderFeed();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Entry card click
    const card = e.target.closest('.entry-card');
    if (card) {
      const id = card.dataset.entryId;
      openReader(id);
    }
  }

  /* ═══════════════════════════════════════
     CURRENTLY WIDGET
     ═══════════════════════════════════════ */

  function renderCurrently() {
    const status = Data.loadStatus();

    // Determine On Repeat state
    let musicTagText = 'ON REPEAT';
    let musicTitle = 'Where’s My Love';
    let musicArtist = 'SYML';
    let musicDisplay = 'Where’s My Love — SYML';
    let musicUrl = null;
    let isExternalUrl = false;

    // Manual entry from status
    const rawRepeat = status.onRepeat || 'Where’s My Love — SYML';
    musicDisplay = rawRepeat;

    // Check if rawRepeat is a URL (e.g. YouTube Music URL)
    if (/^https?:\/\//i.test(rawRepeat.trim())) {
      isExternalUrl = true;
      musicUrl = rawRepeat.trim();
      if (rawRepeat.includes('music.youtube.com') || rawRepeat.includes('youtube.com')) {
        musicDisplay = 'YouTube Music Track';
      } else {
        try {
          const parsedUrl = new URL(rawRepeat);
          musicDisplay = parsedUrl.hostname;
        } catch (e) {
          musicDisplay = 'External Audio Link';
        }
      }
    } else if (rawRepeat.includes('—') || rawRepeat.includes('-')) {
      const parts = rawRepeat.split(/—|-/).map(s => s.trim());
      musicTitle = parts[0] || rawRepeat;
      musicArtist = parts[1] || 'Unknown';
    } else {
      musicTitle = rawRepeat;
      musicArtist = 'zee’s playlist';
    }

    const linkIconHtml = musicUrl
      ? ` <a href="${musicUrl}" target="_blank" rel="noopener noreferrer" class="currently-link-icon" title="Open track link">${ICONS.externalLink}</a>`
      : '';

    if (dom.currentlyItems) {
      dom.currentlyItems.innerHTML = `
        <div class="currently-row">
          <span class="currently-tag">READING</span>
          <span class="currently-text">${escapeHtml(status.reading || 'The Creative Act — Rick Rubin')}</span>
        </div>
        <div class="currently-row">
          <div class="currently-tag-group">
            <span class="currently-tag">${musicTagText}</span>
            <span class="cassette-badge" title="Cassette tape">${ICONS.cassette}</span>
            <svg class="hand-drawn-arrow" width="22" height="12" viewBox="0 0 28 16" fill="none" aria-hidden="true">
              <path d="M2 13 C 10 14, 18 10, 24 4 M 18 3 L 25 4 L 23 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="currently-text">
            <span class="currently-value-text clickable" id="currently-play"
                  data-title="${escapeHtml(musicTitle)}"
                  data-artist="${escapeHtml(musicArtist)}"
                  data-url="${musicUrl || ''}"
                  data-external="${isExternalUrl ? 'true' : 'false'}"
                  title="${isExternalUrl ? 'Open link in new tab' : 'Play ambient audio'}">
              ${escapeHtml(musicDisplay)}
            </span>${linkIconHtml}
          </div>
        </div>
        <div class="currently-row">
          <span class="currently-tag">CRAFTING</span>
          <span class="currently-text">${escapeHtml(status.crafting || 'Chunky knit pouch with sage yarn')}</span>
        </div>
        <div class="currently-row">
          <span class="currently-tag">DAYDREAMING OF</span>
          <span class="currently-text">${escapeHtml((status && status.daydreaming !== undefined && status.daydreaming !== null) ? status.daydreaming : 'Quiet greenhouse afternoons & sunlit ceramic cups')}</span>
        </div>
        <div class="currently-row">
          <span class="currently-tag">DAILY TALLY</span>
          <span class="currently-text">${escapeHtml(status.dailyTally || '3 cups of genmaicha · 1 completed puzzle · 4,200 steps')}</span>
        </div>
      `;
    }
  }

  /* ═══════════════════════════════════════
     STATUS MODAL
     ═══════════════════════════════════════ */

  function handleEditStatusClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isAuthed = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    if (!isAuthed) {
      openAuthorModal();
      return;
    }
    openStatusModal();
  }

  function openStatusModal() {
    const status = Data.loadStatus();
    if ($('#sm-reading')) $('#sm-reading').value         = status.reading || '';
    if ($('#sm-repeat')) $('#sm-repeat').value          = status.onRepeat || '';
    if ($('#sm-crafting')) $('#sm-crafting').value      = status.crafting || '';
    if ($('#sm-daydreaming')) $('#sm-daydreaming').value = (status && status.daydreaming !== undefined && status.daydreaming !== null) ? status.daydreaming : '';
    if ($('#sm-tally')) $('#sm-tally').value            = status.dailyTally || '';
    dom.statusModal.classList.add('open');
  }

  function closeStatusModal() {
    dom.statusModal.classList.remove('open');
  }

  async function saveStatus() {
    const reading = $('#sm-reading') ? $('#sm-reading').value.trim() : '';
    const onRepeat = $('#sm-repeat') ? $('#sm-repeat').value.trim() : '';
    const crafting = $('#sm-crafting') ? $('#sm-crafting').value.trim() : '';
    const daydreaming = $('#sm-daydreaming') ? $('#sm-daydreaming').value.trim() : '';
    const dailyTally = $('#sm-tally') ? $('#sm-tally').value.trim() : '';

    const newStatus = {
      reading:      reading,
      onRepeat:     onRepeat || 'Where’s My Love — SYML',
      crafting:     crafting,
      daydreaming:  daydreaming,
      dailyTally:   dailyTally
    };

    closeStatusModal();
    renderCurrently();

    try {
      await Data.saveLiveStatus(newStatus);
      showToast('Sidebar status synced to Supabase.');
    } catch (e) {
      console.error('Failed to sync status to Supabase:', e);
      showToast('Error syncing status to Supabase: ' + (e.message || 'Check connection'));
    }
  }

  /* ═══════════════════════════════════════
     READER VIEW
     ═══════════════════════════════════════ */

  function openReader(entryId, updateHash = true) {
    const allEntries = Data.loadEntries();
    const entry = allEntries.find(e => e.id === entryId);
    if (!entry) return;

    const mdlMap = Data.getMightDeleteLaterMap(allEntries);

    let soundtrackHtml = '';
    const st = entry.soundtrack;
    if (st && (st.title || st.artist || st.url || entry.song_url)) {
      const songUrl = st.url || entry.song_url;
      const title = st.title || 'Soundtrack';
      const artist = st.artist || 'Unknown';
      const note = st.note || '';
      const fullTrack = { ...st, url: songUrl, title, artist };
      const isPlaying = isTrackPlaying(fullTrack);

      if (songUrl) {
        const parsed = parseTrackUrl(songUrl);
        const platformName = parsed ? parsed.platform : 'Soundtrack';
        soundtrackHtml = `
          <div class="soundtrack-card">
            <div class="vinyl-art${isPlaying ? ' spinning' : ''}" id="reader-vinyl"></div>
            <div class="soundtrack-info">
              <div class="soundtrack-kicker">
                ${ICONS.cassette}
                <span>SOUNDTRACK FOR THIS ENTRY</span>
              </div>
              <div class="track-title">${escapeHtml(title)}</div>
              <div class="track-artist">${escapeHtml(artist)}</div>
              ${note ? `<div class="track-note">${escapeHtml(note)}</div>` : ''}
              <div class="soundtrack-controls">
                <button class="play-btn" id="reader-play-btn"
                        data-track='${escapeHtml(JSON.stringify(fullTrack))}'
                        aria-label="Play or Pause soundtrack"
                        title="Play soundtrack">
                  ${isPlaying ? ICONS.pause : ICONS.play}
                </button>
                <span class="soundtrack-platform-badge">${escapeHtml(platformName)}</span>
                <a href="${escapeHtml(songUrl)}" target="_blank" rel="noopener noreferrer" class="soundtrack-external-link" title="Open original link">
                  ${ICONS.externalLink}
                </a>
              </div>
            </div>
          </div>
        `;
      } else {
        // Clean non-playable soundtrack note
        soundtrackHtml = `
          <div class="soundtrack-card soundtrack-card--note">
            <div class="vinyl-art" id="reader-vinyl"></div>
            <div class="soundtrack-info">
              <div class="soundtrack-kicker">
                ${ICONS.cassette}
                <span>SOUNDTRACK NOTE</span>
              </div>
              <div class="track-title">${escapeHtml(title)}</div>
              <div class="track-artist">${escapeHtml(artist)}</div>
              ${note ? `<div class="track-note">${escapeHtml(note)}</div>` : ''}
            </div>
          </div>
        `;
      }
    }

    const tagsMetaHtml = (entry.tags || []).map(t =>
      `<span class="dot"></span>` + formatTagBadge(t, entry.id, mdlMap)
    ).join('');

    // Process body — wrap plain text in <p> tags if needed
    let body = entry.body || '';
    if (!body.includes('<p>')) {
      body = body.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n');
    }

    const singleContainer = dom.singleEntryView || dom.readerContent;
    if (singleContainer) {
      singleContainer.dataset.currentEntryId = entry.id;
      singleContainer.innerHTML = `
        <div class="single-entry-topbar">
          <button type="button" class="entry-back-btn" id="single-entry-back-btn" title="Back to entries">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Back</span>
          </button>
          <div class="single-entry-topbar-actions">
            <button type="button" class="reader-edit-btn author-only" id="reader-edit-btn" data-id="${entry.id}" title="Edit this entry">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit</span>
            </button>
            <span style="font-size:12px;color:var(--ink-muted);font-style:italic;">I’ll Try Anything Once</span>
          </div>
        </div>

        <div class="entry-meta">
          <span>${formatDate(entry.date || entry.createdAt)}</span>
          <span class="dot"></span>
          <span>${entry.readingTime || '?'} min read</span>
          ${tagsMetaHtml}
          <button type="button" class="entry-edit-pill author-only" data-entry-id="${entry.id}" title="Edit this entry">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Edit</span>
          </button>
        </div>

        <h1 class="single-entry-title">${entry.title}</h1>
        ${entry.subtitle ? `<p class="single-entry-subtitle">${entry.subtitle}</p>` : ''}

        ${soundtrackHtml}

        <hr class="stitch-divider">

        <div class="reader-body">${body}</div>

        <div class="reader-footer-actions">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <button type="button" class="reader-edit-btn author-only" id="reader-footer-edit-btn" data-id="${entry.id}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit Entry</span>
            </button>
            <span style="font-size:12px;color:var(--ink-muted);font-style:italic;">I’ll Try Anything Once</span>
          </div>
          <button class="reader-delete-btn author-only" id="reader-delete-btn" data-id="${entry.id}">
            Erase from memory?
          </button>
        </div>
      `;
    }

    if (dom.landingView) dom.landingView.style.display = 'none';
    if (dom.singleEntryView) dom.singleEntryView.style.display = 'block';
    readerOpen = true;

    if (updateHash) {
      window.location.hash = 'post-' + entry.id;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Back button
    const backBtn = $('#single-entry-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => closeReader());
    }

    // Edit button inside reader (Author only)
    const readerEditBtn = $('#reader-edit-btn');
    const readerFooterEditBtn = $('#reader-footer-edit-btn');
    const handleReaderEdit = (e) => {
      if (e) e.preventDefault();
      openEditor(entry);
    };
    if (readerEditBtn) readerEditBtn.addEventListener('click', handleReaderEdit);
    if (readerFooterEditBtn) readerFooterEditBtn.addEventListener('click', handleReaderEdit);

    // Delete button inside reader (Author only)
    const deleteBtn = $('#reader-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Erase "${entry.title}" from memory? Numbers in the "might delete later" series will automatically recalculate without gaps.`)) {
          await Data.deleteLivePost(entry.id);
          closeReader();
          await syncAndRenderPosts();
          showToast(`"${entry.title}" erased from memory.`);
        }
      });
    }

    // Reader soundtrack controls
    const readerPlayBtn = $('#reader-play-btn');
    if (readerPlayBtn) {
      readerPlayBtn.addEventListener('click', () => {
        try {
          const track = JSON.parse(readerPlayBtn.dataset.track);
          toggleTrack(track);
          updateReaderPlayState(track);
        } catch (err) {
          console.warn('Reader play button error:', err);
        }
      });
    }
  }

  function updateReaderPlayState(track) {
    const btn = $('#reader-play-btn');
    const vinyl = $('#reader-vinyl');
    if (!btn) return;

    const playing = isTrackPlaying(track);
    btn.innerHTML = playing ? ICONS.pause : ICONS.play;
    if (vinyl) {
      vinyl.classList.toggle('spinning', playing);
    }
  }

  function closeReader(updateHash = true) {
    if (dom.singleEntryView) {
      dom.singleEntryView.style.display = 'none';
      dom.singleEntryView.dataset.currentEntryId = '';
      dom.singleEntryView.innerHTML = '';
    }
    if (dom.landingView) {
      dom.landingView.style.display = 'block';
    }
    readerOpen = false;
    if (dom.progressBar) dom.progressBar.style.width = '0%';

    if (updateHash && window.location.hash.startsWith('#post-')) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }

  function handleHashRouting() {
    const hash = window.location.hash;
    if (hash.startsWith('#post-')) {
      const id = hash.replace('#post-', '');
      const currentId = dom.singleEntryView ? dom.singleEntryView.dataset.currentEntryId : null;
      if (!readerOpen || currentId !== id) {
        openReader(id, false);
      }
    } else {
      if (readerOpen) {
        closeReader(false);
      }
    }
  }

  function updateReadingProgress() {
    if (!readerOpen || !dom.progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) {
      dom.progressBar.style.width = '0%';
      return;
    }
    const pct = Math.min(100, (scrollTop / scrollHeight) * 100);
    dom.progressBar.style.width = pct + '%';
  }

  /* ═══════════════════════════════════════
     SUBSTACK-STYLE WRITING CANVAS & QUICK TAGS
     ═══════════════════════════════════════ */

  let selectedCanvasCategory = null;
  let isCanvasPreviewActive = false;
  let editingPostId = null;

  function getNextMdlNumber() {
    const allEntries = Data.loadEntries();
    const mdlEntries = allEntries.filter(e =>
      e.tags && e.tags.some(t => t.toLowerCase().trim().startsWith('might delete later'))
    );
    const nextNum = mdlEntries.length + 1;
    return String(nextNum).padStart(2, '0');
  }

  function autoGrowTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  function renderCanvasCategoryTabs() {
    if (!dom.canvasCategoryTabs) return;
    const categories = Data.TAGS.filter(t => t !== 'All');
    dom.canvasCategoryTabs.innerHTML = categories.map(cat => {
      const isSelected = selectedCanvasCategory === cat;
      return `<button type="button" class="canvas-category-tab ${isSelected ? 'active' : ''}" data-category="${escapeHtml(cat)}">${escapeHtml(cat)}</button>`;
    }).join('');
    updateCanvasCategoryState();
  }

  function updateCanvasCategoryState() {
    if (!dom.canvasMdlPreview) return;
    if (selectedCanvasCategory === 'might delete later') {
      const nextNum = getNextMdlNumber();
      if (dom.canvasMdlText) {
        dom.canvasMdlText.innerHTML = `Will be published as: <strong>might delete later #${nextNum}</strong>`;
      }
      dom.canvasMdlPreview.style.display = 'flex';
      if (!dom.canvasTitle.value) {
        dom.canvasTitle.placeholder = `e.g. might delete later #${nextNum} (or leave blank to auto-title)`;
      }
    } else {
      dom.canvasMdlPreview.style.display = 'none';
      if (!dom.canvasTitle.value) {
        if (selectedCanvasCategory && ['nocturnal thoughts', 'rants', 'brain dump'].includes(selectedCanvasCategory)) {
          dom.canvasTitle.placeholder = `e.g. ${selectedCanvasCategory} (or leave blank to auto-title)`;
        } else {
          dom.canvasTitle.placeholder = 'Title';
        }
      }
    }
  }

  function toggleSoundtrackStrip(forceOpen) {
    if (!dom.canvasSoundtrackStrip) return;
    const isHidden = dom.canvasSoundtrackStrip.style.display === 'none' || !dom.canvasSoundtrackStrip.style.display;
    const open = forceOpen !== undefined ? forceOpen : isHidden;
    dom.canvasSoundtrackStrip.style.display = open ? 'block' : 'none';
    if (dom.canvasSoundtrackToggle) {
      dom.canvasSoundtrackToggle.classList.toggle('active', open);
    }
    if (open && dom.canvasTrackUrl) {
      dom.canvasTrackUrl.focus();
    }
  }

  function removeSoundtrackStrip() {
    if (dom.canvasTrackUrl) dom.canvasTrackUrl.value = '';
    if (dom.canvasTrackTitle) dom.canvasTrackTitle.value = '';
    if (dom.canvasTrackArtist) dom.canvasTrackArtist.value = '';
    if (dom.canvasTrackNote) dom.canvasTrackNote.value = '';
    if (dom.canvasTrackHint) {
      dom.canvasTrackHint.textContent = 'Auto-fills Song Title and Artist when link is pasted';
      dom.canvasTrackHint.style.color = 'var(--ink-muted)';
    }
    toggleSoundtrackStrip(false);
  }

  /* ── Auto-Fill Song Details via oEmbed / NoEmbed ── */
  async function handleCanvasSongUrlAutoFill() {
    const urlInput = dom.canvasTrackUrl;
    if (!urlInput) return;
    const rawUrl = urlInput.value.trim();
    if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) return;

    const titleInput = dom.canvasTrackTitle;
    const artistInput = dom.canvasTrackArtist;
    if (!titleInput || !artistInput) return;

    if (titleInput.value.trim() && artistInput.value.trim()) return;

    const hintEl = dom.canvasTrackHint;
    const defaultHint = 'Auto-fills Song Title and Artist when link is pasted';
    if (hintEl) {
      hintEl.textContent = 'Fetching song details…';
      hintEl.style.color = 'var(--accent)';
    }

    try {
      let fetched = false;

      // 1. Spotify oEmbed
      if (/open\.spotify\.com\/(?:intl-[a-z]{2,4}\/)?(track|album)/i.test(rawUrl)) {
        try {
          const spotifyRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(rawUrl)}`);
          if (spotifyRes.ok) {
            const data = await spotifyRes.json();
            if (data && data.title) {
              if (!titleInput.value.trim()) titleInput.value = data.title;
              fetched = true;
            }
          }
        } catch (_) {}
      }

      // 2. noembed.com fallback (YouTube, YouTube Music, SoundCloud, Vimeo, etc.)
      if (!fetched) {
        const noembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`);
        if (noembedRes.ok) {
          const data = await noembedRes.json();
          if (data && !data.error) {
            const authorName = (data.author_name || '').trim();
            let rawTitle = (data.title || '').trim();

            rawTitle = rawTitle.replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?(?:Video|Audio|HD|4K|Remaster|Visualizer|Lyric Video)|Music Video|Lyric Video)[\)\]]/gi, '').trim();

            let detectedArtist = authorName;
            let detectedTitle = rawTitle;

            if (rawTitle.includes(' - ')) {
              const parts = rawTitle.split(/\s+-\s+/);
              if (authorName && parts[0].toLowerCase().includes(authorName.toLowerCase())) {
                detectedArtist = authorName;
                detectedTitle = parts.slice(1).join(' - ').trim();
              } else if (parts.length >= 2) {
                detectedArtist = parts[0].trim();
                detectedTitle = parts.slice(1).join(' - ').trim();
              }
            }

            if (!titleInput.value.trim() && detectedTitle) {
              titleInput.value = detectedTitle;
            }
            if (!artistInput.value.trim() && detectedArtist) {
              artistInput.value = detectedArtist;
            }
            fetched = true;
          }
        }
      }

      if (fetched) {
        if (hintEl) {
          hintEl.textContent = 'Auto-filled Song Title & Artist from link';
          hintEl.style.color = 'var(--accent)';
        }
        showToast('Song details auto-filled from link.');
      } else {
        if (hintEl) {
          hintEl.textContent = defaultHint;
          hintEl.style.color = 'var(--ink-muted)';
        }
      }
    } catch (err) {
      console.warn('Song URL auto-fill note:', err);
      if (hintEl) {
        hintEl.textContent = defaultHint;
        hintEl.style.color = 'var(--ink-muted)';
      }
    }
  }

  /* ── Rich-Text Formatting Commands ── */
  function execCanvasCommand(command, value = null) {
    if (isCanvasPreviewActive) return;
    if (!dom.canvasBody) return;
    dom.canvasBody.focus();
    document.execCommand(command, false, value);
  }

  function handleCanvasCode() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    dom.canvasBody.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    let parent = sel.anchorNode;
    while (parent && parent !== dom.canvasBody) {
      if (parent.nodeName === 'CODE') {
        const textNode = document.createTextNode(parent.textContent);
        parent.parentNode.replaceChild(textNode, parent);
        return;
      }
      parent = parent.parentNode;
    }

    const selectedText = range.toString();
    if (!selectedText) {
      const codeEl = document.createElement('code');
      codeEl.textContent = 'code';
      range.insertNode(codeEl);
      return;
    }

    const codeEl = document.createElement('code');
    codeEl.textContent = selectedText;
    range.deleteContents();
    range.insertNode(codeEl);
  }

  function handleCanvasHighlight() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    dom.canvasBody.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    let parent = sel.anchorNode;
    while (parent && parent !== dom.canvasBody) {
      if (parent.nodeName === 'MARK' || (parent.classList && parent.classList.contains('matcha-highlight'))) {
        const textNode = document.createTextNode(parent.textContent);
        parent.parentNode.replaceChild(textNode, parent);
        return;
      }
      parent = parent.parentNode;
    }

    const text = range.toString();
    if (!text) return;

    const mark = document.createElement('mark');
    mark.className = 'matcha-highlight';
    mark.textContent = text;
    range.deleteContents();
    range.insertNode(mark);
  }

  function handleCanvasLink() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    const url = prompt('Enter link URL (https://…):');
    if (!url) return;
    const cleanUrl = /^https?:\/\//i.test(url.trim()) ? url.trim() : 'https://' + url.trim();
    execCanvasCommand('createLink', cleanUrl);
  }

  function handleCanvasStickyNote() {
    if (isCanvasPreviewActive || !dom.canvasBody) return;
    dom.canvasBody.focus();
    const sel = window.getSelection();
    let range = (sel && sel.rangeCount > 0) ? sel.getRangeAt(0) : null;

    if (!range || !dom.canvasBody.contains(range.commonAncestorContainer)) {
      range = document.createRange();
      range.selectNodeContents(dom.canvasBody);
      range.collapse(false);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    // Prevent nesting inside another sticky note
    let parent = range.commonAncestorContainer;
    while (parent && parent !== dom.canvasBody) {
      if (parent.classList && parent.classList.contains('diary-sticky-note')) {
        return;
      }
      parent = parent.parentNode;
    }

    const selectedText = range.toString().trim();
    const noteText = selectedText || 'side note: small things keeping me sane today…';

    const aside = document.createElement('aside');
    aside.className = 'diary-sticky-note';
    aside.innerHTML = `<button type="button" class="sticky-note-del-btn" title="Remove sticky note" contenteditable="false" aria-label="Remove sticky note">×</button><p>${escapeHtml(noteText)}</p>`;

    range.deleteContents();
    range.insertNode(aside);

    // Ensure a paragraph follows the sticky note for continued typing
    const nextNode = aside.nextSibling;
    if (!nextNode || (nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim())) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (nextNode) {
        aside.parentNode.insertBefore(p, nextNode);
      } else {
        aside.parentNode.appendChild(p);
      }
    }

    // Place selection inside the sticky note
    const p = aside.querySelector('p');
    if (p && sel) {
      const newRange = document.createRange();
      newRange.selectNodeContents(p);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
    }
  }

  function ensureStickyNoteEditorControls(container) {
    if (!container) return;
    container.querySelectorAll('.diary-sticky-note').forEach(note => {
      if (!note.querySelector('.sticky-note-del-btn')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'sticky-note-del-btn';
        btn.title = 'Remove sticky note';
        btn.setAttribute('contenteditable', 'false');
        btn.setAttribute('aria-label', 'Remove sticky note');
        btn.textContent = '×';
        note.insertBefore(btn, note.firstChild);
      }
    });
  }

  function getCleanCanvasBodyHtml() {
    if (!dom.canvasBody) return '';
    const clone = dom.canvasBody.cloneNode(true);
    clone.querySelectorAll('.sticky-note-del-btn').forEach(btn => btn.remove());
    return clone.innerHTML.trim();
  }

  function calcReadingMinutes(html) {
    const text = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    return Math.max(1, Math.round(wordCount / 200));
  }

  function toggleCanvasPreview() {
    if (!dom.canvasPreviewArea || !dom.canvasEditArea) return;
    isCanvasPreviewActive = !isCanvasPreviewActive;

    if (isCanvasPreviewActive) {
      dom.canvasPreviewBtn.textContent = 'Edit';
      dom.canvasPreviewBtn.classList.add('active');
      dom.canvasEditArea.style.display = 'none';
      dom.canvasPreviewArea.style.display = 'block';

      const cat = selectedCanvasCategory;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      let catLabel = '';
      if (cat) {
        if (cat === 'might delete later') {
          catLabel = `<span class="reader-category-label">— might delete later #${getNextMdlNumber()}</span> · `;
        } else {
          catLabel = `<span class="reader-category-label">— ${escapeHtml(cat)}</span> · `;
        }
      }
      const htmlBody = getCleanCanvasBodyHtml();
      const readingTime = calcReadingMinutes(htmlBody);

      if (dom.canvasPreviewMeta) {
        dom.canvasPreviewMeta.innerHTML = `${catLabel}<span>${dateStr}</span> · <span>${readingTime} min read</span>`;
      }

      let pTitle = dom.canvasTitle ? dom.canvasTitle.value.trim() : '';
      if (!pTitle && cat) {
        if (cat === 'might delete later') {
          pTitle = `might delete later #${getNextMdlNumber()}`;
        } else if (['nocturnal thoughts', 'rants', 'brain dump'].includes(cat)) {
          const mDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          pTitle = `${cat} — ${mDay}`;
        }
      }
      if (dom.canvasPreviewTitle) {
        dom.canvasPreviewTitle.textContent = pTitle || 'Untitled Entry';
      }

      const pSub = dom.canvasSubtitle ? dom.canvasSubtitle.value.trim() : '';
      if (dom.canvasPreviewSubtitle) {
        dom.canvasPreviewSubtitle.textContent = pSub;
        dom.canvasPreviewSubtitle.style.display = pSub ? 'block' : 'none';
      }

      if (dom.canvasPreviewSoundtrack) {
        const tTitle = dom.canvasTrackTitle ? dom.canvasTrackTitle.value.trim() : '';
        const tArtist = dom.canvasTrackArtist ? dom.canvasTrackArtist.value.trim() : '';
        const tUrl = dom.canvasTrackUrl ? dom.canvasTrackUrl.value.trim() : '';
        const tNote = dom.canvasTrackNote ? dom.canvasTrackNote.value.trim() : '';

        if (tTitle || tUrl) {
          dom.canvasPreviewSoundtrack.innerHTML = `
            <div class="song-pill song-pill--preview" style="cursor:default;">
              <span class="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </span>
              <span class="pill-title">${escapeHtml(tTitle || 'Soundtrack')}</span>
              ${tArtist ? `<span class="pill-artist">— ${escapeHtml(tArtist)}</span>` : ''}
              ${tNote ? `<span class="pill-note" style="opacity:0.75; font-size:11px; margin-left:4px;">(${escapeHtml(tNote)})</span>` : ''}
            </div>
          `;
          dom.canvasPreviewSoundtrack.style.display = 'block';
        } else {
          dom.canvasPreviewSoundtrack.style.display = 'none';
        }
      }

      if (dom.canvasPreviewBody) {
        dom.canvasPreviewBody.innerHTML = htmlBody || '<p style="color:var(--ink-muted); font-style:italic;">No writing yet…</p>';
      }

      if (dom.canvasScrollBody) dom.canvasScrollBody.scrollTop = 0;
    } else {
      dom.canvasPreviewBtn.textContent = 'Preview';
      dom.canvasPreviewBtn.classList.remove('active');
      dom.canvasEditArea.style.display = 'block';
      dom.canvasPreviewArea.style.display = 'none';
      if (dom.canvasBody) dom.canvasBody.focus();
    }
  }

  function openEditor(entryToEdit = null) {
    editingPostId = entryToEdit ? entryToEdit.id : null;
    isCanvasPreviewActive = false;

    if (entryToEdit) {
      // Edit mode: pre-fill fields
      if (dom.canvasTitle) {
        dom.canvasTitle.value = entryToEdit.title || '';
        dom.canvasTitle.placeholder = 'Title';
        autoGrowTextarea(dom.canvasTitle);
      }
      if (dom.canvasSubtitle) {
        dom.canvasSubtitle.value = entryToEdit.subtitle || '';
        dom.canvasSubtitle.placeholder = 'Add a subtitle...';
        autoGrowTextarea(dom.canvasSubtitle);
      }
      if (dom.canvasBody) {
        dom.canvasBody.innerHTML = entryToEdit.body || entryToEdit.content || '';
        ensureStickyNoteEditorControls(dom.canvasBody);
      }

      // Pre-select category tag
      const existingTag = (entryToEdit.tags && entryToEdit.tags[0]) || entryToEdit.tag || null;
      selectedCanvasCategory = existingTag;

      // Pre-fill soundtrack
      const st = entryToEdit.soundtrack || {};
      const songUrl = entryToEdit.song_url || st.url || '';
      if (songUrl || st.title || entryToEdit.song_title) {
        if (dom.canvasTrackUrl) dom.canvasTrackUrl.value = songUrl;
        if (dom.canvasTrackTitle) dom.canvasTrackTitle.value = st.title || entryToEdit.song_title || '';
        if (dom.canvasTrackArtist) dom.canvasTrackArtist.value = st.artist || entryToEdit.song_artist || '';
        if (dom.canvasTrackNote) dom.canvasTrackNote.value = st.note || entryToEdit.song_note || '';
        toggleSoundtrackStrip(true);
      } else {
        removeSoundtrackStrip();
      }

      const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
      if (publishBtnSpan) publishBtnSpan.textContent = 'Save Changes';
    } else {
      // New entry mode
      selectedCanvasCategory = null;

      if (dom.canvasTitle) {
        dom.canvasTitle.value = '';
        dom.canvasTitle.placeholder = 'Title';
        dom.canvasTitle.style.height = 'auto';
      }
      if (dom.canvasSubtitle) {
        dom.canvasSubtitle.value = '';
        dom.canvasSubtitle.placeholder = 'Add a subtitle...';
        dom.canvasSubtitle.style.height = 'auto';
      }
      if (dom.canvasBody) {
        dom.canvasBody.innerHTML = '';
      }

      removeSoundtrackStrip();

      const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
      if (publishBtnSpan) publishBtnSpan.textContent = 'Publish';
    }

    if (dom.canvasPreviewBtn) {
      dom.canvasPreviewBtn.textContent = 'Preview';
      dom.canvasPreviewBtn.classList.remove('active');
    }
    if (dom.canvasEditArea) dom.canvasEditArea.style.display = 'block';
    if (dom.canvasPreviewArea) dom.canvasPreviewArea.style.display = 'none';

    renderCanvasCategoryTabs();

    dom.editorOverlay.classList.add('open');
    editorOpen = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (entryToEdit && dom.canvasBody) {
        dom.canvasBody.focus();
      } else if (dom.canvasTitle) {
        dom.canvasTitle.focus();
      }
    }, 200);
  }

  function closeEditor() {
    dom.editorOverlay.classList.remove('open');
    editorOpen = false;
    editingPostId = null;
    document.body.style.overflow = '';
    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
    if (publishBtnSpan) publishBtnSpan.textContent = 'Publish';
  }

  function handleCanvasPublish() {
    let title = dom.canvasTitle ? dom.canvasTitle.value.trim() : '';

    // Smart Blank-Title Fallback
    if (!title) {
      const now = new Date();
      const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (selectedCanvasCategory === 'might delete later') {
        const nextNum = getNextMdlNumber();
        title = `might delete later #${nextNum}`;
      } else if (selectedCanvasCategory === 'nocturnal thoughts') {
        title = `nocturnal thoughts — ${monthDay}`;
      } else if (selectedCanvasCategory === 'rants') {
        title = `rants — ${monthDay}`;
      } else if (selectedCanvasCategory === 'brain dump') {
        title = `brain dump — ${monthDay}`;
      } else {
        alert('Please enter a title, or pick a Quick Tag (might delete later, nocturnal thoughts, rants, brain dump) for an automatic editorial title.');
        if (isCanvasPreviewActive) toggleCanvasPreview();
        if (dom.canvasTitle) dom.canvasTitle.focus();
        return;
      }
    }

    const tags = selectedCanvasCategory ? [selectedCanvasCategory] : [];

    let soundtrack = null;
    const trackTitle = dom.canvasTrackTitle ? dom.canvasTrackTitle.value.trim() : '';
    const trackArtist = dom.canvasTrackArtist ? dom.canvasTrackArtist.value.trim() : '';
    const trackNote = dom.canvasTrackNote ? dom.canvasTrackNote.value.trim() : '';
    const trackUrl = dom.canvasTrackUrl ? dom.canvasTrackUrl.value.trim() : '';
    if (trackTitle || trackUrl) {
      soundtrack = {
        title: trackTitle || 'Soundtrack',
        artist: trackArtist || 'Unknown Artist',
        note: trackNote || '',
        url: trackUrl || null
      };
    }

    let rawBody = getCleanCanvasBodyHtml();
    if (!rawBody || rawBody === '<br>') {
      alert('Please write something in your entry before publishing.');
      if (isCanvasPreviewActive) toggleCanvasPreview();
      if (dom.canvasBody) dom.canvasBody.focus();
      return;
    }

    // Wrap plain lines in <p> if missing block markup
    if (!/<(p|h2|h3|blockquote|ul|ol|figure|div|aside)/i.test(rawBody)) {
      rawBody = rawBody.split(/\n{2,}/).map(para => `<p>${para.trim()}</p>`).join('\n\n');
    }

    const readingTime = calcReadingMinutes(rawBody);
    const gradients = Data.coverGradients;
    const coverGradient = gradients[Math.floor(Math.random() * gradients.length)];
    const dateVal = new Date().toISOString().slice(0, 10);

    const entry = {
      title,
      subtitle: dom.canvasSubtitle ? dom.canvasSubtitle.value.trim() : '',
      date: dateVal,
      tags,
      soundtrack,
      song_url: trackUrl || null,
      body: rawBody,
      coverGradient,
      readingTime: readingTime,
      reading_time: readingTime
    };

    const isEdit = Boolean(editingPostId);
    const targetId = editingPostId;

    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
    if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = true;
    if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Saving…' : 'Publishing…';

    const savePromise = isEdit
      ? Data.updateLivePost(targetId, entry)
      : Data.insertLivePost(entry);

    savePromise.then(() => {
      closeEditor();
      syncAndRenderPosts();
      if (isEdit && readerOpen && dom.singleEntryView && dom.singleEntryView.style.display !== 'none') {
        openReader(targetId, false);
      }
      showToast(isEdit ? 'Entry updated in Supabase!' : 'Entry published live to Supabase!');
    }).catch(err => {
      console.error('Save error:', err);
      if (!err || !err._alerted) {
        alert('Supabase Save Error: ' + (err && err.message ? err.message : 'Failed to save entry.'));
      }
    }).finally(() => {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = false;
      if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Save Changes' : 'Publish';
    });
  }

  /* ═══════════════════════════════════════
     REAL SONG SOUNDTRACK PLAYER (AUDIO-ONLY)
     ═══════════════════════════════════════ */

  let ytAudioPlayer = null;
  let ytApiReady = false;
  let isYtAudioPlaying = false;
  let ytPollTimer = null;
  let currentYtVideoId = null;

  // Global YouTube IFrame API callback
  window.onYouTubeIframeAPIReady = function() {
    ytApiReady = true;
    if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube' && currentTrack.parsed.id) {
      initYtPlayer(currentTrack.parsed.id);
    } else {
      prewarmYtPlayer();
    }
  };

  // Listen for iframe postMessages (handles time updates & state changes seamlessly)
  window.addEventListener('message', (event) => {
    if (typeof event.data !== 'string') return;
    try {
      const data = JSON.parse(event.data);
      if (data.event === 'onStateChange') {
        handleYtState(data.info);
      } else if (data.event === 'infoDelivery' && data.info) {
        if (typeof data.info.currentTime === 'number') {
          const cur = data.info.currentTime;
          if (dom.audioTimeCurrent) dom.audioTimeCurrent.textContent = formatAudioTime(cur);
          if (dom.audioScrubber && !dom.audioScrubber._dragging) {
            dom.audioScrubber.value = cur;
          }
        }
        if (typeof data.info.duration === 'number' && data.info.duration > 0) {
          const dur = data.info.duration;
          if (dom.audioTimeTotal) dom.audioTimeTotal.textContent = formatAudioTime(dur);
          if (dom.audioScrubber) dom.audioScrubber.max = dur;
        }
        if (typeof data.info.playerState === 'number') {
          handleYtState(data.info.playerState);
        }
      }
    } catch (_) {}
  });

  function handleYtState(state) {
    // 1 = playing, 2 = paused, 0 = ended, 3 = buffering, 5 = cued, -1 = unstarted
    if (state === 1) {
      isYtAudioPlaying = true;
      if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
      if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
      startYtProgressPolling();
      updateAllSoundtrackPills();
    } else if (state === 2 || state === 0 || state === 5 || state === -1) {
      isYtAudioPlaying = false;
      if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
      if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
      if (state !== 3) stopYtProgressPolling();
      if (state === 0) {
        if (dom.audioScrubber) dom.audioScrubber.value = 0;
        if (dom.audioTimeCurrent) dom.audioTimeCurrent.textContent = '0:00';
      }
      updateAllSoundtrackPills();
    } else if (state === 3) {
      // Buffering
      if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
    }
  }

  function handleYtStateChange(event) {
    if (event && typeof event.data !== 'undefined') {
      handleYtState(event.data);
    }
  }

  function postYtCommand(command, args = []) {
    if (ytAudioPlayer && typeof ytAudioPlayer[command] === 'function') {
      try {
        ytAudioPlayer[command](...args);
        return;
      } catch (_) {}
    }
    const iframe = dom.ytAudioHolder ? dom.ytAudioHolder.querySelector('iframe') : null;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: command,
          args: args
        }), '*');
      } catch (_) {}
    }
  }

  function startYtProgressPolling() {
    stopYtProgressPolling();
    ytPollTimer = setInterval(() => {
      if (!ytAudioPlayer || typeof ytAudioPlayer.getCurrentTime !== 'function') return;
      try {
        const cur = ytAudioPlayer.getCurrentTime() || 0;
        const dur = ytAudioPlayer.getDuration() || 0;
        if (dur > 0) {
          if (dom.audioTimeTotal) dom.audioTimeTotal.textContent = formatAudioTime(dur);
          if (dom.audioScrubber && !dom.audioScrubber._dragging) {
            dom.audioScrubber.max = dur;
            dom.audioScrubber.value = cur;
          }
        }
        if (dom.audioTimeCurrent) dom.audioTimeCurrent.textContent = formatAudioTime(cur);
      } catch (_) {}
    }, 400);
  }

  function stopYtProgressPolling() {
    if (ytPollTimer) {
      clearInterval(ytPollTimer);
      ytPollTimer = null;
    }
  }

  function stopYtAudio() {
    stopYtProgressPolling();
    isYtAudioPlaying = false;
    currentYtVideoId = null;
    postYtCommand('pauseVideo');
  }

  function prewarmYtPlayer() {
    if (ytAudioPlayer || !window.YT || !window.YT.Player) return;
    if (!dom.ytAudioHolder) return;

    dom.ytAudioHolder.style.cssText = 'position:fixed!important;bottom:0!important;right:0!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;border:0!important;z-index:-1!important;overflow:hidden!important;';

    let targetEl = document.getElementById('yt-player-target');
    if (!targetEl) {
      dom.ytAudioHolder.innerHTML = '<div id="yt-player-target"></div>';
      targetEl = document.getElementById('yt-player-target');
    }

    try {
      ytAudioPlayer = new YT.Player('yt-player-target', {
        height: '1',
        width: '1',
        videoId: '1-W6whvn8Bs', // Lightweight initial video
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            ytApiReady = true;
            const iframe = dom.ytAudioHolder ? dom.ytAudioHolder.querySelector('iframe') : null;
            if (iframe) {
              iframe.setAttribute('allow', 'autoplay; encrypted-media');
              iframe.style.cssText = 'position:fixed!important;bottom:0!important;right:0!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;border:0!important;z-index:-1!important;';
            }
          },
          onStateChange: handleYtStateChange,
          onAutoplayBlocked: () => {
            isYtAudioPlaying = false;
            if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
            if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
            updateAllSoundtrackPills();
          },
          onError: (err) => {
            console.warn('Prewarmed YouTube notice:', err);
          }
        }
      });
    } catch (e) {
      console.warn('Prewarming YT player error:', e);
    }
  }

  function loadYtAudio(videoId) {
    currentYtVideoId = videoId;
    if (dom.audioTimeCurrent) dom.audioTimeCurrent.textContent = '0:00';
    if (dom.audioTimeTotal) dom.audioTimeTotal.textContent = '0:00';
    if (dom.audioScrubber) {
      dom.audioScrubber.value = 0;
      dom.audioScrubber.max = 100;
    }
    if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');

    if (ytAudioPlayer && typeof ytAudioPlayer.loadVideoById === 'function') {
      try {
        ytAudioPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: 0
        });
        ytAudioPlayer.playVideo();
        if (dom.miniVolume) {
          ytAudioPlayer.setVolume(Number(dom.miniVolume.value));
        }
        return;
      } catch (e) {
        console.warn('Error loading video in existing YT player:', e);
      }
    }

    initYtPlayer(videoId);
  }

  function initYtPlayer(videoId) {
    if (!dom.ytAudioHolder) return;
    dom.ytAudioHolder.style.cssText = 'position:fixed!important;bottom:0!important;right:0!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;border:0!important;z-index:-1!important;overflow:hidden!important;';
    dom.ytAudioHolder.innerHTML = '<div id="yt-player-target"></div>';

    if (window.YT && window.YT.Player) {
      try {
        ytAudioPlayer = new YT.Player('yt-player-target', {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: (event) => {
              const iframe = dom.ytAudioHolder ? dom.ytAudioHolder.querySelector('iframe') : null;
              if (iframe) {
                iframe.setAttribute('allow', 'autoplay; encrypted-media');
                iframe.style.cssText = 'position:fixed!important;bottom:0!important;right:0!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;border:0!important;z-index:-1!important;';
              }
              try {
                event.target.playVideo();
                if (dom.miniVolume) {
                  event.target.setVolume(Number(dom.miniVolume.value));
                }
              } catch (_) {}
            },
            onStateChange: handleYtStateChange,
            onAutoplayBlocked: () => {
              isYtAudioPlaying = false;
              if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
              if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
              updateAllSoundtrackPills();
            },
            onError: (err) => {
              console.warn('YouTube Player notice/error:', err);
            }
          }
        });
        return;
      } catch (err) {
        console.warn('Failed to initialize YT.Player, falling back to direct iframe:', err);
      }
    }

    // Direct fallback iframe with enablejsapi=1 in hidden holder
    const fallbackSrc = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&enablejsapi=1&controls=0&playsinline=1&origin=${encodeURIComponent(window.location.origin)}`;
    dom.ytAudioHolder.innerHTML = `<iframe id="yt-player-target" width="1" height="1" src="${fallbackSrc}" frameborder="0" allow="autoplay; encrypted-media" style="position:fixed!important;bottom:0!important;right:0!important;width:1px!important;height:1px!important;opacity:0.001!important;pointer-events:none!important;border:0!important;z-index:-1!important;"></iframe>`;
  }

  function isTrackPlaying(soundtrack) {
    if (!currentTrack || !soundtrack) return false;
    const urlA = currentTrack.url || '';
    const urlB = soundtrack.url || '';
    if (urlA && urlB && urlA === urlB) {
      if (currentTrack.parsed) {
        if (currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
          return !dom.directAudioEl.paused;
        }
        if (currentTrack.parsed.type === 'youtube') {
          if (ytAudioPlayer && typeof ytAudioPlayer.getPlayerState === 'function') {
            try {
              return ytAudioPlayer.getPlayerState() === 1;
            } catch (_) {}
          }
          return isYtAudioPlaying;
        }
      }
      return isYtAudioPlaying;
    }
    if (currentTrack.title && soundtrack.title && currentTrack.title === soundtrack.title) {
      return (currentTrack.artist || '') === (soundtrack.artist || '') && isYtAudioPlaying;
    }
    return false;
  }

  function playTrack(soundtrack) {
    if (!soundtrack) return;
    const songUrl = soundtrack.url || '';
    if (!songUrl) {
      showToast('No audio link attached to this soundtrack note.');
      return;
    }

    // Toggle if same track already active
    if (currentTrack && currentTrack.url === songUrl) {
      if (currentTrack.parsed && currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
        if (!dom.directAudioEl.paused) {
          dom.directAudioEl.pause();
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        } else {
          dom.directAudioEl.play().catch(() => {});
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
        }
        updateAllSoundtrackPills();
        return;
      } else if (currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
        let isActuallyPlaying = isYtAudioPlaying;
        if (ytAudioPlayer && typeof ytAudioPlayer.getPlayerState === 'function') {
          try {
            isActuallyPlaying = (ytAudioPlayer.getPlayerState() === 1);
          } catch (_) {}
        }
        if (isActuallyPlaying) {
          postYtCommand('pauseVideo');
          isYtAudioPlaying = false;
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        } else {
          postYtCommand('playVideo');
          isYtAudioPlaying = true;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
        }
        updateAllSoundtrackPills();
        return;
      } else {
        // Toggle off for other embed track
        stopTrack();
        return;
      }
    }

    const parsed = parseTrackUrl(songUrl);
    if (!parsed) {
      showToast('Could not parse audio link.');
      return;
    }

    currentTrack = {
      title: soundtrack.title || 'Soundtrack',
      artist: soundtrack.artist || 'Unknown Artist',
      note: soundtrack.note || '',
      url: songUrl,
      parsed: parsed
    };

    // Update Header Info
    if (dom.miniTitle) dom.miniTitle.textContent = currentTrack.title;
    if (dom.miniArtist) dom.miniArtist.textContent = currentTrack.artist;
    if (dom.miniSourceBadge) dom.miniSourceBadge.textContent = parsed.platform;

    // Direct Audio vs YouTube (Audio-Only) vs Iframe Player (Spotify/SoundCloud)
    if (parsed.type === 'audio') {
      stopYtAudio();
      if (dom.embedIframeBox) {
        dom.embedIframeBox.innerHTML = '';
        dom.embedIframeBox.style.display = 'none';
      }
      if (dom.directAudioBox) dom.directAudioBox.style.display = 'flex';

      if (dom.directAudioEl) {
        dom.directAudioEl.src = parsed.url;
        dom.directAudioEl.volume = dom.miniVolume ? (dom.miniVolume.value / 100) : 0.8;
        dom.directAudioEl.play().then(() => {
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
        }).catch(err => {
          console.warn('Direct audio play failed:', err);
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        });
      }
    } else if (parsed.type === 'youtube') {
      // Audio-only mode: NO video frame or thumbnail is ever displayed
      if (dom.directAudioEl) {
        dom.directAudioEl.pause();
        dom.directAudioEl.src = '';
      }
      if (dom.embedIframeBox) {
        dom.embedIframeBox.innerHTML = '';
        dom.embedIframeBox.style.display = 'none';
      }
      if (dom.directAudioBox) dom.directAudioBox.style.display = 'flex';

      loadYtAudio(parsed.id);
    } else {
      // External audio embeds (e.g. Spotify 80px audio player or SoundCloud)
      stopYtAudio();
      if (dom.directAudioEl) {
        dom.directAudioEl.pause();
        dom.directAudioEl.src = '';
      }
      if (dom.directAudioBox) dom.directAudioBox.style.display = 'none';
      if (dom.embedIframeBox) dom.embedIframeBox.style.display = 'block';

      let iframeHtml = '';
      if (parsed.type === 'spotify') {
        iframeHtml = `<iframe style="border-radius:12px;border:0;display:block;" src="${escapeHtml(parsed.embedUrl)}" width="100%" height="80" frameborder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
      } else if (parsed.type === 'soundcloud') {
        iframeHtml = `<iframe width="100%" height="120" scrolling="no" frameborder="no" allow="autoplay" style="border-radius:12px;border:0;display:block;" src="${escapeHtml(parsed.embedUrl)}"></iframe>`;
      } else {
        iframeHtml = `<iframe width="100%" height="120" style="border-radius:12px;border:1px solid var(--border);display:block;" src="${escapeHtml(parsed.embedUrl)}" allow="autoplay"></iframe>`;
      }

      if (dom.embedIframeBox) {
        dom.embedIframeBox.innerHTML = iframeHtml;
      }

      if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
    }

    if (dom.miniPlayer) dom.miniPlayer.classList.add('visible');
    updateAllSoundtrackPills();
  }

  function stopTrack() {
    stopYtAudio();
    if (dom.directAudioEl) {
      dom.directAudioEl.pause();
      dom.directAudioEl.src = '';
    }
    if (dom.embedIframeBox) {
      dom.embedIframeBox.innerHTML = '';
      dom.embedIframeBox.style.display = 'none';
    }
    if (dom.directAudioBox) {
      dom.directAudioBox.style.display = 'none';
    }
    if (dom.miniPlayer) dom.miniPlayer.classList.remove('visible');
    if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
    if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
    currentTrack = null;
    updateAllSoundtrackPills();
  }

  function toggleTrack(soundtrack) {
    if (isTrackPlaying(soundtrack)) {
      if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
        let isActuallyPlaying = isYtAudioPlaying;
        if (ytAudioPlayer && typeof ytAudioPlayer.getPlayerState === 'function') {
          try {
            isActuallyPlaying = (ytAudioPlayer.getPlayerState() === 1);
          } catch (_) {}
        }
        if (isActuallyPlaying) {
          postYtCommand('pauseVideo');
          isYtAudioPlaying = false;
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
          updateAllSoundtrackPills();
          return;
        }
      }
      if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
        dom.directAudioEl.pause();
        if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
        updateAllSoundtrackPills();
        return;
      }
      stopTrack();
    } else {
      if (currentTrack && currentTrack.url === (soundtrack.url || '')) {
        if (currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
          postYtCommand('playVideo');
          isYtAudioPlaying = true;
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          updateAllSoundtrackPills();
          return;
        }
        if (currentTrack.parsed && currentTrack.parsed.type === 'audio' && dom.directAudioEl) {
          dom.directAudioEl.play().catch(() => {});
          if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          updateAllSoundtrackPills();
          return;
        }
      }
      playTrack(soundtrack);
    }
  }

  function updateAllSoundtrackPills() {
    // Update feed pills
    $$('.song-pill').forEach(pill => {
      let isPlaying = false;
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry) {
          const st = entry.soundtrack || {};
          const songUrl = st.url || entry.song_url;
          isPlaying = isTrackPlaying({ ...st, url: songUrl });
        }
      } else if (pill.dataset.track) {
        try {
          const t = JSON.parse(pill.dataset.track);
          isPlaying = isTrackPlaying(t);
        } catch (_) {}
      }
      pill.classList.toggle('playing', isPlaying);
      const iconSpan = pill.querySelector('.pill-icon');
      if (iconSpan) {
        iconSpan.innerHTML = isPlaying ? ICONS.waveform : ICONS.cassette;
      }
    });

    // Update reader controls if reader open
    const readerPlayBtn = $('#reader-play-btn');
    const readerVinyl = $('#reader-vinyl');
    if (readerPlayBtn) {
      let active = false;
      if (readerPlayBtn.dataset.track) {
        try {
          const t = JSON.parse(readerPlayBtn.dataset.track);
          active = isTrackPlaying(t);
        } catch (_) {}
      }
      readerPlayBtn.innerHTML = active ? ICONS.pause : ICONS.play;
      if (readerVinyl) readerVinyl.classList.toggle('spinning', active);
    }
  }

  function initDirectAudioEvents() {
    if (dom.directAudioEl) {
      dom.directAudioEl.addEventListener('loadedmetadata', () => {
        if (dom.audioTimeTotal) {
          dom.audioTimeTotal.textContent = formatAudioTime(dom.directAudioEl.duration);
        }
        if (dom.audioScrubber) {
          dom.audioScrubber.max = dom.directAudioEl.duration || 100;
          dom.audioScrubber.value = 0;
        }
      });

      dom.directAudioEl.addEventListener('timeupdate', () => {
        if (dom.audioTimeCurrent) {
          dom.audioTimeCurrent.textContent = formatAudioTime(dom.directAudioEl.currentTime);
        }
        if (dom.audioScrubber && !dom.audioScrubber._dragging) {
          dom.audioScrubber.value = dom.directAudioEl.currentTime;
        }
      });

      dom.directAudioEl.addEventListener('ended', () => {
        if (dom.directPlayBtn) dom.directPlayBtn.innerHTML = ICONS.play;
        if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
        updateAllSoundtrackPills();
      });
    }

    if (dom.directPlayBtn) {
      dom.directPlayBtn.addEventListener('click', () => {
        if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
          let isActuallyPlaying = isYtAudioPlaying;
          if (ytAudioPlayer && typeof ytAudioPlayer.getPlayerState === 'function') {
            try {
              isActuallyPlaying = (ytAudioPlayer.getPlayerState() === 1);
            } catch (_) {}
          }
          if (isActuallyPlaying) {
            postYtCommand('pauseVideo');
            isYtAudioPlaying = false;
            dom.directPlayBtn.innerHTML = ICONS.play;
            if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
          } else {
            postYtCommand('playVideo');
            isYtAudioPlaying = true;
            dom.directPlayBtn.innerHTML = ICONS.pause;
            if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
          }
          updateAllSoundtrackPills();
          return;
        }

        if (!dom.directAudioEl) return;
        if (dom.directAudioEl.paused) {
          dom.directAudioEl.play().catch(() => {});
          dom.directPlayBtn.innerHTML = ICONS.pause;
          if (dom.miniVinyl) dom.miniVinyl.classList.add('spinning');
        } else {
          dom.directAudioEl.pause();
          dom.directPlayBtn.innerHTML = ICONS.play;
          if (dom.miniVinyl) dom.miniVinyl.classList.remove('spinning');
        }
        updateAllSoundtrackPills();
      });
    }

    if (dom.audioScrubber) {
      dom.audioScrubber.addEventListener('mousedown', () => { dom.audioScrubber._dragging = true; });
      dom.audioScrubber.addEventListener('touchstart', () => { dom.audioScrubber._dragging = true; }, { passive: true });
      dom.audioScrubber.addEventListener('mouseup', () => { dom.audioScrubber._dragging = false; });
      dom.audioScrubber.addEventListener('touchend', () => { dom.audioScrubber._dragging = false; });
      dom.audioScrubber.addEventListener('input', (e) => {
        const val = Number(e.target.value);
        if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
          postYtCommand('seekTo', [val, true]);
          if (dom.audioTimeCurrent) dom.audioTimeCurrent.textContent = formatAudioTime(val);
        } else if (dom.directAudioEl) {
          dom.directAudioEl.currentTime = val;
        }
      });
      dom.audioScrubber.addEventListener('change', (e) => {
        dom.audioScrubber._dragging = false;
        const val = Number(e.target.value);
        if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
          postYtCommand('seekTo', [val, true]);
        } else if (dom.directAudioEl) {
          dom.directAudioEl.currentTime = val;
        }
      });
    }

    if (dom.miniVolume) {
      dom.miniVolume.addEventListener('input', (e) => {
        const volVal = Number(e.target.value);
        if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
          postYtCommand('setVolume', [volVal]);
        }
        if (dom.directAudioEl) {
          dom.directAudioEl.volume = volVal / 100;
        }
      });
    }
  }

  function initCanvasEvents() {
    // Write Entry button opens canvas
    if (dom.writeBtn) {
      dom.writeBtn.addEventListener('click', openEditor);
    }

    // Topbar back button
    if (dom.canvasBackBtn) {
      dom.canvasBackBtn.addEventListener('click', closeEditor);
    }

    // Undo / Redo
    if (dom.canvasUndoBtn) {
      dom.canvasUndoBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('undo');
      });
    }
    if (dom.canvasRedoBtn) {
      dom.canvasRedoBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('redo');
      });
    }

    // Style dropdown (Body, Heading 2, Heading 3)
    if (dom.canvasFormatBlock) {
      dom.canvasFormatBlock.addEventListener('change', () => {
        const val = dom.canvasFormatBlock.value;
        execCanvasCommand('formatBlock', '<' + val + '>');
      });
    }

    // Direct command buttons (bold, italic, strikeThrough, lists)
    $$('.canvas-format-btn[data-command]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.command;
        execCanvasCommand(cmd);
      });
    });

    // Inline Code
    if (dom.canvasCodeBtn) {
      dom.canvasCodeBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasCode();
      });
    }

    // Matcha Highlight
    if (dom.canvasHighlightBtn) {
      dom.canvasHighlightBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasHighlight();
      });
    }

    // Link
    if (dom.canvasLinkBtn) {
      dom.canvasLinkBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasLink();
      });
    }

    // Image Upload / URL
    if (dom.canvasImageBtn) {
      dom.canvasImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isCanvasPreviewActive) return;
        const choice = confirm('Click OK to upload an image from your device, or Cancel to paste an image URL.');
        if (choice) {
          if (dom.canvasImageInput) dom.canvasImageInput.click();
        } else {
          const url = prompt('Enter image URL:');
          if (url && url.trim()) {
            execCanvasCommand('insertImage', url.trim());
          }
        }
      });
    }

    if (dom.canvasImageInput) {
      dom.canvasImageInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          execCanvasCommand('insertImage', event.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
      });
    }

    // Soundtrack toggle & remove
    if (dom.canvasSoundtrackToggle) {
      dom.canvasSoundtrackToggle.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSoundtrackStrip();
      });
    }
    if (dom.canvasSoundtrackClose) {
      dom.canvasSoundtrackClose.addEventListener('click', (e) => {
        e.preventDefault();
        removeSoundtrackStrip();
      });
    }

    // Blockquote
    if (dom.canvasQuoteBtn) {
      dom.canvasQuoteBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('formatBlock', '<blockquote>');
      });
    }

    // Section Divider
    if (dom.canvasHrBtn) {
      dom.canvasHrBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        execCanvasCommand('insertHorizontalRule');
      });
    }

    // Sticky Note
    if (dom.canvasStickyBtn) {
      dom.canvasStickyBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleCanvasStickyNote();
      });
    }

    // Canvas Body Click (Delete Sticky Note)
    if (dom.canvasBody) {
      dom.canvasBody.addEventListener('click', (e) => {
        const delBtn = e.target.closest('.sticky-note-del-btn');
        if (delBtn) {
          e.preventDefault();
          e.stopPropagation();
          const note = delBtn.closest('.diary-sticky-note');
          if (note) {
            note.remove();
          }
        }
      });
    }

    // Preview button
    if (dom.canvasPreviewBtn) {
      dom.canvasPreviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCanvasPreview();
      });
    }

    // Publish button
    if (dom.canvasPublishBtn) {
      dom.canvasPublishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCanvasPublish();
      });
    }

    // Auto-grow textareas
    if (dom.canvasTitle) {
      dom.canvasTitle.addEventListener('input', () => autoGrowTextarea(dom.canvasTitle));
    }
    if (dom.canvasSubtitle) {
      dom.canvasSubtitle.addEventListener('input', () => autoGrowTextarea(dom.canvasSubtitle));
    }

    // Category Tabs click
    if (dom.canvasCategoryTabs) {
      dom.canvasCategoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.canvas-category-tab');
        if (!tab) return;
        const cat = tab.dataset.category;
        if (selectedCanvasCategory === cat) {
          selectedCanvasCategory = null;
        } else {
          selectedCanvasCategory = cat;
        }
        renderCanvasCategoryTabs();
      });
    }

    // Soundtrack URL auto-fill
    if (dom.canvasTrackUrl) {
      dom.canvasTrackUrl.addEventListener('blur', handleCanvasSongUrlAutoFill);
      dom.canvasTrackUrl.addEventListener('change', handleCanvasSongUrlAutoFill);
      dom.canvasTrackUrl.addEventListener('paste', () => {
        setTimeout(handleCanvasSongUrlAutoFill, 80);
      });
    }
  }

  /* ═══════════════════════════════════════
     EVENT BINDING
     ═══════════════════════════════════════ */

  function bindEvents() {
    // Theme
    dom.themeToggle.addEventListener('click', toggleTheme);

    // Logo / Salutation → reset
    if (dom.logoLink) {
      dom.logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (readerOpen) closeReader();
        if (editorOpen) closeEditor();
        activeFilter = 'All';
        renderFilters();
        renderFeed();
      });
    }

    // Filters
    dom.filterBar.addEventListener('click', handleFilterClick);

    // Index Slide-Over Drawer
    if (dom.indexToggleBtn) {
      dom.indexToggleBtn.addEventListener('click', toggleIndexSlideover);
    }
    if (dom.indexCloseBtn) {
      dom.indexCloseBtn.addEventListener('click', closeIndexSlideover);
    }
    if (dom.indexBackdrop) {
      dom.indexBackdrop.addEventListener('click', closeIndexSlideover);
    }

    // Scrapbook Hero scroll button
    const heroScrollBtn = $('#hero-scroll-btn');
    if (heroScrollBtn) {
      heroScrollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = dom.feedColumn || $('#feed-column');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Feed
    dom.feedColumn.addEventListener('click', handleFeedClick);

    // Reader close (if legacy button exists)
    if (dom.readerClose) {
      dom.readerClose.addEventListener('click', () => closeReader());
    }

    // Hash routing for deep-links & browser back/forward
    window.addEventListener('hashchange', handleHashRouting);

    // Window scroll for reading progress bar
    window.addEventListener('scroll', updateReadingProgress);

    // Editorial Substack Canvas
    initCanvasEvents();

    // Status modal
    if (dom.editStatusBtn) {
      dom.editStatusBtn.addEventListener('click', handleEditStatusClick);
    }
    const smCancel = $('#status-modal-cancel');
    if (smCancel) smCancel.addEventListener('click', closeStatusModal);
    const smSave = $('#status-modal-save');
    if (smSave) smSave.addEventListener('click', saveStatus);
    if (dom.statusModal) {
      dom.statusModal.addEventListener('click', (e) => {
        if (e.target === dom.statusModal) closeStatusModal();
      });
    }

    // Mini player & direct audio
    if (dom.miniCloseBtn) {
      dom.miniCloseBtn.addEventListener('click', stopTrack);
    }
    initDirectAudioEvents();

    // Export / Import
    dom.exportBtn.addEventListener('click', Data.exportAll);
    dom.importInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Data.importAll(file);
        renderFeed();
        renderCurrently();
        alert('Data imported successfully!');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
      e.target.value = '';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (dom.indexSlideover && dom.indexSlideover.classList.contains('open')) {
          closeIndexSlideover();
        } else if ($('#author-modal') && $('#author-modal').classList.contains('open')) {
          closeAuthorModal();
        } else if (dom.statusModal.classList.contains('open')) {
          closeStatusModal();
        } else if (editorOpen) {
          closeEditor();
        } else if (readerOpen) {
          closeReader();
        }
      }

      // Ctrl/Cmd + Shift + E: Author Mode toggle shortcut
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        openAuthorModal();
      }
    });

    // Masthead sparkle triple-click (Subtle hidden author unlock)
    const sparkle = $('#masthead-sparkle');
    let sparkleClicks = 0;
    let sparkleTimer = null;
    if (sparkle) {
      sparkle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sparkleClicks++;
        clearTimeout(sparkleTimer);
        sparkleTimer = setTimeout(() => {
          sparkleClicks = 0;
        }, 1400);

        if (sparkleClicks === 3) {
          sparkleClicks = 0;
          openAuthorModal();
        }
      });
    }

    // Author Login Form submission
    const loginForm = $('#author-login-form');
    if (loginForm) loginForm.addEventListener('submit', handleAuthorLoginSubmit);

    const authorCancelBtn = $('#author-modal-cancel');
    if (authorCancelBtn) authorCancelBtn.addEventListener('click', closeAuthorModal);

    const authorCloseSignedBtn = $('#author-modal-close-signed');
    if (authorCloseSignedBtn) authorCloseSignedBtn.addEventListener('click', closeAuthorModal);

    const authorSignoutModalBtn = $('#author-modal-signout');
    if (authorSignoutModalBtn) authorSignoutModalBtn.addEventListener('click', handleAuthorSignOut);

    const authorModal = $('#author-modal');
    if (authorModal) {
      authorModal.addEventListener('click', (e) => {
        if (e.target === authorModal) closeAuthorModal();
      });
    }

    // Header Sign Out pill
    const authorSignoutBtn = $('#author-signout-btn');
    if (authorSignoutBtn) {
      authorSignoutBtn.addEventListener('click', handleAuthorSignOut);
    }

    // Download posts.js button (Author only)
    const downloadPostsBtn = $('#download-posts-js-btn');
    if (downloadPostsBtn) {
      downloadPostsBtn.addEventListener('click', () => {
        Data.downloadPostsJs();
        showToast('posts.js downloaded!');
      });
    }

    // "Currently" music click → play track if link available or display toast
    dom.currentlyItems.addEventListener('click', (e) => {
      const playEl = e.target.closest('#currently-play');
      if (playEl) {
        const url = playEl.dataset.url;
        if (url) {
          const parsed = parseTrackUrl(url);
          if (parsed) {
            toggleTrack({
              title: playEl.dataset.title || 'On Repeat',
              artist: playEl.dataset.artist || 'zee’s playlist',
              url: url
            });
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        } else {
          showToast(`Soundtrack note: ${playEl.dataset.title || 'Where’s My Love'} — ${playEl.dataset.artist || 'SYML'}`);
        }
      }
    });
  }

  function updateRunningHeaderDate() {
    if (!dom.runningDate) return;
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const year = String(now.getFullYear()).slice(-2);
    dom.runningDate.textContent = `${month} ’${year}`;
  }

  /* ═══════════════════════════════════════
     INIT
     ═══════════════════════════════════════ */

  async function init() {
    cacheDom();
    initTheme();
    updateRunningHeaderDate();
    renderFilters();
    renderFeed();
    renderCurrently();
    bindEvents();

    // Mobile user-gesture unlock for audio & YouTube API
    const unlockMobileAudio = () => {
      if (!ytAudioPlayer && window.YT && window.YT.Player) {
        prewarmYtPlayer();
      }
      if (dom.directAudioEl) {
        try {
          const p = dom.directAudioEl.play();
          if (p && typeof p.then === 'function') {
            p.then(() => {
              dom.directAudioEl.pause();
            }).catch(() => {});
          }
        } catch (_) {}
      }
    };
    document.addEventListener('touchstart', unlockMobileAudio, { once: true, passive: true });
    document.addEventListener('pointerdown', unlockMobileAudio, { once: true });

    // Fetch Supabase select('*') posts and site_status for all visitors (anon and logged-in)
    const publicDataSync = Promise.all([
      syncAndRenderPosts(),
      syncLiveStatus()
    ]);

    // Check author session in parallel without gating post fetching
    await initAuthorAuth();
    await publicDataSync;
    handleHashRouting();

    console.log(
      '%c[demo tape] I’ll Try Anything Once %c— live Supabase connected',
      'color:#4F795B;font-weight:bold;font-size:14px;',
      'color:#6E6A63;font-size:12px;'
    );
  }

  // Start when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window.ZLog);
