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
    dom.canvasImageUrlBtn = $('#canvas-image-url-btn');
    dom.canvasImageUrlPopover = $('#canvas-image-url-popover');
    dom.canvasImageUrlInput = $('#canvas-image-url-input');
    dom.canvasImageUrlSubmit = $('#canvas-image-url-submit');
    dom.canvasDoodleBtn = $('#canvas-doodle-btn');
    dom.canvasDoodlePopover = $('#canvas-doodle-popover');
    dom.canvasSoundtrackToggle = $('#canvas-soundtrack-toggle');
    dom.canvasSoundtrackStrip = $('#canvas-soundtrack-strip');
    dom.canvasSoundtrackClose = $('#canvas-soundtrack-close');
    dom.canvasQuoteBtn  = $('#canvas-quote-btn');
    dom.canvasStickyBtn = $('#canvas-sticky-btn');
    dom.canvasHrBtn     = $('#canvas-hr-btn');
    dom.canvasPreviewBtn = $('#canvas-preview-btn');
    dom.canvasDraftBtn  = $('#canvas-draft-btn');
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
    dom.canvasPlaylistList = $('#canvas-playlist-list');
    dom.canvasAddSongBtn = $('#canvas-add-song-btn');
    dom.canvasBody      = $('#canvas-body');
    dom.canvasModeSwitcher = $('#canvas-mode-switcher');
    dom.modeJournalBtn  = $('#mode-journal-btn');
    dom.modeSketchBtn   = $('#mode-sketch-btn');
    dom.canvasHistoryGroup = $('#canvas-history-group');
    dom.canvasSketchArea = $('#canvas-sketch-area');
    dom.sketchCaption   = $('#sketch-caption');
    dom.sketchCharCounter = $('#sketch-char-counter');
    dom.sketchTabDraw   = $('#sketch-tab-draw');
    dom.sketchTabUpload = $('#sketch-tab-upload');
    dom.sketchDrawPanel = $('#sketch-draw-panel');
    dom.sketchUploadPanel = $('#sketch-upload-panel');
    dom.sketchDrawingCanvas = $('#sketch-drawing-canvas');
    dom.sketchFileInput = $('#sketch-file-input');
    dom.sketchDropzone  = $('#sketch-dropzone');
    dom.sketchDropzonePrompt = $('#sketch-dropzone-prompt');
    dom.sketchUploadPreview = $('#sketch-upload-preview');
    dom.sketchUploadPreviewImg = $('#sketch-upload-preview-img');
    dom.sketchUploadCrop = $('#sketch-upload-crop');
    dom.sketchUploadRemove = $('#sketch-upload-remove');
    dom.sketchPadUndo   = $('#sketch-pad-undo');
    dom.sketchPadClear  = $('#sketch-pad-clear');
    dom.sketchTagsPills = $('#sketch-tags-pills');
    dom.sketchLightboxModal = $('#sketch-lightbox-modal');
    dom.sketchLightboxImg = $('#sketch-lightbox-img');
    dom.sketchLightboxCaption = $('#sketch-lightbox-caption');
    dom.sketchLightboxClose = $('#sketch-lightbox-close');
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
    dom.heroModal       = $('#hero-modal');
    dom.editHeroNoteBtn = $('#edit-hero-note-btn');
    dom.editPolaroidBtn = $('#edit-polaroid-btn');
    dom.heroQuoteText   = $('#hero-quote-text');
    dom.heroDescText    = $('#hero-desc-text');
    dom.polaroidPhotoImg= $('#polaroid-photo-img');
    dom.polaroidQuoteText = $('#polaroid-quote-text');
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
    dom.directPrevBtn   = $('#direct-prev-btn');
    dom.directPlayBtn   = $('#direct-play-btn');
    dom.directNextBtn   = $('#direct-next-btn');
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
    dom.journalFilterBar = $('#journal-filter-bar');
    dom.footerAuthorBtn = $('#footer-author-btn');
    dom.footerAuthorTrigger = $('#footer-author-trigger');
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
      if (dom.footerAuthorBtn) dom.footerAuthorBtn.textContent = 'author mode (signed in)';
    } else {
      document.body.classList.remove('author-mode');
      if (dom.footerAuthorBtn) dom.footerAuthorBtn.textContent = 'author login';
      if (activeFilter.toLowerCase() === 'drafts') {
        activeFilter = 'All';
      }
    }
    renderFilters();
    renderFeed();
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
    activeFilter = 'All';
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
    renderHero();
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
    } else if (clean === 'memories') {
      label = 'memories';
      modifierClass = 'entry-tag--memories';
    }

    return `<span class="entry-tag ${modifierClass}" data-filter-tag="${clean}">${label}</span>`;
  }

  /* ═══════════════════════════════════════
     FILTERS (Vertical Editorial Sidebar Index)
     ═══════════════════════════════════════ */

  function renderFilters() {
    const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    const allEntries = Data.loadEntries();
    const visibleEntries = allEntries.filter(e => !Data.isDraft(e));
    const draftCount = allEntries.filter(e => Data.isDraft(e)).length;

    // Reset activeFilter if a public visitor was somehow on Drafts
    if (!isAuthor && activeFilter.toLowerCase() === 'drafts') {
      activeFilter = 'All';
    }

    let tagsToRender = [...Data.TAGS];
    if (isAuthor) {
      tagsToRender.push('Drafts');
    }

    // 1. Render in top of Journal Section: dom.journalFilterBar
    if (dom.journalFilterBar) {
      dom.journalFilterBar.innerHTML = tagsToRender.map((tag) => {
        let count = 0;
        if (tag.toLowerCase() === 'all') {
          count = isAuthor ? allEntries.length : visibleEntries.length;
        } else if (tag.toLowerCase() === 'drafts') {
          count = draftCount;
        } else {
          count = Data.getFilteredEntries(tag, isAuthor).length;
        }
        const isActive = tag.toLowerCase() === activeFilter.toLowerCase();
        const isDraftTab = tag.toLowerCase() === 'drafts';
        const label = isDraftTab ? 'drafts' : tag.toLowerCase();

        return `
          <button type="button" class="journal-filter-pill${isActive ? ' active' : ''}${isDraftTab ? ' drafts-filter-pill' : ''}" data-tag="${tag}" role="tab" aria-selected="${isActive}">
            <span>${label}</span>
            <span class="pill-count">(${count})</span>
          </button>
        `;
      }).join('');
    }

    // 2. Render inside Slide-Over Index Drawer: dom.filterBar
    if (dom.filterBar) {
      dom.filterBar.innerHTML = tagsToRender.map((tag) => {
        let count = 0;
        if (tag.toLowerCase() === 'all') {
          count = isAuthor ? allEntries.length : visibleEntries.length;
        } else if (tag.toLowerCase() === 'drafts') {
          count = draftCount;
        } else {
          count = Data.getFilteredEntries(tag, isAuthor).length;
        }
        const countPadded = String(count).padStart(2, '0');
        const isActive = tag.toLowerCase() === activeFilter.toLowerCase();
        const isDraftTab = tag.toLowerCase() === 'drafts';
        const label = isDraftTab ? 'drafts' : tag.toLowerCase();
        return `
          <button class="index-nav-item${isActive ? ' active' : ''}${isDraftTab ? ' index-item-drafts' : ''}" data-tag="${tag}">
            <span class="index-item-left">
              <span class="index-indicator" aria-hidden="true">—</span>
              <span class="index-label">${label}</span>
            </span>
            <span class="index-count">${countPadded}</span>
          </button>
        `;
      }).join('');
    }
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

  function renderSketchCard(entry) {
    const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    const isDraft = Data.isDraft(entry);
    if (isDraft && !isAuthor) return '';

    const draftTagHtml = isDraft
      ? `<span class="draft-badge draft-pill" style="border: 1px solid #DCE5D5;" title="Unpublished Draft">draft</span>`
      : '';

    const authorActionsHtml = isAuthor
      ? `
        <button type="button" class="entry-edit-pill author-only" data-entry-id="${entry.id}" title="Edit this sketch">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>Edit</span>
        </button>
        ${isDraft ? `
          <button type="button" class="entry-publish-pill author-only" data-entry-id="${entry.id}" title="Publish this draft sketch live immediately">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Publish</span>
          </button>
        ` : ''}
        <button type="button" class="entry-delete-pill author-only" data-entry-id="${entry.id}" title="Delete this sketch">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          <span>Delete</span>
        </button>
      `
      : '';

    const caption = entry.caption || entry.subtitle || '';
    const imgUrl = entry.sketch_url || entry.cover_image || '';

    return `
      <article class="diary-paper-slip sketch-feed-card${isDraft ? ' entry-card--draft' : ''}" data-entry-id="${entry.id}" data-sketch="true">
        <div class="sketch-feed-header">
          <div class="sketch-feed-author">
            <div class="sketch-avatar-circle" aria-hidden="true">z</div>
            <div class="sketch-author-info">
              <span class="sketch-author-handle">zee</span>
              <span class="sketch-meta-dot">·</span>
              <time class="sketch-feed-time">${formatDate(entry.date || entry.createdAt)}</time>
            </div>
          </div>
          <div class="sketch-feed-actions">
            ${draftTagHtml}
            <span class="tag-pill tag-pill--sketch">sketch</span>
            ${authorActionsHtml}
          </div>
        </div>

        ${caption ? `<div class="sketch-feed-caption">${escapeHtml(caption)}</div>` : ''}

        ${imgUrl ? `
          <div class="sketch-media-frame" data-src="${escapeHtml(imgUrl)}" title="Click to view full sketch">
            <img src="${escapeHtml(imgUrl)}" alt="Sketch by zee" class="sketch-media-photo" loading="lazy" />
          </div>
        ` : ''}
      </article>
    `;
  }

  function renderEntryCard(entry, mdlMap) {
    const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    const isDraft = Data.isDraft(entry);

    // CRITICAL: Strictly hide drafts from public view!
    if (isDraft && !isAuthor) {
      return '';
    }

    if (entry.isSketch || entry.post_type === 'sketch') {
      return renderSketchCard(entry);
    }

    const coverHtml = entry.coverGradient
      ? `<div class="entry-cover"><div class="entry-cover-inner" style="background:${entry.coverGradient};"></div></div>`
      : '';

    let songPillHtml = '';
    const playlist = (entry.playlist && entry.playlist.length > 0)
      ? entry.playlist
      : (entry.soundtrack ? [entry.soundtrack] : []);

    if (playlist.length > 0) {
      const firstT = playlist[0];
      const songUrl = firstT.url || entry.song_url;
      const title = firstT.title || 'Soundtrack';
      const artist = firstT.artist || '';
      let displayLabel = artist ? `${title} — ${artist}` : title;
      if (playlist.length > 1) {
        displayLabel += ` (+${playlist.length - 1})`;
      }

      if (songUrl) {
        const fullTrack = { ...firstT, url: songUrl, title, artist };
        const isPlaying = isTrackPlaying(fullTrack) || (playlist.some(t => isTrackPlaying(t)));
        const songPillIcon = isPlaying ? ICONS.waveform : ICONS.cassette;
        songPillHtml = `
          <div class="song-pill${isPlaying ? ' playing' : ''}"
               role="button"
               tabindex="0"
               title="${playlist.length > 1 ? `Play playlist (${playlist.length} songs)` : 'Play soundtrack'}"
               data-entry-id="${entry.id}"
               data-track='${escapeHtml(JSON.stringify(fullTrack))}'>
            <span class="pill-icon">${songPillIcon}</span>
            <span>${escapeHtml(displayLabel)}</span>
          </div>`;
      } else {
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

    const draftTagHtml = isDraft
      ? `<span class="draft-badge draft-pill" style="border: 1px solid #DCE5D5;" title="Unpublished Draft">draft</span>`
      : '';

    const authorActionsHtml = isAuthor
      ? `
        <button type="button" class="entry-edit-pill author-only" data-entry-id="${entry.id}" title="Edit this entry">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          <span>Edit</span>
        </button>
        ${isDraft ? `
          <button type="button" class="entry-publish-pill author-only" data-entry-id="${entry.id}" title="Publish this draft live immediately">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Publish</span>
          </button>
        ` : ''}
      `
      : '';

    return `
      <article class="diary-paper-slip entry-card${isDraft ? ' entry-card--draft' : ''}" data-entry-id="${entry.id}" data-draft="${isDraft}">
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
          ${draftTagHtml}
          ${tagsMetaHtml}
          ${authorActionsHtml}
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
    const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    const allEntries = Data.loadEntries();
    const mdlMap = Data.getMightDeleteLaterMap(allEntries, isAuthor);
    const entries = Data.getFilteredEntries(activeFilter, isAuthor);
    const finalEntries = isAuthor ? entries : entries.filter(e => !Data.isDraft(e));

    if (finalEntries.length === 0) {
      const emptyMsg = activeFilter.toLowerCase() === 'drafts'
        ? 'No drafts right now. All caught up!'
        : 'Cool beans — nothing written here yet.';
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
          <p class="empty-state-text">${emptyMsg}</p>
        </div>
      `;
      return;
    }

    dom.feedColumn.innerHTML = finalEntries
      .map(entry => renderEntryCard(entry, mdlMap))
      .filter(Boolean)
      .join('');
  }

  async function handleQuickPublishDraft(id) {
    const entry = Data.getEntry(id);
    if (!entry) return;
    if (!confirm(`Publish "${entry.title || 'Untitled Draft'}" live to journal?`)) return;

    try {
      showToast('Publishing draft live…');
      await Data.updateLivePost(id, { ...entry, published: true });
      showToast(`"${entry.title}" published live!`);
      await syncAndRenderPosts();
    } catch (err) {
      console.error('Quick publish error:', err);
      alert('Failed to publish draft: ' + (err.message || 'Error updating Supabase.'));
    }
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

    // Delete entry pill click (Author only)
    const deletePill = e.target.closest('.entry-delete-pill');
    if (deletePill) {
      e.stopPropagation();
      e.preventDefault();
      const id = deletePill.dataset.entryId;
      const entry = Data.getEntry(id);
      if (confirm(`Delete this ${entry && entry.isSketch ? 'sketch' : 'entry'} permanently?`)) {
        Data.deleteLivePost(id).then(() => {
          syncAndRenderPosts();
          showToast('Erased from journal.');
        }).catch(err => {
          alert('Could not delete: ' + (err.message || 'Error'));
        });
      }
      return;
    }

    // Publish draft pill click (Author only)
    const publishPill = e.target.closest('.entry-publish-pill');
    if (publishPill) {
      e.stopPropagation();
      e.preventDefault();
      const id = publishPill.dataset.entryId;
      if (id) {
        handleQuickPublishDraft(id);
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
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry) {
          const playlist = (entry.playlist && entry.playlist.length > 0)
            ? entry.playlist
            : (entry.soundtrack ? [entry.soundtrack] : []);
          if (playlist.length > 0) {
            toggleTrack(playlist[0], playlist, 0);
            return;
          }
        }
      }
      let track = null;
      if (pill.dataset.track) {
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
      const matched = Data.TAGS.find(t => t.toLowerCase() === filterKey || (filterKey.startsWith('might delete later') && t === 'might delete later'));
      if (matched) {
        activeFilter = matched;
        renderFilters();
        renderFeed();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    // Sketch card or media frame click -> open lightbox
    const sketchCard = e.target.closest('.sketch-feed-card');
    if (sketchCard) {
      if (e.target.closest('.author-only, button, a')) return;
      const mediaEl = sketchCard.querySelector('.sketch-media-frame');
      const src = mediaEl ? (mediaEl.dataset.src || (mediaEl.querySelector('img') ? mediaEl.querySelector('img').src : '')) : '';
      const captionEl = sketchCard.querySelector('.sketch-feed-caption');
      const captionText = captionEl ? captionEl.textContent : '';
      if (src) {
        openSketchLightbox(src, captionText);
      }
      return;
    }

    // Entry card click
    const card = e.target.closest('.entry-card');
    if (card) {
      const id = card.dataset.entryId;
      const entry = Data.getEntry(id);
      const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
      if (entry && Data.isDraft(entry)) {
        if (isAuthor) {
          openEditor(entry);
        }
        return;
      }
      openReader(id);
    }
  }

  /* ═══════════════════════════════════════
     SONG LINK / METADATA & ON REPEAT HELPERS
     ═══════════════════════════════════════ */

  function cleanVideoTitle(raw) {
    if (!raw) return '';
    return raw
      .replace(/\s*[\(\[](?:Official\s*(?:Music\s*)?(?:Video|Audio|HD|4K|Remaster(?:ed)?|Visualizer|Lyric Video)|Music Video|Lyric Video|Audio|Visualizer|Official|MV)[\)\]]/gi, '')
      .replace(/\s*\|\s*Official\s*(?:Music\s*)?(?:Video|Audio|Visualizer).*/gi, '')
      .replace(/\s*-\s*Official\s*(?:Music\s*)?(?:Video|Audio|Visualizer).*/gi, '')
      .trim();
  }

  function cleanSongMetadata(rawTitle, rawAuthor) {
    let title = cleanVideoTitle(rawTitle);
    let artist = (rawAuthor || '').replace(/\s*-\s*Topic$/i, '').trim();

    if (title.includes(' - ') || title.includes(' — ')) {
      const parts = title.split(/\s*(?:—|-)\s*/);
      if (parts.length >= 2) {
        const p0 = parts[0].trim();
        const p1 = parts.slice(1).join(' - ').trim();
        if (artist && p1.toLowerCase().includes(artist.toLowerCase())) {
          title = p0;
          artist = p1;
        } else if (artist && p0.toLowerCase().includes(artist.toLowerCase())) {
          artist = p0;
          title = p1;
        } else {
          artist = p0;
          title = p1;
        }
      }
    }

    const display = (title && artist) ? `${title} — ${artist}` : (title || artist || 'Soundtrack');
    return { title, artist, display };
  }

  async function fetchSongDetails(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string' || !/^https?:\/\//i.test(rawUrl.trim())) return null;
    const url = rawUrl.trim();

    try {
      const cached = localStorage.getItem('zlog_song_cache_' + url);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.display) return parsed;
      }
    } catch (_) {}

    let result = null;

    // 1. YouTube official oEmbed
    if (/(?:youtube\.com|youtu\.be)\//i.test(url)) {
      try {
        const ytRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (ytRes.ok) {
          const data = await ytRes.json();
          if (data && data.title) {
            result = cleanSongMetadata(data.title, data.author_name || '');
          }
        }
      } catch (_) {}
    }

    // 2. SoundCloud oEmbed
    if (!result && /soundcloud\.com\//i.test(url)) {
      try {
        const scRes = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
        if (scRes.ok) {
          const data = await scRes.json();
          if (data && data.title) {
            let t = data.title;
            let a = data.author_name || '';
            if (t.includes(' by ')) {
              const segs = t.split(' by ');
              result = cleanSongMetadata(segs[0], segs[1] || a);
            } else {
              result = cleanSongMetadata(t, a);
            }
          }
        }
      } catch (_) {}
    }

    // 3. noembed.com fallback (handles music.youtube.com, etc.)
    if (!result) {
      try {
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && !data.error) {
            result = cleanSongMetadata(data.title, data.author_name || '');
          }
        }
      } catch (_) {}
    }

    // 4. Direct audio link
    if (!result && /\.(mp3|m4a|wav|ogg|aac)(\?.*)?$/i.test(url)) {
      try {
        const filename = url.split('/').pop().split('?')[0].replace(/\.(mp3|m4a|wav|ogg|aac)$/i, '');
        const cleanName = decodeURIComponent(filename).replace(/[-_]+/g, ' ').trim();
        result = cleanSongMetadata(cleanName, '');
      } catch (_) {}
    }

    if (result && result.display) {
      try {
        localStorage.setItem('zlog_song_cache_' + url, JSON.stringify(result));
      } catch (_) {}
    }

    return result;
  }

  function parseOnRepeat(raw) {
    let title = 'Where’s My Love';
    let artist = 'SYML';
    let display = 'Where’s My Love — SYML';
    let url = 'https://www.youtube.com/watch?v=t_uB6HdV7Wc';

    if (!raw) {
      return { title, artist, display, url };
    }

    if (typeof raw === 'object' && raw !== null) {
      title = (raw.title || '').trim() || title;
      artist = (raw.artist || '').trim() || artist;
      url = (raw.url || '').trim() || url;
      display = (raw.display || '').trim() || (artist ? `${title} — ${artist}` : title);
      return { title, artist, display, url };
    }

    const str = String(raw).trim();

    if (str.startsWith('{') && str.endsWith('}')) {
      try {
        const obj = JSON.parse(str);
        if (obj && typeof obj === 'object') {
          title = (obj.title || '').trim() || title;
          artist = (obj.artist || '').trim() || artist;
          url = (obj.url || '').trim() || url;
          display = (obj.display || '').trim() || (artist ? `${title} — ${artist}` : title);
          return { title, artist, display, url };
        }
      } catch (_) {}
    }

    if (str.includes('|')) {
      const parts = str.split('|').map(s => s.trim());
      const foundUrl = parts.find(p => /^https?:\/\//i.test(p));
      const foundText = parts.find(p => !/^https?:\/\//i.test(p));
      if (foundUrl) url = foundUrl;
      if (foundText) {
        if (foundText.includes('—') || foundText.includes(' - ')) {
          const segs = foundText.split(/\s*(?:—|-)\s*/);
          title = segs[0].trim();
          artist = segs.slice(1).join(' - ').trim();
          display = artist ? `${title} — ${artist}` : title;
        } else {
          title = foundText;
          artist = '';
          display = foundText;
        }
        return { title, artist, display, url };
      }
    }

    if (/^https?:\/\//i.test(str)) {
      url = str;
      try {
        const cached = localStorage.getItem('zlog_song_cache_' + str);
        if (cached) {
          const c = JSON.parse(cached);
          if (c && c.display) {
            return {
              title: c.title || 'Soundtrack',
              artist: c.artist || '',
              display: c.display,
              url: str
            };
          }
        }
      } catch (_) {}

      // Clean fallback if not yet resolved: NEVER show "YouTube Music Track" or URL hostname
      return { title: 'Soundtrack', artist: '', display: 'Soundtrack', url: str };
    }

    if (str.includes('—') || str.includes(' - ')) {
      const segs = str.split(/\s*(?:—|-)\s*/);
      title = segs[0].trim();
      artist = segs.slice(1).join(' - ').trim();
      display = artist ? `${title} — ${artist}` : title;
    } else {
      title = str;
      artist = '';
      display = str;
    }

    const lower = str.toLowerCase();
    if (lower.includes('gimme love') || (lower.includes('joji') && lower.includes('love'))) {
      url = 'https://www.youtube.com/watch?v=jPan651rVMs';
    } else if (lower.includes('where') && lower.includes('love')) {
      url = 'https://www.youtube.com/watch?v=t_uB6HdV7Wc';
    } else if (lower.includes('ill try anything once') || lower.includes("i'll try anything once")) {
      url = 'https://www.youtube.com/watch?v=kYJjZk3-8qU';
    }

    return { title, artist, display, url };
  }

  /* ═══════════════════════════════════════
     CURRENTLY WIDGET
     ═══════════════════════════════════════ */

  function renderCurrently() {
    const status = Data.loadStatus();
    const track = parseOnRepeat(status.onRepeat);

    // If track has a URL but display is still placeholder 'Soundtrack', resolve asynchronously
    if (track.url && (!track.display || track.display === 'Soundtrack' || /^https?:\/\//i.test(track.display))) {
      fetchSongDetails(track.url).then(meta => {
        if (meta && meta.display) {
          try {
            localStorage.setItem('zlog_song_cache_' + track.url, JSON.stringify(meta));
          } catch (_) {}
          const playEl = $('#currently-play');
          if (playEl) {
            playEl.textContent = meta.display;
            playEl.dataset.title = meta.title;
            playEl.dataset.artist = meta.artist;
            playEl.title = `Play: ${meta.display}`;
          }
        }
      });
    }

    if (dom.currentlyItems) {
      dom.currentlyItems.innerHTML = `
        <div class="currently-row">
          <span class="currently-tag">READING</span>
          <span class="currently-text">${escapeHtml(status.reading || 'The Creative Act — Rick Rubin')}</span>
        </div>
        <div class="currently-row">
          <div class="currently-tag-group">
            <span class="currently-tag">ON REPEAT</span>
            <span class="cassette-badge" title="Cassette tape">${ICONS.cassette}</span>
            <svg class="hand-drawn-arrow" width="22" height="12" viewBox="0 0 28 16" fill="none" aria-hidden="true">
              <path d="M2 13 C 10 14, 18 10, 24 4 M 18 3 L 25 4 L 23 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="currently-text">
            <span class="currently-value-text clickable" id="currently-play"
                  data-title="${escapeHtml(track.title)}"
                  data-artist="${escapeHtml(track.artist)}"
                  data-url="${escapeHtml(track.url || '')}"
                  title="Play: ${escapeHtml(track.display)}">
              ${escapeHtml(track.display)}
            </span>
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
      `;
    }
  }

  /* ═══════════════════════════════════════
     SCRAPBOOK HERO (INTRO NOTE & POLAROID)
     ═══════════════════════════════════════ */

  function renderHero() {
    const hero = Data.loadHero();
    if (dom.heroQuoteText) {
      dom.heroQuoteText.innerHTML = escapeHtml(hero.quote || Data.defaultHero.quote).replace(/\n/g, '<br>');
    }
    if (dom.heroDescText) {
      dom.heroDescText.textContent = hero.desc || Data.defaultHero.desc;
    }
    if (dom.polaroidPhotoImg) {
      dom.polaroidPhotoImg.src = hero.polaroidImg || Data.defaultHero.polaroidImg;
    }
    if (dom.polaroidQuoteText) {
      dom.polaroidQuoteText.textContent = hero.polaroidQuote || Data.defaultHero.polaroidQuote;
    }
  }

  function handleEditHeroClick(e, focusTarget = 'note') {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isAuthed = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    if (!isAuthed) {
      openAuthorModal();
      return;
    }
    openHeroModal(focusTarget);
  }

  function openHeroModal(focusTarget = 'note') {
    const hero = Data.loadHero();
    if ($('#hm-quote')) $('#hm-quote').value = hero.quote || '';
    if ($('#hm-desc')) $('#hm-desc').value = hero.desc || '';
    if ($('#hm-photo-url')) $('#hm-photo-url').value = hero.polaroidImg || '';
    if ($('#hm-polaroid-quote')) $('#hm-polaroid-quote').value = hero.polaroidQuote || '';

    const previewWrap = $('#hm-photo-preview-wrap');
    const previewImg = $('#hm-photo-preview');
    if (previewWrap && previewImg) {
      if (hero.polaroidImg) {
        previewImg.src = hero.polaroidImg;
        previewWrap.style.display = 'flex';
      } else {
        previewWrap.style.display = 'none';
      }
    }

    if (dom.heroModal) dom.heroModal.classList.add('open');

    if (focusTarget === 'polaroid' && $('#hm-photo-url')) {
      setTimeout(() => $('#hm-photo-url').focus(), 80);
    } else if ($('#hm-quote')) {
      setTimeout(() => $('#hm-quote').focus(), 80);
    }
  }

  function closeHeroModal() {
    if (dom.heroModal) dom.heroModal.classList.remove('open');
  }

  async function saveHeroData(e) {
    if (e) e.preventDefault();

    const quote = $('#hm-quote') ? $('#hm-quote').value.trim() : '';
    const desc = $('#hm-desc') ? $('#hm-desc').value.trim() : '';
    const photoUrl = $('#hm-photo-url') ? $('#hm-photo-url').value.trim() : '';
    const polQuote = $('#hm-polaroid-quote') ? $('#hm-polaroid-quote').value.trim() : '';

    const newHero = {
      quote: quote || Data.defaultHero.quote,
      desc: desc || Data.defaultHero.desc,
      polaroidImg: photoUrl || Data.defaultHero.polaroidImg,
      polaroidQuote: polQuote || Data.defaultHero.polaroidQuote
    };

    closeHeroModal();
    Data.saveHero(newHero);
    renderHero();

    try {
      await Data.saveLiveHero(newHero);
      showToast('Scrapbook cards updated & synced!');
    } catch (err) {
      console.error('Failed to sync hero to Supabase:', err);
      showToast('Saved locally. Supabase sync error: ' + (err.message || 'Check connection'));
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
    if ($('#sm-crafting')) $('#sm-crafting').value      = status.crafting || '';
    if ($('#sm-daydreaming')) $('#sm-daydreaming').value = (status && status.daydreaming !== undefined && status.daydreaming !== null) ? status.daydreaming : '';

    const track = parseOnRepeat(status.onRepeat);
    if ($('#sm-repeat-url')) $('#sm-repeat-url').value = track.url || '';
    if ($('#sm-repeat-title')) $('#sm-repeat-title').value = track.display || '';
    if ($('#sm-repeat-hint')) {
      $('#sm-repeat-hint').textContent = 'Auto-detects title and singer when link is pasted';
      $('#sm-repeat-hint').style.color = 'var(--ink-muted)';
    }
    dom.statusModal.classList.add('open');
  }

  function closeStatusModal() {
    dom.statusModal.classList.remove('open');
  }

  async function handleStatusSongUrlAutoFill() {
    const urlInput = $('#sm-repeat-url');
    const titleInput = $('#sm-repeat-title');
    const hintEl = $('#sm-repeat-hint');
    if (!urlInput || !titleInput) return;

    let rawUrl = urlInput.value.trim();

    // If user accidentally pasted the URL into titleInput
    if (!rawUrl && /^https?:\/\//i.test(titleInput.value.trim())) {
      rawUrl = titleInput.value.trim();
      urlInput.value = rawUrl;
      titleInput.value = '';
    }

    if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) return;

    if (hintEl) {
      hintEl.textContent = 'Detecting title & singer from link…';
      hintEl.style.color = 'var(--accent)';
    }

    try {
      const meta = await fetchSongDetails(rawUrl);
      if (meta && meta.display) {
        titleInput.value = meta.display;
        if (hintEl) {
          hintEl.textContent = `Auto-detected: ${meta.display}`;
          hintEl.style.color = 'var(--accent)';
        }
      } else {
        if (hintEl) {
          hintEl.textContent = 'Link recognized. Enter title & singer above if needed.';
          hintEl.style.color = 'var(--ink-muted)';
        }
      }
    } catch (_) {
      if (hintEl) {
        hintEl.textContent = 'Enter title & singer above.';
        hintEl.style.color = 'var(--ink-muted)';
      }
    }
  }

  async function saveStatus() {
    const reading = $('#sm-reading') ? $('#sm-reading').value.trim() : '';
    const repeatUrl = $('#sm-repeat-url') ? $('#sm-repeat-url').value.trim() : '';
    let repeatTitle = $('#sm-repeat-title') ? $('#sm-repeat-title').value.trim() : '';
    const crafting = $('#sm-crafting') ? $('#sm-crafting').value.trim() : '';
    const daydreaming = $('#sm-daydreaming') ? $('#sm-daydreaming').value.trim() : '';

    // If repeatTitle is blank but url is present, check cache or parse
    if (repeatUrl && !repeatTitle) {
      try {
        const cached = localStorage.getItem('zlog_song_cache_' + repeatUrl);
        if (cached) {
          const c = JSON.parse(cached);
          if (c && c.display) repeatTitle = c.display;
        }
      } catch (_) {}
      if (!repeatTitle) {
        const ytMatch = repeatUrl.match(/(?:youtu\.be\/|watch\?(?:.*&)?v=)([\w-]{11})/i);
        if (ytMatch && ytMatch[1] === 'jPan651rVMs') {
          repeatTitle = 'Gimme Love — Joji';
        }
      }
    }

    let onRepeatVal;
    if (repeatUrl || repeatTitle) {
      const parsedTrack = parseOnRepeat(repeatTitle || repeatUrl);
      if (repeatUrl) parsedTrack.url = repeatUrl;
      if (repeatTitle) {
        parsedTrack.display = repeatTitle;
        if (repeatTitle.includes('—') || repeatTitle.includes(' - ')) {
          const segs = repeatTitle.split(/\s*(?:—|-)\s*/);
          parsedTrack.title = segs[0].trim();
          parsedTrack.artist = segs.slice(1).join(' - ').trim();
        } else {
          parsedTrack.title = repeatTitle;
        }
      }
      onRepeatVal = JSON.stringify(parsedTrack);
    } else {
      onRepeatVal = 'Where’s My Love — SYML';
    }

    const newStatus = {
      reading:      reading,
      onRepeat:     onRepeatVal,
      crafting:     crafting,
      daydreaming:  daydreaming
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
    const entry = allEntries.find(e => String(e.id) === String(entryId));
    if (!entry) return;

    const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
    if (Data.isDraft(entry) && !isAuthor) {
      showToast('This entry is currently an unpublished draft.');
      if (readerOpen) closeReader(true);
      return;
    }

    const mdlMap = Data.getMightDeleteLaterMap(allEntries, isAuthor);

    let soundtrackHtml = '';
    const playlist = (entry.playlist && entry.playlist.length > 0)
      ? entry.playlist
      : (entry.soundtrack ? [entry.soundtrack] : []);

    if (playlist.length > 1) {
      soundtrackHtml = `
        <div class="entry-playlist-card" id="reader-playlist-card">
          <div class="playlist-header">
            <div class="soundtrack-kicker">
              ${ICONS.cassette}
              <span>PLAYLIST FOR THIS ENTRY · ${playlist.length} TRACKS</span>
            </div>
          </div>
          <div class="playlist-tracks">
            ${playlist.map((track, i) => {
              const fullT = { ...track, url: track.url || null };
              const isPlayingRow = isTrackPlaying(fullT);
              return `
                <div class="playlist-track-row${isPlayingRow ? ' is-playing' : ''}" data-track-index="${i}">
                  <span class="track-num">${String(i + 1).padStart(2, '0')}</span>
                  <button type="button" class="track-row-play-btn" data-track='${escapeHtml(JSON.stringify(fullT))}' data-index="${i}" aria-label="Play track">
                    ${isPlayingRow ? ICONS.waveform : ICONS.play}
                  </button>
                  <div class="track-row-info">
                    <span class="track-row-title">${escapeHtml(track.title || 'Soundtrack')}</span>
                    ${track.artist ? `<span class="track-row-artist">— ${escapeHtml(track.artist)}</span>` : ''}
                    ${track.note ? `<span class="track-row-note">(${escapeHtml(track.note)})</span>` : ''}
                  </div>
                  ${track.url ? `<a href="${escapeHtml(track.url)}" target="_blank" rel="noopener noreferrer" class="track-row-link" title="Open track">${ICONS.externalLink}</a>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (playlist.length === 1 && (playlist[0].title || playlist[0].url)) {
      const st = playlist[0];
      const songUrl = st.url || entry.song_url;
      const title = st.title || 'Soundtrack';
      const artist = st.artist || 'Unknown';
      const note = st.note || '';
      const fullTrack = { ...st, url: songUrl, title, artist };
      const isPlaying = isTrackPlaying(fullTrack);

      if (songUrl) {
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

    // Process body — preserve HTML blocks (figures, images, headings, sticky notes)
    let body = entry.body || '';
    if (!/<(p|h2|h3|blockquote|ul|ol|figure|div|aside|img)/i.test(body)) {
      body = body.split(/\n{2,}/).map(p => `<p>${p.trim()}</p>`).join('\n');
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

    // Reader soundtrack & playlist controls
    const readerPlaylistCard = $('#reader-playlist-card');
    if (readerPlaylistCard) {
      readerPlaylistCard.addEventListener('click', (e) => {
        if (e.target.closest('.track-row-link')) return;
        const row = e.target.closest('.playlist-track-row');
        if (!row) return;
        const idx = parseInt(row.dataset.trackIndex, 10);
        if (playlist[idx]) {
          toggleTrack(playlist[idx], playlist, idx);
        }
      });
    }

    const readerPlayBtn = $('#reader-play-btn');
    if (readerPlayBtn) {
      readerPlayBtn.addEventListener('click', () => {
        try {
          const track = JSON.parse(readerPlayBtn.dataset.track);
          toggleTrack(track, playlist, 0);
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
      const entry = Data.getEntry(id);
      const isAuthor = Boolean((currentAuthSession && currentAuthSession.user) || Data.isAuthorMode());
      if (entry && Data.isDraft(entry) && !isAuthor) {
        showToast('This entry is currently an unpublished draft.');
        if (readerOpen) closeReader(false);
        history.pushState(null, '', window.location.pathname + window.location.search);
        return;
      }
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
        if (selectedCanvasCategory && ['nocturnal thoughts', 'memories', 'rants', 'brain dump'].includes(selectedCanvasCategory)) {
          dom.canvasTitle.placeholder = `e.g. ${selectedCanvasCategory} (or leave blank to auto-title)`;
        } else {
          dom.canvasTitle.placeholder = 'Title';
        }
      }
    }
  }

  let canvasPlaylist = [];

  function syncCanvasPlaylistFromDom() {
    if (!dom.canvasPlaylistList) return;
    const items = dom.canvasPlaylistList.querySelectorAll('.canvas-playlist-item');
    const updated = [];
    items.forEach((item) => {
      const urlInput = item.querySelector('.cpi-url');
      const titleInput = item.querySelector('.cpi-title');
      const artistInput = item.querySelector('.cpi-artist');
      const noteInput = item.querySelector('.cpi-note');
      updated.push({
        url: urlInput ? urlInput.value.trim() : '',
        title: titleInput ? titleInput.value.trim() : '',
        artist: artistInput ? artistInput.value.trim() : '',
        note: noteInput ? noteInput.value.trim() : ''
      });
    });
    canvasPlaylist = updated;
  }

  function renderCanvasPlaylist() {
    if (!dom.canvasPlaylistList) return;
    if (!canvasPlaylist || canvasPlaylist.length === 0) {
      canvasPlaylist = [{ title: '', artist: '', note: '', url: '' }];
    }

    dom.canvasPlaylistList.innerHTML = canvasPlaylist.map((t, idx) => `
      <div class="canvas-playlist-item" data-index="${idx}">
        <div class="canvas-playlist-item-top">
          <span class="canvas-playlist-num">${String(idx + 1).padStart(2, '0')}</span>
          <div class="canvas-playlist-item-actions">
            ${idx > 0 ? `<button type="button" class="cpi-btn cpi-up-btn" data-action="move-up" data-index="${idx}" title="Move track up">↑</button>` : ''}
            ${idx < canvasPlaylist.length - 1 ? `<button type="button" class="cpi-btn cpi-down-btn" data-action="move-down" data-index="${idx}" title="Move track down">↓</button>` : ''}
            <button type="button" class="cpi-btn cpi-del-btn" data-action="delete" data-index="${idx}" title="Remove track">×</button>
          </div>
        </div>
        <div class="canvas-playlist-inputs">
          <input type="url" class="canvas-inline-input cpi-url" data-index="${idx}" placeholder="Paste link (YouTube, Spotify, SoundCloud, MP3)…" value="${escapeHtml(t.url || '')}">
          <div class="canvas-soundtrack-meta-row">
            <input type="text" class="canvas-inline-input small cpi-title" data-index="${idx}" placeholder="Song Title" value="${escapeHtml(t.title || '')}">
            <input type="text" class="canvas-inline-input small cpi-artist" data-index="${idx}" placeholder="Artist" value="${escapeHtml(t.artist || '')}">
          </div>
          <input type="text" class="canvas-inline-input note cpi-note" data-index="${idx}" placeholder="Note / why this song fits (optional)" value="${escapeHtml(t.note || '')}">
        </div>
      </div>
    `).join('');
  }

  function toggleSoundtrackStrip(forceOpen) {
    if (!dom.canvasSoundtrackStrip) return;
    const isHidden = dom.canvasSoundtrackStrip.style.display === 'none' || !dom.canvasSoundtrackStrip.style.display;
    const open = forceOpen !== undefined ? forceOpen : isHidden;
    dom.canvasSoundtrackStrip.style.display = open ? 'block' : 'none';
    if (dom.canvasSoundtrackToggle) {
      dom.canvasSoundtrackToggle.classList.toggle('active', open);
    }
    if (open) {
      if (!canvasPlaylist || canvasPlaylist.length === 0) {
        canvasPlaylist = [{ title: '', artist: '', note: '', url: '' }];
      }
      renderCanvasPlaylist();
      const firstInput = dom.canvasPlaylistList ? dom.canvasPlaylistList.querySelector('.cpi-url') : null;
      if (firstInput) firstInput.focus();
    }
  }

  function removeSoundtrackStrip() {
    canvasPlaylist = [];
    if (dom.canvasPlaylistList) dom.canvasPlaylistList.innerHTML = '';
    toggleSoundtrackStrip(false);
  }

  async function handlePlaylistItemUrlAutoFill(inputEl) {
    if (!inputEl) return;
    const url = inputEl.value.trim();
    if (!url) return;

    const item = inputEl.closest('.canvas-playlist-item');
    if (!item) return;

    const titleInput = item.querySelector('.cpi-title');
    const artistInput = item.querySelector('.cpi-artist');
    const hintEl = dom.canvasSoundtrackStrip ? dom.canvasSoundtrackStrip.querySelector('.canvas-soundtrack-hint') : null;
    const defaultHint = 'Supports Spotify tracks/albums, YouTube / YT Music, SoundCloud, and direct MP3 audio files.';

    const parsed = parseTrackUrl(url);
    if (!parsed) return;

    if (hintEl) {
      hintEl.textContent = `Detected ${parsed.platform}. Fetching song details…`;
      hintEl.style.color = 'var(--accent-pine)';
    }

    try {
      if (parsed.type === 'youtube') {
        const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            let fullTitle = data.title.replace(/\(official\s*(music\s*)?video\)/i, '').replace(/\[official\s*(music\s*)?video\]/i, '').trim();
            if (fullTitle.includes(' - ')) {
              const parts = fullTitle.split(' - ');
              if (artistInput && !artistInput.value) artistInput.value = parts[0].trim();
              if (titleInput && !titleInput.value) titleInput.value = parts.slice(1).join(' - ').trim();
            } else {
              if (titleInput && !titleInput.value) titleInput.value = fullTitle;
              if (artistInput && !artistInput.value && data.author_name) {
                artistInput.value = data.author_name.replace(/- Topic$/i, '').trim();
              }
            }
          }
        }
      } else if (parsed.type === 'spotify') {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && titleInput && !titleInput.value) {
            titleInput.value = data.title;
          }
        }
      } else if (parsed.type === 'soundcloud') {
        const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            if (titleInput && !titleInput.value) titleInput.value = data.title;
            if (artistInput && !artistInput.value && data.author_name) artistInput.value = data.author_name;
          }
        }
      } else if (parsed.type === 'audio') {
        if (titleInput && !titleInput.value) {
          const filename = url.split('/').pop().split('?')[0].replace(/\.(mp3|m4a|wav|ogg|aac)$/i, '');
          titleInput.value = decodeURIComponent(filename).replace(/[-_]/g, ' ');
        }
      }

      syncCanvasPlaylistFromDom();

      if (hintEl) {
        hintEl.textContent = `Attached ${parsed.platform} track.`;
        hintEl.style.color = 'var(--accent-pine)';
        setTimeout(() => {
          if (hintEl) {
            hintEl.textContent = defaultHint;
            hintEl.style.color = 'var(--ink-muted)';
          }
        }, 3000);
      }
    } catch (err) {
      console.warn('Playlist URL auto-fill note:', err);
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
    try {
      document.execCommand(command, false, value);
    } catch (err) {
      console.warn('execCommand error:', err);
    }
    updateCanvasToolbarState();
  }

  function updateCanvasToolbarState() {
    if (!dom.canvasBody || isCanvasPreviewActive) return;

    // Direct command buttons (bold, italic, strikeThrough, justifyLeft, justifyCenter, justifyRight, justifyFull)
    $$('.canvas-format-btn[data-command]').forEach(btn => {
      const cmd = btn.dataset.command;
      try {
        if (document.queryCommandState && document.queryCommandState(cmd)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } catch (e) {
        btn.classList.remove('active');
      }
    });

    // Also update block style select (p, h2, h3)
    if (dom.canvasFormatBlock) {
      try {
        const blockVal = document.queryCommandValue('formatBlock');
        if (blockVal) {
          const clean = blockVal.toLowerCase().replace(/[<>]/g, '');
          if (['p', 'h2', 'h3'].includes(clean)) {
            dom.canvasFormatBlock.value = clean;
          }
        }
      } catch (e) {}
    }
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

  /* ═══════════════════════════════════════
     SAGE DOODLES & SCRAPBOOK BLOCKS
     ═══════════════════════════════════════ */

  const SAGE_DOODLES = {
    star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 L13.5 9.5 L21 12 L13.5 14.5 L12 22 L10.5 14.5 L3 12 L10.5 9.5 Z"/></svg>`,
    spiral: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12a1.5 1.5 0 0 1 1.5 1.5 3 3 0 0 1-3 3 4.5 4.5 0 0 1-4.5-4.5 6 6 0 0 1 6-6 7.5 7.5 0 0 1 7.5 7.5 9 9 0 0 1-9 9"/></svg>`,
    sprout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22 C 12 16, 8 13, 3 13 C 3 6, 9 2, 16 3 C 21 4, 22 10, 21 16 C 16 19, 13 22, 12 22 Z"/><path d="M12 22 C 13 15, 17 9, 21 5"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5 C 12 20.5, 3.5 14.5, 3.5 8.5 A 4.5 4.5 0 0 1 12 6.5 A 4.5 4.5 0 0 1 20.5 8.5 C 20.5 14.5, 12 20.5, 12 20.5 Z"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18 C 9 19, 15 15, 19 6 M 12 6 L 20 6 L 19 14"/></svg>`,
    squiggle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12 Q 5 7, 8 12 T 14 12 T 20 12 T 24 12"/></svg>`
  };

  function compressImageFile(file, maxWidth = 1000, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Selected file is not an image.'));
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return reject(new Error('Failed to create canvas 2D context.'));
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let dataUrl = '';
          try {
            dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl || !dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
          } catch (_) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not read image file. Please try another image.'));
      };

      img.src = objectUrl;
    });
  }

  function insertScrapbookMedia(type, content, align = 'right', withTape = true) {
    if (!dom.canvasBody) return;

    const block = document.createElement('figure');
    block.className = `scrapbook-block diary-media-block align-${align}${withTape ? ' with-tape' : ''}`;
    block.setAttribute('contenteditable', 'false');
    block.setAttribute('draggable', 'true');
    block.dataset.align = align;
    block.dataset.tape = withTape ? 'true' : 'false';

    let innerHtml = '<div class="scrapbook-tape" aria-hidden="true"></div>';
    if (type === 'image') {
      innerHtml += `
        <div class="scrapbook-inner">
          <img src="${escapeHtml(content)}" alt="Journal photo" class="scrapbook-img" loading="lazy">
          <figcaption class="scrapbook-caption" contenteditable="true" placeholder="add note…"></figcaption>
        </div>
      `;
    } else {
      const svgMarkup = SAGE_DOODLES[content] || SAGE_DOODLES.star;
      innerHtml += `
        <div class="scrapbook-inner">
          <div class="scrapbook-doodle-inner">
            ${svgMarkup}
          </div>
          <figcaption class="scrapbook-caption" contenteditable="true" placeholder="add note…"></figcaption>
        </div>
      `;
    }

    block.innerHTML = innerHtml;
    attachScrapbookToolbar(block);
    attachMediaBlockDnD(block);

    // Determine insertion position:
    const sel = window.getSelection();
    let inserted = false;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (dom.canvasBody.contains(range.commonAncestorContainer)) {
        let cur = range.commonAncestorContainer;
        let isNested = false;
        while (cur && cur !== dom.canvasBody) {
          if (cur.classList && (cur.classList.contains('diary-sticky-note') || cur.classList.contains('scrapbook-block') || cur.classList.contains('diary-media-block'))) {
            isNested = true;
            break;
          }
          cur = cur.parentNode;
        }

        if (!isNested) {
          range.deleteContents();
          range.insertNode(block);
          inserted = true;
        }
      }
    }

    // Fallback: If not focused or cursor outside canvasBody, append cleanly to end of canvasBody
    if (!inserted) {
      dom.canvasBody.appendChild(block);
    }

    // Select the newly inserted block
    dom.canvasBody.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => b.classList.remove('is-selected'));
    block.classList.add('is-selected');

    // Ensure a paragraph follows for continued writing
    const nextNode = block.nextSibling;
    if (!nextNode || (nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent.trim())) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      if (nextNode) {
        block.parentNode.insertBefore(p, nextNode);
      } else {
        block.parentNode.appendChild(p);
      }
    }

    try {
      block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (_) {}
  }

  function attachScrapbookToolbar(block) {
    if (!block || block.querySelector('.scrapbook-toolbar')) return;
    const align = block.dataset.align || 'right';
    const hasTape = block.dataset.tape === 'true' || block.classList.contains('with-tape');
    const isImage = !!block.querySelector('img');

    const toolbar = document.createElement('div');
    toolbar.className = 'scrapbook-toolbar';
    toolbar.setAttribute('contenteditable', 'false');
    toolbar.innerHTML = `
      <button type="button" class="sb-tool-btn${align === 'left' ? ' active' : ''}" data-align="left" title="Float Left">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
      </button>
      <button type="button" class="sb-tool-btn${align === 'center' ? ' active' : ''}" data-align="center" title="Center">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
      </button>
      <button type="button" class="sb-tool-btn${align === 'right' ? ' active' : ''}" data-align="right" title="Float Right">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="9" y2="12"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
      </button>
      <button type="button" class="sb-tool-btn" data-action="move-up" title="Move Up (before paragraph)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
      </button>
      <button type="button" class="sb-tool-btn" data-action="move-down" title="Move Down (after paragraph)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
      </button>
      ${isImage ? `
      <button type="button" class="sb-tool-btn sb-crop-btn" data-action="crop" title="Crop image">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
      </button>` : ''}
      <button type="button" class="sb-tool-btn${hasTape ? ' active' : ''}" data-toggle="tape" title="Toggle washi tape">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="10" rx="1"></rect><line x1="8" y1="7" x2="8" y2="17"></line><line x1="16" y1="7" x2="16" y2="17"></line></svg>
      </button>
      <button type="button" class="sb-tool-btn sb-del-btn" data-action="delete" title="Delete photo/doodle">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    block.appendChild(toolbar);
  }

  let draggedMediaBlock = null;

  function attachMediaBlockDnD(block) {
    if (!block || block._dndAttached) return;
    block._dndAttached = true;
    block.setAttribute('draggable', 'true');

    block.addEventListener('dragstart', (e) => {
      draggedMediaBlock = block;
      block.classList.add('is-dragging');
      try {
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
      } catch (_) {}
    });

    block.addEventListener('dragend', () => {
      if (draggedMediaBlock) {
        draggedMediaBlock.classList.remove('is-dragging');
        draggedMediaBlock = null;
      }
      if (dom.canvasBody) {
        dom.canvasBody.querySelectorAll('.drop-target-above, .drop-target-below').forEach(el => {
          el.classList.remove('drop-target-above', 'drop-target-below');
        });
      }
    });
  }

  function initCanvasDnD() {
    if (!dom.canvasBody || dom.canvasBody._dndInit) return;
    dom.canvasBody._dndInit = true;

    dom.canvasBody.addEventListener('dragover', (e) => {
      if (!draggedMediaBlock) return;
      e.preventDefault();
      try { e.dataTransfer.dropEffect = 'move'; } catch (_) {}

      const target = e.target.closest('p, h2, h3, blockquote, .scrapbook-block, .diary-sticky-note');
      dom.canvasBody.querySelectorAll('.drop-target-above, .drop-target-below').forEach(el => {
        if (el !== target) el.classList.remove('drop-target-above', 'drop-target-below');
      });

      if (target && target !== draggedMediaBlock) {
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          target.classList.add('drop-target-above');
          target.classList.remove('drop-target-below');
        } else {
          target.classList.add('drop-target-below');
          target.classList.remove('drop-target-above');
        }
      }
    });

    dom.canvasBody.addEventListener('dragleave', (e) => {
      if (e.target === dom.canvasBody) {
        dom.canvasBody.querySelectorAll('.drop-target-above, .drop-target-below').forEach(el => {
          el.classList.remove('drop-target-above', 'drop-target-below');
        });
      }
    });

    dom.canvasBody.addEventListener('drop', (e) => {
      if (!draggedMediaBlock) return;
      e.preventDefault();
      const target = e.target.closest('p, h2, h3, blockquote, .scrapbook-block, .diary-sticky-note');
      dom.canvasBody.querySelectorAll('.drop-target-above, .drop-target-below').forEach(el => {
        el.classList.remove('drop-target-above', 'drop-target-below');
      });

      if (target && target !== draggedMediaBlock) {
        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        if (e.clientY < midY) {
          target.parentNode.insertBefore(draggedMediaBlock, target);
        } else {
          if (target.nextElementSibling) {
            target.parentNode.insertBefore(draggedMediaBlock, target.nextElementSibling);
          } else {
            target.parentNode.appendChild(draggedMediaBlock);
          }
        }
        draggedMediaBlock.classList.add('is-selected');
      }
      draggedMediaBlock.classList.remove('is-dragging');
      draggedMediaBlock = null;
    });
  }

  function ensureScrapbookBlockEditorControls(container) {
    if (!container) return;
    initCanvasDnD();
    container.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(block => {
      block.classList.add('scrapbook-block', 'diary-media-block');
      const existingToolbar = block.querySelector('.scrapbook-toolbar');
      if (existingToolbar) {
        if (block.querySelector('img') && !existingToolbar.querySelector('.sb-crop-btn')) {
          existingToolbar.remove();
          attachScrapbookToolbar(block);
        }
      } else {
        attachScrapbookToolbar(block);
      }
      attachMediaBlockDnD(block);
    });
  }

  /* ═══════════════════════════════════════
     IMAGE CROPPING TOOL
     ═══════════════════════════════════════ */

  let cropState = {
    isOpen: false,
    originalSrc: '',
    currentSrc: '',
    aspectRatio: 'free', // 'free', '1:1', '4:3', '3:4', '16:9'
    onApply: null,
    boxX: 0,
    boxY: 0,
    boxW: 0,
    boxH: 0,
    stageW: 0,
    stageH: 0,
    naturalW: 0,
    naturalH: 0,
    isDraggingBox: false,
    activeHandle: null,
    dragStartX: 0,
    dragStartY: 0,
    startBoxX: 0,
    startBoxY: 0,
    startBoxW: 0,
    startBoxH: 0,
  };

  function getCropDom() {
    return {
      modal: $('#crop-modal'),
      closeBtn: $('#crop-modal-close'),
      cancelBtn: $('#crop-cancel-btn'),
      applyBtn: $('#crop-apply-btn'),
      rotateBtn: $('#crop-rotate-btn'),
      resetBtn: $('#crop-reset-btn'),
      stageContainer: $('#crop-stage-container'),
      stage: $('#crop-stage'),
      stageImg: $('#crop-stage-img'),
      box: $('#crop-box'),
      aspectBtns: $$('.crop-aspect-btn'),
    };
  }

  function openCropModal(sourceSrc, onApplyCallback) {
    if (!sourceSrc) return;
    const cd = getCropDom();
    if (!cd.modal || !cd.stageImg || !cd.box) return;

    cropState.isOpen = true;
    cropState.originalSrc = sourceSrc;
    cropState.currentSrc = sourceSrc;
    cropState.aspectRatio = 'free';
    cropState.onApply = onApplyCallback;

    if (cd.aspectBtns) {
      cd.aspectBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.ratio === 'free');
      });
    }

    cd.modal.classList.add('open');
    loadCropperImage(sourceSrc);
  }

  function loadCropperImage(src) {
    const cd = getCropDom();
    if (!cd.stageImg) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      cropState.naturalW = img.naturalWidth || img.width;
      cropState.naturalH = img.naturalHeight || img.height;
      cd.stageImg.src = src;
      requestAnimationFrame(() => {
        setupCropperStageAndBox();
      });
    };
    img.onerror = () => {
      if (img.crossOrigin) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          cropState.naturalW = fallbackImg.naturalWidth || fallbackImg.width;
          cropState.naturalH = fallbackImg.naturalHeight || fallbackImg.height;
          cd.stageImg.src = src;
          requestAnimationFrame(() => setupCropperStageAndBox());
        };
        fallbackImg.src = src;
      }
    };
    img.src = src;
  }

  function setupCropperStageAndBox() {
    const cd = getCropDom();
    if (!cd.stageImg || !cd.stage || !cd.box) return;

    const dispW = cd.stageImg.offsetWidth;
    const dispH = cd.stageImg.offsetHeight;
    if (dispW === 0 || dispH === 0) {
      setTimeout(setupCropperStageAndBox, 50);
      return;
    }

    cropState.stageW = dispW;
    cropState.stageH = dispH;
    cd.stage.style.width = `${dispW}px`;
    cd.stage.style.height = `${dispH}px`;

    fitCropBoxToRatio(cropState.aspectRatio);
  }

  function fitCropBoxToRatio(ratioStr) {
    const cd = getCropDom();
    if (!cd.box) return;

    const sW = cropState.stageW;
    const sH = cropState.stageH;
    if (!sW || !sH) return;

    let targetRatio = null;
    if (ratioStr === '1:1') targetRatio = 1;
    else if (ratioStr === '4:3') targetRatio = 4 / 3;
    else if (ratioStr === '3:4') targetRatio = 3 / 4;
    else if (ratioStr === '16:9') targetRatio = 16 / 9;

    let bw, bh;
    if (!targetRatio) {
      bw = Math.round(sW * 0.85);
      bh = Math.round(sH * 0.85);
    } else {
      bw = sW * 0.85;
      bh = bw / targetRatio;
      if (bh > sH * 0.85) {
        bh = sH * 0.85;
        bw = bh * targetRatio;
      }
      bw = Math.round(bw);
      bh = Math.round(bh);
    }

    cropState.boxW = Math.max(30, Math.min(sW, bw));
    cropState.boxH = Math.max(30, Math.min(sH, bh));
    cropState.boxX = Math.round((sW - cropState.boxW) / 2);
    cropState.boxY = Math.round((sH - cropState.boxH) / 2);

    updateCropBoxDOM();
  }

  function updateCropBoxDOM() {
    const cd = getCropDom();
    if (!cd.box) return;
    cd.box.style.left = `${cropState.boxX}px`;
    cd.box.style.top = `${cropState.boxY}px`;
    cd.box.style.width = `${cropState.boxW}px`;
    cd.box.style.height = `${cropState.boxH}px`;
  }

  function handleCropResize(handle, dx, dy) {
    const sW = cropState.stageW;
    const sH = cropState.stageH;
    const minSize = 25;

    let initX = cropState.startBoxX;
    let initY = cropState.startBoxY;
    let initW = cropState.startBoxW;
    let initH = cropState.startBoxH;

    let targetRatio = null;
    if (cropState.aspectRatio === '1:1') targetRatio = 1;
    else if (cropState.aspectRatio === '4:3') targetRatio = 4 / 3;
    else if (cropState.aspectRatio === '3:4') targetRatio = 3 / 4;
    else if (cropState.aspectRatio === '16:9') targetRatio = 16 / 9;

    let newX = initX;
    let newY = initY;
    let newW = initW;
    let newH = initH;

    if (!targetRatio) {
      if (handle.includes('e')) {
        newW = Math.max(minSize, Math.min(sW - initX, initW + dx));
      }
      if (handle.includes('s')) {
        newH = Math.max(minSize, Math.min(sH - initY, initH + dy));
      }
      if (handle.includes('w')) {
        const maxLeft = initX + initW - minSize;
        newX = Math.max(0, Math.min(maxLeft, initX + dx));
        newW = initW - (newX - initX);
      }
      if (handle.includes('n')) {
        const maxTop = initY + initH - minSize;
        newY = Math.max(0, Math.min(maxTop, initY + dy));
        newH = initH - (newY - initY);
      }
    } else {
      if (handle === 'se') {
        newW = Math.max(minSize, Math.min(sW - initX, initW + dx));
        newH = newW / targetRatio;
        if (initY + newH > sH) {
          newH = sH - initY;
          newW = newH * targetRatio;
        }
      } else if (handle === 'sw') {
        newW = Math.max(minSize, Math.min(initX + initW, initW - dx));
        newH = newW / targetRatio;
        if (initY + newH > sH) {
          newH = sH - initY;
          newW = newH * targetRatio;
        }
        newX = initX + initW - newW;
      } else if (handle === 'ne') {
        newW = Math.max(minSize, Math.min(sW - initX, initW + dx));
        newH = newW / targetRatio;
        if (initY + initH - newH < 0) {
          newH = initY + initH;
          newW = newH * targetRatio;
        }
        newY = initY + initH - newH;
      } else if (handle === 'nw') {
        newW = Math.max(minSize, Math.min(initX + initW, initW - dx));
        newH = newW / targetRatio;
        if (initY + initH - newH < 0) {
          newH = initY + initH;
          newW = newH * targetRatio;
        }
        newX = initX + initW - newW;
        newY = initY + initH - newH;
      } else if (handle === 'e' || handle === 'w') {
        if (handle === 'e') {
          newW = Math.max(minSize, Math.min(sW - initX, initW + dx));
        } else {
          const maxLeft = initX + initW - minSize;
          newX = Math.max(0, Math.min(maxLeft, initX + dx));
          newW = initW - (newX - initX);
        }
        newH = newW / targetRatio;
        const cy = initY + initH / 2;
        newY = cy - newH / 2;
        if (newY < 0) {
          newY = 0;
          if (newH > sH) { newH = sH; newW = newH * targetRatio; }
        } else if (newY + newH > sH) {
          newY = sH - newH;
          if (newY < 0) { newY = 0; newH = sH; newW = newH * targetRatio; }
        }
      } else if (handle === 'n' || handle === 's') {
        if (handle === 's') {
          newH = Math.max(minSize, Math.min(sH - initY, initH + dy));
        } else {
          const maxTop = initY + initH - minSize;
          newY = Math.max(0, Math.min(maxTop, initY + dy));
          newH = initH - (newY - initY);
        }
        newW = newH * targetRatio;
        const cx = initX + initW / 2;
        newX = cx - newW / 2;
        if (newX < 0) {
          newX = 0;
          if (newW > sW) { newW = sW; newH = newW / targetRatio; }
        } else if (newX + newW > sW) {
          newX = sW - newW;
          if (newX < 0) { newX = 0; newW = sW; newH = newW / targetRatio; }
        }
      }
    }

    newW = Math.max(minSize, Math.min(sW, newW));
    newH = Math.max(minSize, Math.min(sH, newH));
    newX = Math.max(0, Math.min(sW - newW, newX));
    newY = Math.max(0, Math.min(sH - newH, newY));

    cropState.boxX = Math.round(newX);
    cropState.boxY = Math.round(newY);
    cropState.boxW = Math.round(newW);
    cropState.boxH = Math.round(newH);

    updateCropBoxDOM();
  }

  function rotateCurrentImage90() {
    const cd = getCropDom();
    if (!cd.stageImg || !cd.stageImg.src) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = origH;
      canvas.height = origW;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -origW / 2, -origH / 2);

      let rotatedUrl = '';
      try {
        rotatedUrl = canvas.toDataURL('image/webp', 0.92);
        if (!rotatedUrl || !rotatedUrl.startsWith('data:image/webp')) {
          rotatedUrl = canvas.toDataURL('image/jpeg', 0.92);
        }
      } catch (_) {
        rotatedUrl = canvas.toDataURL('image/jpeg', 0.92);
      }

      cropState.currentSrc = rotatedUrl;
      loadCropperImage(rotatedUrl);
    };
    img.src = cropState.currentSrc;
  }

  function applyCroppedResult() {
    const cd = getCropDom();
    if (!cd.stageImg) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        const dispW = cropState.stageW;
        const dispH = cropState.stageH;

        const scaleX = natW / dispW;
        const scaleY = natH / dispH;

        const cropX = Math.max(0, Math.round(cropState.boxX * scaleX));
        const cropY = Math.max(0, Math.round(cropState.boxY * scaleY));
        const cropW = Math.min(natW - cropX, Math.round(cropState.boxW * scaleX));
        const cropH = Math.min(natH - cropY, Math.round(cropState.boxH * scaleY));

        if (cropW <= 0 || cropH <= 0) {
          closeCropModal();
          return;
        }

        const maxOut = 1200;
        let outW = cropW;
        let outH = cropH;
        if (outW > maxOut || outH > maxOut) {
          if (outW >= outH) {
            outH = Math.round((outH * maxOut) / outW);
            outW = maxOut;
          } else {
            outW = Math.round((outW * maxOut) / outH);
            outH = maxOut;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, outW);
        canvas.height = Math.max(1, outH);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context unavailable.');

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, outW, outH);
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH);

        let finalUrl = '';
        try {
          finalUrl = canvas.toDataURL('image/webp', 0.88);
          if (!finalUrl || !finalUrl.startsWith('data:image/webp')) {
            finalUrl = canvas.toDataURL('image/jpeg', 0.88);
          }
        } catch (_) {
          finalUrl = canvas.toDataURL('image/jpeg', 0.88);
        }

        if (typeof cropState.onApply === 'function') {
          cropState.onApply(finalUrl);
        }
        closeCropModal();
      } catch (err) {
        console.error('Error applying crop:', err);
        alert('Could not apply crop. If using an external image, try uploading a local image instead.');
      }
    };
    img.onerror = () => {
      alert('Failed to load image for cropping.');
    };
    img.src = cropState.currentSrc;
  }

  function closeCropModal() {
    const cd = getCropDom();
    if (cd.modal) {
      cd.modal.classList.remove('open');
    }
    cropState.isOpen = false;
    cropState.isDraggingBox = false;
    cropState.activeHandle = null;
    cropState.onApply = null;
  }

  function initCropperEvents() {
    const cd = getCropDom();
    if (!cd.modal || cd.modal._cropInit) return;
    cd.modal._cropInit = true;

    if (cd.aspectBtns) {
      cd.aspectBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const ratio = btn.dataset.ratio;
          cropState.aspectRatio = ratio;
          cd.aspectBtns.forEach(b => b.classList.toggle('active', b === btn));
          fitCropBoxToRatio(ratio);
        });
      });
    }

    if (cd.rotateBtn) {
      cd.rotateBtn.addEventListener('click', () => {
        rotateCurrentImage90();
      });
    }

    if (cd.resetBtn) {
      cd.resetBtn.addEventListener('click', () => {
        cropState.currentSrc = cropState.originalSrc;
        cropState.aspectRatio = 'free';
        if (cd.aspectBtns) {
          cd.aspectBtns.forEach(b => b.classList.toggle('active', b.dataset.ratio === 'free'));
        }
        loadCropperImage(cropState.originalSrc);
      });
    }

    const handleClose = () => closeCropModal();
    if (cd.closeBtn) cd.closeBtn.addEventListener('click', handleClose);
    if (cd.cancelBtn) cd.cancelBtn.addEventListener('click', handleClose);
    cd.modal.addEventListener('click', (e) => {
      if (e.target === cd.modal) handleClose();
    });

    if (cd.applyBtn) {
      cd.applyBtn.addEventListener('click', () => {
        applyCroppedResult();
      });
    }

    if (cd.box) {
      cd.box.addEventListener('pointerdown', (e) => {
        const handleEl = e.target.closest('.crop-handle');
        if (handleEl) {
          e.preventDefault();
          e.stopPropagation();
          cropState.activeHandle = handleEl.dataset.handle;
          cropState.isDraggingBox = false;
        } else {
          e.preventDefault();
          cropState.isDraggingBox = true;
          cropState.activeHandle = null;
        }

        cropState.dragStartX = e.clientX;
        cropState.dragStartY = e.clientY;
        cropState.startBoxX = cropState.boxX;
        cropState.startBoxY = cropState.boxY;
        cropState.startBoxW = cropState.boxW;
        cropState.startBoxH = cropState.boxH;

        try { cd.box.setPointerCapture(e.pointerId); } catch (_) {}
      });

      cd.box.addEventListener('pointermove', (e) => {
        if (!cropState.isDraggingBox && !cropState.activeHandle) return;
        e.preventDefault();

        const dx = e.clientX - cropState.dragStartX;
        const dy = e.clientY - cropState.dragStartY;
        const sW = cropState.stageW;
        const sH = cropState.stageH;

        if (cropState.isDraggingBox) {
          let nx = cropState.startBoxX + dx;
          let ny = cropState.startBoxY + dy;
          nx = Math.max(0, Math.min(sW - cropState.boxW, nx));
          ny = Math.max(0, Math.min(sH - cropState.boxH, ny));
          cropState.boxX = nx;
          cropState.boxY = ny;
          updateCropBoxDOM();
          return;
        }

        if (cropState.activeHandle) {
          handleCropResize(cropState.activeHandle, dx, dy);
        }
      });

      const finishPointer = (e) => {
        if (cropState.isDraggingBox || cropState.activeHandle) {
          cropState.isDraggingBox = false;
          cropState.activeHandle = null;
          try { cd.box.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };

      cd.box.addEventListener('pointerup', finishPointer);
      cd.box.addEventListener('pointercancel', finishPointer);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && cropState.isOpen) {
        closeCropModal();
      }
    });
  }

  /* ═══════════════════════════════════════
     STICKY NOTES & DRAGGING
     ═══════════════════════════════════════ */

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

    // Prevent nesting inside another sticky note or scrapbook block
    let parent = range.commonAncestorContainer;
    while (parent && parent !== dom.canvasBody) {
      if (parent.classList && (parent.classList.contains('diary-sticky-note') || parent.classList.contains('scrapbook-block'))) {
        return;
      }
      parent = parent.parentNode;
    }

    const selectedText = range.toString().trim();
    const noteText = selectedText || 'side note: small things keeping me sane today…';

    const aside = document.createElement('aside');
    aside.className = 'diary-sticky-note';
    aside.dataset.offsetX = '0';
    aside.dataset.offsetY = '0';
    aside.style.transform = 'translate(0px, 0px) rotate(-1.5deg)';
    aside.innerHTML = `
      <button type="button" class="sticky-note-del-btn" title="Remove sticky note" contenteditable="false" aria-label="Remove sticky note">×</button>
      <div class="sticky-note-drag-handle" title="Drag to reposition note" contenteditable="false"><span class="drag-dots" aria-hidden="true">⋮⋮</span></div>
      <p>${escapeHtml(noteText)}</p>
    `;

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

    initStickyNoteDragging(dom.canvasBody);

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

  function initStickyNoteDragging(container) {
    if (!container) return;
    container.querySelectorAll('.diary-sticky-note').forEach(note => {
      if (note._dragAttached) return;
      note._dragAttached = true;

      if (!note.querySelector('.sticky-note-drag-handle')) {
        const handle = document.createElement('div');
        handle.className = 'sticky-note-drag-handle';
        handle.setAttribute('contenteditable', 'false');
        handle.setAttribute('title', 'Drag to reposition note');
        handle.innerHTML = '<span class="drag-dots" aria-hidden="true">⋮⋮</span>';
        note.insertBefore(handle, note.firstChild);
      }

      let curX = parseFloat(note.dataset.offsetX) || 0;
      let curY = parseFloat(note.dataset.offsetY) || 0;
      if (!note.dataset.offsetX && note.style.transform) {
        const m = note.style.transform.match(/translate\(\s*(-?\d+(?:\.\d+)?)\s*px,\s*(-?\d+(?:\.\d+)?)\s*px\)/i);
        if (m) {
          curX = parseFloat(m[1]) || 0;
          curY = parseFloat(m[2]) || 0;
          note.dataset.offsetX = curX;
          note.dataset.offsetY = curY;
        }
      }

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let startOffsetX = 0;
      let startOffsetY = 0;

      const handlePointerDown = (e) => {
        if (e.target.closest('.sticky-note-del-btn')) return;

        const isHandle = e.target.closest('.sticky-note-drag-handle');
        const rect = note.getBoundingClientRect();
        const isTopEdge = (e.clientY - rect.top) <= 24;

        if (!isHandle && !isTopEdge && e.target.closest('p, ul, ol, li')) {
          return;
        }

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startOffsetX = parseFloat(note.dataset.offsetX) || 0;
        startOffsetY = parseFloat(note.dataset.offsetY) || 0;

        try { note.setPointerCapture(e.pointerId); } catch (_) {}
        note.classList.add('is-dragging');
        e.preventDefault();
      };

      const handlePointerMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const nextX = Math.round(startOffsetX + dx);
        const nextY = Math.round(startOffsetY + dy);

        note.dataset.offsetX = nextX;
        note.dataset.offsetY = nextY;
        note.style.transform = `translate(${nextX}px, ${nextY}px) rotate(-1.5deg)`;
      };

      const handlePointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        try { note.releasePointerCapture(e.pointerId); } catch (_) {}
        note.classList.remove('is-dragging');
      };

      note.addEventListener('pointerdown', handlePointerDown);
      note.addEventListener('pointermove', handlePointerMove);
      note.addEventListener('pointerup', handlePointerUp);
      note.addEventListener('pointercancel', handlePointerUp);
    });
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
    initStickyNoteDragging(container);
  }

  function getCleanCanvasBodyHtml() {
    if (!dom.canvasBody) return '';
    const clone = dom.canvasBody.cloneNode(true);
    clone.querySelectorAll('.sticky-note-del-btn').forEach(btn => btn.remove());
    clone.querySelectorAll('.sticky-note-drag-handle').forEach(h => h.remove());
    clone.querySelectorAll('.scrapbook-toolbar').forEach(tb => tb.remove());
    clone.querySelectorAll('.diary-sticky-note').forEach(note => {
      note.classList.remove('is-dragging');
    });
    clone.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => {
      b.classList.remove('is-selected', 'is-dragging', 'drop-target-above', 'drop-target-below');
      b.removeAttribute('draggable');
    });
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
        } else if (['nocturnal thoughts', 'memories', 'rants', 'brain dump'].includes(cat)) {
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
        syncCanvasPlaylistFromDom();
        const validTracks = (canvasPlaylist || []).filter(t => (t.title && t.title.trim()) || (t.url && t.url.trim()));
        if (validTracks.length > 1) {
          dom.canvasPreviewSoundtrack.innerHTML = `
            <div class="entry-playlist-card" style="margin:16px 0;">
              <div class="playlist-header">
                <div class="soundtrack-kicker">
                  ${ICONS.cassette}
                  <span>PLAYLIST PREVIEW · ${validTracks.length} TRACKS</span>
                </div>
              </div>
              <div class="playlist-tracks">
                ${validTracks.map((t, idx) => `
                  <div class="playlist-track-row" style="cursor:default;">
                    <span class="track-num">${String(idx + 1).padStart(2, '0')}</span>
                    <button type="button" class="track-row-play-btn" style="cursor:default;" aria-hidden="true">${ICONS.play}</button>
                    <div class="track-row-info">
                      <span class="track-row-title">${escapeHtml(t.title || 'Soundtrack')}</span>
                      ${t.artist ? `<span class="track-row-artist">— ${escapeHtml(t.artist)}</span>` : ''}
                      ${t.note ? `<span class="track-row-note">(${escapeHtml(t.note)})</span>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          dom.canvasPreviewSoundtrack.style.display = 'block';
        } else if (validTracks.length === 1) {
          const t = validTracks[0];
          dom.canvasPreviewSoundtrack.innerHTML = `
            <div class="song-pill song-pill--preview" style="cursor:default;">
              <span class="pill-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
              </span>
              <span class="pill-title">${escapeHtml(t.title || 'Soundtrack')}</span>
              ${t.artist ? `<span class="pill-artist">— ${escapeHtml(t.artist)}</span>` : ''}
              ${t.note ? `<span class="pill-note" style="opacity:0.75; font-size:11px; margin-left:4px;">(${escapeHtml(t.note)})</span>` : ''}
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

  /* ═══════════════════════════════════════
     QUICK SKETCH COMPOSER & LIGHTBOX ENGINE
     ═══════════════════════════════════════ */

  let currentEditorMode = 'journal'; // 'journal' or 'sketch'
  let currentSketchInputTab = 'draw'; // 'draw' or 'upload'
  let sketchInkColor = '#1E2E24';
  let sketchBrushSize = 2;
  let sketchIsDrawing = false;
  let sketchUndoStack = [];
  let sketchUploadedDataUrl = '';
  let selectedSketchTag = 'sketches';
  let sketchHasDrawn = false;

  function switchEditorMode(mode) {
    currentEditorMode = mode;
    if (dom.modeJournalBtn && dom.modeSketchBtn) {
      dom.modeJournalBtn.classList.toggle('active', mode === 'journal');
      dom.modeJournalBtn.setAttribute('aria-selected', mode === 'journal' ? 'true' : 'false');
      dom.modeSketchBtn.classList.toggle('active', mode === 'sketch');
      dom.modeSketchBtn.setAttribute('aria-selected', mode === 'sketch' ? 'true' : 'false');
    }

    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;

    if (mode === 'journal') {
      if (dom.canvasEditArea) dom.canvasEditArea.style.display = 'block';
      if (dom.canvasSketchArea) dom.canvasSketchArea.style.display = 'none';
      if (dom.canvasFormatBar) dom.canvasFormatBar.style.display = 'flex';
      if (dom.canvasHistoryGroup) dom.canvasHistoryGroup.style.display = 'flex';
      if (dom.canvasPreviewBtn) dom.canvasPreviewBtn.style.display = 'inline-block';
      if (publishBtnSpan) {
        publishBtnSpan.textContent = editingPostId ? 'Save Changes' : 'Publish';
      }
    } else {
      // 'sketch' mode
      if (dom.canvasEditArea) dom.canvasEditArea.style.display = 'none';
      if (dom.canvasPreviewArea) dom.canvasPreviewArea.style.display = 'none';
      if (dom.canvasSketchArea) dom.canvasSketchArea.style.display = 'block';
      if (dom.canvasFormatBar) dom.canvasFormatBar.style.display = 'none';
      if (dom.canvasHistoryGroup) dom.canvasHistoryGroup.style.display = 'none';
      if (dom.canvasPreviewBtn) dom.canvasPreviewBtn.style.display = 'none';
      if (publishBtnSpan) {
        publishBtnSpan.textContent = editingPostId ? 'Save Sketch' : 'Post Sketch';
      }

      initSketchCanvasIfNeeded();
    }
  }

  function initSketchCanvasIfNeeded() {
    if (!dom.sketchDrawingCanvas) return;
    const canvas = dom.sketchDrawingCanvas;
    if (canvas._sketchInit) return;
    canvas._sketchInit = true;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushSketchUndo();

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sketchIsDrawing = true;
      sketchHasDrawn = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (_) {}

      const pt = getCanvasPointerPos(canvas, e);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.strokeStyle = sketchInkColor;
      ctx.lineWidth = sketchBrushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
      ctx.stroke();
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!sketchIsDrawing) return;
      e.preventDefault();
      const pt = getCanvasPointerPos(canvas, e);
      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
    });

    const endStroke = (e) => {
      if (!sketchIsDrawing) return;
      sketchIsDrawing = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      pushSketchUndo();
    };

    canvas.addEventListener('pointerup', endStroke);
    canvas.addEventListener('pointercancel', endStroke);
  }

  function getCanvasPointerPos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function pushSketchUndo() {
    if (!dom.sketchDrawingCanvas) return;
    try {
      const dataUrl = dom.sketchDrawingCanvas.toDataURL();
      sketchUndoStack.push(dataUrl);
      if (sketchUndoStack.length > 25) sketchUndoStack.shift();
    } catch (_) {}
  }

  function undoSketchStroke() {
    if (!dom.sketchDrawingCanvas || sketchUndoStack.length <= 1) {
      clearSketchPad();
      return;
    }
    sketchUndoStack.pop();
    const previous = sketchUndoStack[sketchUndoStack.length - 1];
    if (previous) {
      const img = new Image();
      img.onload = () => {
        const ctx = dom.sketchDrawingCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, dom.sketchDrawingCanvas.width, dom.sketchDrawingCanvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = previous;
    }
  }

  function clearSketchPad() {
    if (!dom.sketchDrawingCanvas) return;
    const ctx = dom.sketchDrawingCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, dom.sketchDrawingCanvas.width, dom.sketchDrawingCanvas.height);
      sketchUndoStack = [];
      sketchHasDrawn = false;
      pushSketchUndo();
    }
  }

  function switchSketchInputTab(tab) {
    currentSketchInputTab = tab;
    if (dom.sketchTabDraw && dom.sketchTabUpload) {
      dom.sketchTabDraw.classList.toggle('active', tab === 'draw');
      dom.sketchTabDraw.setAttribute('aria-selected', tab === 'draw' ? 'true' : 'false');
      dom.sketchTabUpload.classList.toggle('active', tab === 'upload');
      dom.sketchTabUpload.setAttribute('aria-selected', tab === 'upload' ? 'true' : 'false');
    }
    if (dom.sketchDrawPanel) dom.sketchDrawPanel.style.display = tab === 'draw' ? 'block' : 'none';
    if (dom.sketchUploadPanel) dom.sketchUploadPanel.style.display = tab === 'upload' ? 'block' : 'none';
  }

  function updateSketchCharCounter() {
    if (!dom.sketchCaption || !dom.sketchCharCounter) return;
    const len = dom.sketchCaption.value.length;
    const remaining = 280 - len;
    dom.sketchCharCounter.textContent = remaining;
    dom.sketchCharCounter.classList.toggle('warning', remaining <= 20);
  }

  function handleSketchSave(isDraft = false) {
    const caption = dom.sketchCaption ? dom.sketchCaption.value.trim() : '';

    let sketchImg = '';
    if (currentSketchInputTab === 'upload') {
      sketchImg = sketchUploadedDataUrl || '';
    } else {
      if (sketchHasDrawn && dom.sketchDrawingCanvas) {
        try {
          sketchImg = dom.sketchDrawingCanvas.toDataURL('image/webp', 0.88);
          if (!sketchImg || !sketchImg.startsWith('data:image/webp')) {
            sketchImg = dom.sketchDrawingCanvas.toDataURL('image/jpeg', 0.88);
          }
        } catch (_) {
          sketchImg = dom.sketchDrawingCanvas.toDataURL('image/jpeg', 0.88);
        }
      }
    }

    if (!isDraft && !caption && !sketchImg) {
      alert('Please add a drawing or write a quick thought for your sketch.');
      return;
    }

    const now = new Date();
    const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let title = '';
    if (caption) {
      title = caption.length > 36 ? caption.slice(0, 34) + '…' : caption;
    } else {
      title = isDraft ? `sketch (draft) — ${monthDay}` : `quick sketch — ${monthDay}`;
    }

    const sketchTag = selectedSketchTag || 'sketches';
    const tags = [sketchTag];

    const sketchPayload = {
      caption: caption,
      sketch_url: sketchImg,
      post_type: 'sketch'
    };

    let rawBody = `<!--__SKETCH_POST__${JSON.stringify(sketchPayload)}-->`;
    if (caption) {
      rawBody += `<p>${escapeHtml(caption)}</p>`;
    }
    if (sketchImg) {
      rawBody += `<figure class="scrapbook-block align-center"><img src="${sketchImg}" alt="Sketch by zee" /></figure>`;
    }

    const dateVal = now.toISOString().slice(0, 10);
    const isEdit = Boolean(editingPostId);
    const targetId = editingPostId;

    const entry = {
      title,
      subtitle: caption,
      date: dateVal,
      tags,
      tag: sketchTag,
      body: rawBody,
      content: rawBody,
      cover_image: sketchImg,
      coverGradient: null,
      readingTime: 1,
      reading_time: 1,
      published: !isDraft,
      isSketch: true,
      post_type: 'sketch',
      sketch_url: sketchImg,
      caption: caption
    };

    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
    const draftBtnSpan = dom.canvasDraftBtn ? dom.canvasDraftBtn.querySelector('span') : null;

    if (isDraft) {
      if (dom.canvasDraftBtn) dom.canvasDraftBtn.disabled = true;
      if (draftBtnSpan) draftBtnSpan.textContent = 'Saving…';
    } else {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = true;
      if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Saving…' : 'Posting…';
    }

    const savePromise = isEdit
      ? Data.updateLivePost(targetId, entry)
      : Data.insertLivePost(entry);

    savePromise.then((saved) => {
      if (isDraft) {
        if (saved && saved.id) editingPostId = saved.id;
        syncAndRenderPosts();
        showToast(isEdit ? 'Sketch draft updated.' : 'Saved sketch as draft.');
      } else {
        closeEditor();
        syncAndRenderPosts();
        showToast(isEdit ? 'Sketch updated in Supabase!' : 'Sketch posted live!');
      }
    }).catch((err) => {
      console.error('Failed to save sketch:', err);
      if (!err || !err._alerted) {
        alert('Could not save sketch: ' + (err ? err.message : 'Unknown error'));
      }
    }).finally(() => {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = false;
      if (dom.canvasDraftBtn) dom.canvasDraftBtn.disabled = false;
      if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Save Sketch' : 'Post Sketch';
      if (draftBtnSpan) draftBtnSpan.textContent = 'Save as Draft';
    });
  }

  function openSketchLightbox(imgSrc, captionText = '') {
    if (!dom.sketchLightboxModal || !imgSrc) return;
    if (dom.sketchLightboxImg) dom.sketchLightboxImg.src = imgSrc;
    if (dom.sketchLightboxCaption) {
      dom.sketchLightboxCaption.textContent = captionText || '';
      dom.sketchLightboxCaption.style.display = captionText ? 'block' : 'none';
    }
    dom.sketchLightboxModal.classList.add('open');
  }

  function closeSketchLightbox() {
    if (dom.sketchLightboxModal) {
      dom.sketchLightboxModal.classList.remove('open');
    }
  }

  function openEditor(entryToEdit = null) {
    editingPostId = entryToEdit ? entryToEdit.id : null;
    isCanvasPreviewActive = false;

    if (entryToEdit && (entryToEdit.isSketch || entryToEdit.post_type === 'sketch')) {
      switchEditorMode('sketch');
      if (dom.sketchCaption) {
        dom.sketchCaption.value = entryToEdit.caption || entryToEdit.subtitle || '';
        updateSketchCharCounter();
      }
      const existingTag = (entryToEdit.tags && entryToEdit.tags[0]) || entryToEdit.tag || 'sketches';
      selectedSketchTag = existingTag;
      if (dom.sketchTagsPills) {
        $$('.sketch-tag-pill').forEach(p => p.classList.toggle('active', p.dataset.tag === selectedSketchTag));
      }
      if (entryToEdit.sketch_url) {
        sketchUploadedDataUrl = entryToEdit.sketch_url;
        switchSketchInputTab('upload');
        if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = entryToEdit.sketch_url;
        if (dom.sketchDropzonePrompt) dom.sketchDropzonePrompt.style.display = 'none';
        if (dom.sketchUploadPreview) dom.sketchUploadPreview.style.display = 'flex';
      } else {
        switchSketchInputTab('draw');
        clearSketchPad();
      }
    } else {
      switchEditorMode('journal');
      if (dom.sketchCaption) {
        dom.sketchCaption.value = '';
        updateSketchCharCounter();
      }
      sketchUploadedDataUrl = '';
      if (dom.sketchFileInput) dom.sketchFileInput.value = '';
      if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = '';
      if (dom.sketchDropzonePrompt) dom.sketchDropzonePrompt.style.display = 'flex';
      if (dom.sketchUploadPreview) dom.sketchUploadPreview.style.display = 'none';
      switchSketchInputTab('draw');
      clearSketchPad();
      selectedSketchTag = 'sketches';
      if (dom.sketchTagsPills) {
        $$('.sketch-tag-pill').forEach(p => p.classList.toggle('active', p.dataset.tag === 'sketches'));
      }
    }

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
        ensureScrapbookBlockEditorControls(dom.canvasBody);
      }

      // Pre-select category tag
      const existingTag = (entryToEdit.tags && entryToEdit.tags[0]) || entryToEdit.tag || null;
      selectedCanvasCategory = existingTag;

      // Pre-fill soundtrack / playlist
      if (entryToEdit.playlist && Array.isArray(entryToEdit.playlist) && entryToEdit.playlist.length > 0) {
        canvasPlaylist = entryToEdit.playlist.map(t => ({ ...t }));
        toggleSoundtrackStrip(true);
      } else {
        const st = entryToEdit.soundtrack || {};
        const songUrl = entryToEdit.song_url || st.url || '';
        if (songUrl || st.title || entryToEdit.song_title) {
          canvasPlaylist = [{
            title: st.title || entryToEdit.song_title || '',
            artist: st.artist || entryToEdit.song_artist || '',
            note: st.note || entryToEdit.song_note || '',
            url: songUrl
          }];
          toggleSoundtrackStrip(true);
        } else {
          removeSoundtrackStrip();
        }
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

  function handleCanvasSave(isDraft = false) {
    if (currentEditorMode === 'sketch') {
      return handleSketchSave(isDraft);
    }
    let title = dom.canvasTitle ? dom.canvasTitle.value.trim() : '';

    if (isDraft) {
      if (!title) {
        const now = new Date();
        const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (selectedCanvasCategory) {
          title = `${selectedCanvasCategory} (draft) — ${monthDay}`;
        } else {
          title = `draft entry — ${monthDay}`;
        }
      }
    } else {
      // Smart Blank-Title Fallback for Publishing
      if (!title) {
        const now = new Date();
        const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (selectedCanvasCategory === 'might delete later') {
          const nextNum = getNextMdlNumber();
          title = `might delete later #${nextNum}`;
        } else if (selectedCanvasCategory === 'nocturnal thoughts') {
          title = `nocturnal thoughts — ${monthDay}`;
        } else if (selectedCanvasCategory === 'memories') {
          title = `memories — ${monthDay}`;
        } else if (selectedCanvasCategory === 'rants') {
          title = `rants — ${monthDay}`;
        } else if (selectedCanvasCategory === 'brain dump') {
          title = `brain dump — ${monthDay}`;
        } else {
          alert('Please enter a title, or pick a Quick Tag (might delete later, nocturnal thoughts, memories, rants, brain dump) for an automatic editorial title.');
          if (isCanvasPreviewActive) toggleCanvasPreview();
          if (dom.canvasTitle) dom.canvasTitle.focus();
          return;
        }
      }
    }

    const tags = selectedCanvasCategory ? [selectedCanvasCategory] : [];

    syncCanvasPlaylistFromDom();
    const validTracks = (canvasPlaylist || []).filter(t => (t.title && t.title.trim()) || (t.url && t.url.trim()));
    const firstTrack = validTracks[0] || null;

    let soundtrack = null;
    let songUrl = null;
    let songTitle = '';
    let songArtist = '';
    let songNote = '';

    if (firstTrack) {
      soundtrack = {
        title: firstTrack.title || 'Soundtrack',
        artist: firstTrack.artist || 'Unknown Artist',
        note: firstTrack.note || '',
        url: firstTrack.url || null
      };
      songUrl = firstTrack.url || null;
      songTitle = firstTrack.title || '';
      songArtist = firstTrack.artist || '';
      songNote = firstTrack.note || '';
    }

    let rawBody = getCleanCanvasBodyHtml();
    if (!isDraft && (!rawBody || rawBody === '<br>')) {
      alert('Please write something in your entry before publishing.');
      if (isCanvasPreviewActive) toggleCanvasPreview();
      if (dom.canvasBody) dom.canvasBody.focus();
      return;
    }

    if (!rawBody || rawBody === '<br>') {
      rawBody = '<p></p>';
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
      playlist: validTracks,
      song_url: songUrl,
      song_title: songTitle,
      song_artist: songArtist,
      song_note: songNote,
      body: rawBody,
      coverGradient,
      readingTime: readingTime,
      reading_time: readingTime,
      published: !isDraft
    };

    const isEdit = Boolean(editingPostId);
    const targetId = editingPostId;

    const publishBtnSpan = dom.canvasPublishBtn ? dom.canvasPublishBtn.querySelector('span') : null;
    const draftBtnSpan = dom.canvasDraftBtn ? dom.canvasDraftBtn.querySelector('span') : null;

    if (isDraft) {
      if (dom.canvasDraftBtn) dom.canvasDraftBtn.disabled = true;
      if (draftBtnSpan) draftBtnSpan.textContent = 'Saving…';
    } else {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = true;
      if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Saving…' : 'Publishing…';
    }

    const savePromise = isEdit
      ? Data.updateLivePost(targetId, entry)
      : Data.insertLivePost(entry);

    savePromise.then((saved) => {
      if (isDraft) {
        if (saved && saved.id) {
          editingPostId = saved.id;
        }
        if (dom.canvasTitle && !dom.canvasTitle.value.trim()) {
          dom.canvasTitle.value = title;
        }
        syncAndRenderPosts();
        showToast(isEdit ? 'Draft updated.' : 'Saved as draft.');
      } else {
        closeEditor();
        syncAndRenderPosts();
        if (isEdit && readerOpen && dom.singleEntryView && dom.singleEntryView.style.display !== 'none') {
          openReader(targetId, false);
        }
        showToast(isEdit ? 'Entry updated in Supabase!' : 'Entry published live to Supabase!');
      }
    }).catch(err => {
      console.error('Save error:', err);
      if (!err || !err._alerted) {
        alert('Supabase Save Error: ' + (err && err.message ? err.message : 'Failed to save entry.'));
      }
    }).finally(() => {
      if (dom.canvasPublishBtn) dom.canvasPublishBtn.disabled = false;
      if (dom.canvasDraftBtn) dom.canvasDraftBtn.disabled = false;
      if (publishBtnSpan) publishBtnSpan.textContent = isEdit ? 'Save Changes' : 'Publish';
      if (draftBtnSpan) draftBtnSpan.textContent = 'Save as Draft';
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
        if (currentPlaylist && currentPlaylist.length > 1 && currentPlaylistIndex < currentPlaylist.length - 1) {
          playNextTrack();
        }
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

  let currentPlaylist = [];
  let currentPlaylistIndex = -1;

  function playTrack(soundtrack, playlist = null, index = -1) {
    if (!soundtrack) return;
    const songUrl = soundtrack.url || '';
    if (!songUrl) {
      showToast('No audio link attached to this soundtrack note.');
      return;
    }

    if (playlist && Array.isArray(playlist) && playlist.length > 0) {
      currentPlaylist = playlist;
      currentPlaylistIndex = (index >= 0) ? index : playlist.findIndex(t => t.url === songUrl);
      if (currentPlaylistIndex === -1) currentPlaylistIndex = 0;
    } else if (!currentPlaylist.length || !currentPlaylist.some(t => t.url === songUrl)) {
      currentPlaylist = [soundtrack];
      currentPlaylistIndex = 0;
    } else {
      currentPlaylistIndex = currentPlaylist.findIndex(t => t.url === songUrl);
    }

    // Toggle Previous / Next buttons in mini-player
    const hasMultiple = currentPlaylist.length > 1;
    if (dom.directPrevBtn) dom.directPrevBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (dom.directNextBtn) dom.directNextBtn.style.display = hasMultiple ? 'flex' : 'none';

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

  function playNextTrack() {
    if (!currentPlaylist || currentPlaylist.length <= 1) return;
    const nextIdx = (currentPlaylistIndex + 1) % currentPlaylist.length;
    playTrack(currentPlaylist[nextIdx], currentPlaylist, nextIdx);
  }

  function playPrevTrack() {
    if (!currentPlaylist || currentPlaylist.length <= 1) return;
    let curTime = 0;
    if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube' && ytAudioPlayer && typeof ytAudioPlayer.getCurrentTime === 'function') {
      try { curTime = ytAudioPlayer.getCurrentTime() || 0; } catch (_) {}
    } else if (dom.directAudioEl) {
      curTime = dom.directAudioEl.currentTime || 0;
    }

    if (curTime > 3) {
      if (currentTrack && currentTrack.parsed && currentTrack.parsed.type === 'youtube') {
        postYtCommand('seekTo', [0, true]);
      } else if (dom.directAudioEl) {
        dom.directAudioEl.currentTime = 0;
      }
      return;
    }

    const prevIdx = (currentPlaylistIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrack(currentPlaylist[prevIdx], currentPlaylist, prevIdx);
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
    currentPlaylist = [];
    currentPlaylistIndex = -1;
    if (dom.directPrevBtn) dom.directPrevBtn.style.display = 'none';
    if (dom.directNextBtn) dom.directNextBtn.style.display = 'none';
    updateAllSoundtrackPills();
  }

  function toggleTrack(soundtrack, playlist = null, index = -1) {
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
      playTrack(soundtrack, playlist, index);
    }
  }

  function updateAllSoundtrackPills() {
    // Update feed pills
    $$('.song-pill').forEach(pill => {
      let isPlaying = false;
      if (pill.dataset.entryId) {
        const entry = Data.getEntry(pill.dataset.entryId);
        if (entry) {
          if (entry.playlist && entry.playlist.length > 0) {
            isPlaying = entry.playlist.some(t => isTrackPlaying(t));
          } else {
            const st = entry.soundtrack || {};
            const songUrl = st.url || entry.song_url;
            isPlaying = isTrackPlaying({ ...st, url: songUrl });
          }
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

    // Update reader playlist rows if open
    $$('.playlist-track-row').forEach(row => {
      const rowBtn = row.querySelector('.track-row-play-btn');
      let isPlaying = false;
      if (rowBtn && rowBtn.dataset.track) {
        try {
          const t = JSON.parse(rowBtn.dataset.track);
          isPlaying = isTrackPlaying(t);
        } catch (_) {}
      }
      row.classList.toggle('is-playing', isPlaying);
      if (rowBtn) {
        rowBtn.innerHTML = isPlaying ? ICONS.waveform : ICONS.play;
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

    // Update Currently On Repeat status item
    const currentlyPlay = $('#currently-play');
    if (currentlyPlay) {
      const cUrl = currentlyPlay.dataset.url;
      const isCurrentlyPlaying = Boolean(cUrl && isTrackPlaying({ url: cUrl }));
      currentlyPlay.classList.toggle('playing', isCurrentlyPlaying);
      const cassetteBadge = $('.cassette-badge');
      if (cassetteBadge) {
        cassetteBadge.classList.toggle('spinning-cassette', isCurrentlyPlaying);
      }
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
        if (currentPlaylist && currentPlaylist.length > 1 && currentPlaylistIndex < currentPlaylist.length - 1) {
          playNextTrack();
        }
      });
    }

    if (dom.directPrevBtn) {
      dom.directPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playPrevTrack();
      });
    }

    if (dom.directNextBtn) {
      dom.directNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playNextTrack();
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

    // Direct command buttons (bold, italic, strikeThrough, lists, text alignment)
    $$('.canvas-format-btn[data-command]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const cmd = btn.dataset.command;

        // If user was focused in Title or Subtitle textarea when clicking alignment:
        if (cmd.startsWith('justify')) {
          if (document.activeElement === dom.canvasTitle) {
            const align = cmd === 'justifyCenter' ? 'center' : cmd === 'justifyRight' ? 'right' : cmd === 'justifyFull' ? 'justify' : 'left';
            dom.canvasTitle.style.textAlign = align;
            updateCanvasToolbarState();
            return;
          }
          if (document.activeElement === dom.canvasSubtitle) {
            const align = cmd === 'justifyCenter' ? 'center' : cmd === 'justifyRight' ? 'right' : cmd === 'justifyFull' ? 'justify' : 'left';
            dom.canvasSubtitle.style.textAlign = align;
            updateCanvasToolbarState();
            return;
          }
        }

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

    // Direct Image Upload (Native File Picker Immediately — No confirm / prompt / modal)
    if (dom.canvasImageBtn) {
      dom.canvasImageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isCanvasPreviewActive) return;
        if (dom.canvasImageInput) {
          dom.canvasImageInput.click();
        }
      });
    }

    if (dom.canvasImageInput) {
      dom.canvasImageInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          showToast('Preparing photo…');
          const compressedDataUrl = await compressImageFile(file, 1000, 0.82);

          // If Supabase Storage is configured, try uploading; otherwise use compressed Data URL
          let finalSrc = compressedDataUrl;
          if (Data.uploadImageToStorage) {
            try {
              const uploadedUrl = await Data.uploadImageToStorage(compressedDataUrl);
              if (uploadedUrl) {
                finalSrc = uploadedUrl;
              }
            } catch (storageErr) {
              console.warn('Supabase storage upload note:', storageErr);
            }
          }

          insertScrapbookMedia('image', finalSrc, 'right', true);
          showToast('Photo inserted!');
        } catch (err) {
          console.error('Image compression error:', err);
          alert('Could not insert photo: ' + (err.message || 'Error processing image.'));
        } finally {
          e.target.value = '';
        }
      });
    }

    // Optional Image Link Popover (Separate small button — never blocks direct upload)
    if (dom.canvasImageUrlBtn && dom.canvasImageUrlPopover) {
      dom.canvasImageUrlBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCanvasPreviewActive) return;
        const isOpen = dom.canvasImageUrlPopover.style.display !== 'none';
        dom.canvasImageUrlPopover.style.display = isOpen ? 'none' : 'flex';
        dom.canvasImageUrlBtn.classList.toggle('active', !isOpen);
        if (!isOpen && dom.canvasImageUrlInput) {
          setTimeout(() => dom.canvasImageUrlInput.focus(), 50);
        }
      });

      const handleUrlInsert = () => {
        if (!dom.canvasImageUrlInput) return;
        const url = dom.canvasImageUrlInput.value.trim();
        if (url) {
          insertScrapbookMedia('image', url, 'right', true);
          dom.canvasImageUrlInput.value = '';
          dom.canvasImageUrlPopover.style.display = 'none';
          if (dom.canvasImageUrlBtn) dom.canvasImageUrlBtn.classList.remove('active');
          showToast('Photo placed in entry!');
        }
      };

      if (dom.canvasImageUrlSubmit) {
        dom.canvasImageUrlSubmit.addEventListener('click', (e) => {
          e.preventDefault();
          handleUrlInsert();
        });
      }

      if (dom.canvasImageUrlInput) {
        dom.canvasImageUrlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleUrlInsert();
          }
        });
      }

      document.addEventListener('click', (e) => {
        if (dom.canvasImageUrlPopover && dom.canvasImageUrlPopover.style.display !== 'none') {
          if (!dom.canvasImageUrlPopover.contains(e.target) && e.target !== dom.canvasImageUrlBtn && !dom.canvasImageUrlBtn.contains(e.target)) {
            dom.canvasImageUrlPopover.style.display = 'none';
            if (dom.canvasImageUrlBtn) dom.canvasImageUrlBtn.classList.remove('active');
          }
        }
      });
    }

    // Sage Doodle Popover
    if (dom.canvasDoodleBtn && dom.canvasDoodlePopover) {
      dom.canvasDoodleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isCanvasPreviewActive) return;
        const isOpen = dom.canvasDoodlePopover.classList.toggle('open');
        dom.canvasDoodleBtn.classList.toggle('active', isOpen);
      });

      dom.canvasDoodlePopover.addEventListener('click', (e) => {
        const btn = e.target.closest('.doodle-pick-btn');
        if (!btn) return;
        e.preventDefault();
        const doodleName = btn.dataset.doodle;
        insertScrapbookMedia('doodle', doodleName, 'right', true);
        dom.canvasDoodlePopover.classList.remove('open');
        if (dom.canvasDoodleBtn) dom.canvasDoodleBtn.classList.remove('active');
      });

      document.addEventListener('click', (e) => {
        if (dom.canvasDoodlePopover && !dom.canvasDoodlePopover.contains(e.target) && e.target !== dom.canvasDoodleBtn && !dom.canvasDoodleBtn.contains(e.target)) {
          dom.canvasDoodlePopover.classList.remove('open');
          if (dom.canvasDoodleBtn) dom.canvasDoodleBtn.classList.remove('active');
        }
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

    // Canvas Body Click (Delete Sticky Note & Scrapbook block toolbar actions)
    if (dom.canvasBody) {
      dom.canvasBody.addEventListener('click', (e) => {
        // Sticky note delete
        const delBtn = e.target.closest('.sticky-note-del-btn');
        if (delBtn) {
          e.preventDefault();
          e.stopPropagation();
          const note = delBtn.closest('.diary-sticky-note');
          if (note) {
            note.remove();
          }
          return;
        }

        // Scrapbook block toolbar buttons
        const sbBtn = e.target.closest('.sb-tool-btn');
        if (sbBtn) {
          e.preventDefault();
          e.stopPropagation();
          const block = sbBtn.closest('.scrapbook-block, .diary-media-block');
          if (!block) return;

          if (sbBtn.dataset.action === 'delete' || sbBtn.classList.contains('sb-del-btn')) {
            block.remove();
            return;
          }

          if (sbBtn.dataset.action === 'move-up') {
            const prev = block.previousElementSibling;
            if (prev) {
              block.parentNode.insertBefore(block, prev);
              dom.canvasBody.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => b.classList.remove('is-selected'));
              block.classList.add('is-selected');
            }
            return;
          }

          if (sbBtn.dataset.action === 'move-down') {
            const next = block.nextElementSibling;
            if (next) {
              if (next.nextElementSibling) {
                block.parentNode.insertBefore(block, next.nextElementSibling);
              } else {
                block.parentNode.appendChild(block);
              }
              dom.canvasBody.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => b.classList.remove('is-selected'));
              block.classList.add('is-selected');
            }
            return;
          }

          if (sbBtn.dataset.action === 'crop') {
            const img = block.querySelector('img');
            if (img && img.src) {
              openCropModal(img.src, (newSrc) => {
                img.src = newSrc;
              });
            }
            return;
          }

          if (sbBtn.dataset.align) {
            const align = sbBtn.dataset.align;
            block.classList.remove('align-left', 'align-center', 'align-right');
            block.classList.add(`align-${align}`);
            block.dataset.align = align;
            block.querySelectorAll('.sb-tool-btn[data-align]').forEach(b => {
              b.classList.toggle('active', b.dataset.align === align);
            });
            return;
          }

          if (sbBtn.dataset.toggle === 'tape') {
            const hasTape = block.classList.toggle('with-tape');
            block.dataset.tape = hasTape ? 'true' : 'false';
            sbBtn.classList.toggle('active', hasTape);
            return;
          }
        }

        // Select media block on click
        const mediaBlock = e.target.closest('.scrapbook-block, .diary-media-block');
        if (mediaBlock) {
          dom.canvasBody.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => {
            if (b !== mediaBlock) b.classList.remove('is-selected');
          });
          mediaBlock.classList.add('is-selected');
        } else if (!e.target.closest('.scrapbook-toolbar')) {
          dom.canvasBody.querySelectorAll('.scrapbook-block, .diary-media-block').forEach(b => {
            b.classList.remove('is-selected');
          });
        }
      });

      // Keyboard Delete / Backspace for selected media block
      dom.canvasBody.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          const selectedBlock = dom.canvasBody.querySelector('.scrapbook-block.is-selected, .diary-media-block.is-selected');
          if (selectedBlock) {
            const sel = window.getSelection();
            const isInsideOtherText = sel && sel.anchorNode && !selectedBlock.contains(sel.anchorNode) && sel.anchorNode !== dom.canvasBody;
            if (!isInsideOtherText) {
              e.preventDefault();
              selectedBlock.remove();
            }
          }
        }
      });

      // Double-click inline photo to crop
      dom.canvasBody.addEventListener('dblclick', (e) => {
        const img = e.target.closest('img');
        if (img && img.closest('.scrapbook-block, .diary-media-block')) {
          e.preventDefault();
          e.stopPropagation();
          openCropModal(img.src, (newSrc) => {
            img.src = newSrc;
          });
        }
      });

      // Keep toolbar active state synchronized on selection changes
      dom.canvasBody.addEventListener('keyup', updateCanvasToolbarState);
      dom.canvasBody.addEventListener('mouseup', updateCanvasToolbarState);
    }

    document.addEventListener('selectionchange', () => {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode || !dom.canvasBody) return;
      if (dom.canvasBody.contains(sel.anchorNode) || dom.canvasBody === sel.anchorNode) {
        updateCanvasToolbarState();
      }
    });

    // Preview button
    if (dom.canvasPreviewBtn) {
      dom.canvasPreviewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCanvasPreview();
      });
    }

    // Save as Draft button
    if (dom.canvasDraftBtn) {
      dom.canvasDraftBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCanvasSave(true);
      });
    }

    // Publish button
    if (dom.canvasPublishBtn) {
      dom.canvasPublishBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleCanvasSave(false);
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

    // Canvas Playlist events
    if (dom.canvasAddSongBtn) {
      dom.canvasAddSongBtn.addEventListener('click', (e) => {
        e.preventDefault();
        syncCanvasPlaylistFromDom();
        canvasPlaylist.push({ title: '', artist: '', note: '', url: '' });
        renderCanvasPlaylist();
        const items = dom.canvasPlaylistList ? dom.canvasPlaylistList.querySelectorAll('.canvas-playlist-item') : [];
        const lastItem = items[items.length - 1];
        if (lastItem) {
          const urlInp = lastItem.querySelector('.cpi-url');
          if (urlInp) urlInp.focus();
        }
      });
    }

    if (dom.canvasPlaylistList) {
      dom.canvasPlaylistList.addEventListener('click', (e) => {
        const btn = e.target.closest('.cpi-btn');
        if (!btn) return;
        e.preventDefault();
        syncCanvasPlaylistFromDom();
        const idx = parseInt(btn.dataset.index, 10);
        const action = btn.dataset.action;
        if (isNaN(idx) || idx < 0 || idx >= canvasPlaylist.length) return;

        if (action === 'move-up' && idx > 0) {
          const temp = canvasPlaylist[idx];
          canvasPlaylist[idx] = canvasPlaylist[idx - 1];
          canvasPlaylist[idx - 1] = temp;
          renderCanvasPlaylist();
        } else if (action === 'move-down' && idx < canvasPlaylist.length - 1) {
          const temp = canvasPlaylist[idx];
          canvasPlaylist[idx] = canvasPlaylist[idx + 1];
          canvasPlaylist[idx + 1] = temp;
          renderCanvasPlaylist();
        } else if (action === 'delete') {
          canvasPlaylist.splice(idx, 1);
          if (canvasPlaylist.length === 0) {
            canvasPlaylist = [{ title: '', artist: '', note: '', url: '' }];
          }
          renderCanvasPlaylist();
        }
      });

      dom.canvasPlaylistList.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('cpi-url')) {
          handlePlaylistItemUrlAutoFill(e.target);
        }
      });

      dom.canvasPlaylistList.addEventListener('paste', (e) => {
        if (e.target && e.target.classList.contains('cpi-url')) {
          const targetInput = e.target;
          setTimeout(() => handlePlaylistItemUrlAutoFill(targetInput), 80);
        }
      });
    }

    // Mode switcher buttons
    if (dom.modeJournalBtn) {
      dom.modeJournalBtn.addEventListener('click', () => switchEditorMode('journal'));
    }
    if (dom.modeSketchBtn) {
      dom.modeSketchBtn.addEventListener('click', () => switchEditorMode('sketch'));
    }

    // Sketch input tabs
    if (dom.sketchTabDraw) {
      dom.sketchTabDraw.addEventListener('click', () => switchSketchInputTab('draw'));
    }
    if (dom.sketchTabUpload) {
      dom.sketchTabUpload.addEventListener('click', () => switchSketchInputTab('upload'));
    }

    // Color buttons
    $$('.sketch-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sketchInkColor = btn.dataset.color || '#1E2E24';
        $$('.sketch-color-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Brush size buttons
    $$('.sketch-brush-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sketchBrushSize = parseInt(btn.dataset.size, 10) || 2;
        $$('.sketch-brush-btn').forEach(b => b.classList.toggle('active', b === btn));
      });
    });

    // Sketch Pad Undo & Clear
    if (dom.sketchPadUndo) {
      dom.sketchPadUndo.addEventListener('click', undoSketchStroke);
    }
    if (dom.sketchPadClear) {
      dom.sketchPadClear.addEventListener('click', clearSketchPad);
    }

    // Caption char counter
    if (dom.sketchCaption) {
      dom.sketchCaption.addEventListener('input', updateSketchCharCounter);
    }

    // Sketch Dropzone & File Input
    if (dom.sketchDropzone && dom.sketchFileInput) {
      dom.sketchDropzone.addEventListener('click', (e) => {
        if (e.target.closest('#sketch-upload-crop, #sketch-upload-remove')) return;
        dom.sketchFileInput.click();
      });

      dom.sketchFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          const compressed = await compressImageFile(file, 1000, 0.85);
          sketchUploadedDataUrl = compressed;
          if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = compressed;
          if (dom.sketchDropzonePrompt) dom.sketchDropzonePrompt.style.display = 'none';
          if (dom.sketchUploadPreview) dom.sketchUploadPreview.style.display = 'flex';
        } catch (err) {
          alert(err.message || 'Could not load image');
        }
      });

      dom.sketchDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dom.sketchDropzone.classList.add('dragover');
      });
      dom.sketchDropzone.addEventListener('dragleave', () => {
        dom.sketchDropzone.classList.remove('dragover');
      });
      dom.sketchDropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dom.sketchDropzone.classList.remove('dragover');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          try {
            const compressed = await compressImageFile(file, 1000, 0.85);
            sketchUploadedDataUrl = compressed;
            if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = compressed;
            if (dom.sketchDropzonePrompt) dom.sketchDropzonePrompt.style.display = 'none';
            if (dom.sketchUploadPreview) dom.sketchUploadPreview.style.display = 'flex';
          } catch (err) {
            alert(err.message || 'Could not load image');
          }
        }
      });
    }

    if (dom.sketchUploadRemove) {
      dom.sketchUploadRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        sketchUploadedDataUrl = '';
        if (dom.sketchFileInput) dom.sketchFileInput.value = '';
        if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = '';
        if (dom.sketchDropzonePrompt) dom.sketchDropzonePrompt.style.display = 'flex';
        if (dom.sketchUploadPreview) dom.sketchUploadPreview.style.display = 'none';
      });
    }

    if (dom.sketchUploadCrop) {
      dom.sketchUploadCrop.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sketchUploadedDataUrl) {
          openCropModal(sketchUploadedDataUrl, (newSrc) => {
            sketchUploadedDataUrl = newSrc;
            if (dom.sketchUploadPreviewImg) dom.sketchUploadPreviewImg.src = newSrc;
          });
        }
      });
    }

    // Sketch tag pills
    if (dom.sketchTagsPills) {
      dom.sketchTagsPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.sketch-tag-pill');
        if (!pill) return;
        selectedSketchTag = pill.dataset.tag || 'sketches';
        $$('.sketch-tag-pill').forEach(p => p.classList.toggle('active', p === pill));
      });
    }

    // Lightbox modal close events
    if (dom.sketchLightboxClose) {
      dom.sketchLightboxClose.addEventListener('click', closeSketchLightbox);
    }
    if (dom.sketchLightboxModal) {
      dom.sketchLightboxModal.addEventListener('click', (e) => {
        if (e.target === dom.sketchLightboxModal) closeSketchLightbox();
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.sketchLightboxModal && dom.sketchLightboxModal.classList.contains('open')) {
        closeSketchLightbox();
      }
    });
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

    // Filters (Drawer Index & Top Journal Section)
    if (dom.filterBar) dom.filterBar.addEventListener('click', handleFilterClick);
    if (dom.journalFilterBar) dom.journalFilterBar.addEventListener('click', handleFilterClick);

    // Footer Author Login Triggers
    if (dom.footerAuthorBtn) {
      dom.footerAuthorBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthorModal();
      });
    }
    if (dom.footerAuthorTrigger) {
      dom.footerAuthorTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthorModal();
      });
      dom.footerAuthorTrigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          openAuthorModal();
        }
      });
    }

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

    // Hero Modal & Edit Buttons
    if (dom.editHeroNoteBtn) {
      dom.editHeroNoteBtn.addEventListener('click', (e) => handleEditHeroClick(e, 'note'));
    }
    if (dom.editPolaroidBtn) {
      dom.editPolaroidBtn.addEventListener('click', (e) => handleEditHeroClick(e, 'polaroid'));
    }
    const hmCancel = $('#hero-modal-cancel');
    if (hmCancel) hmCancel.addEventListener('click', closeHeroModal);
    const hmForm = $('#hero-edit-form');
    if (hmForm) hmForm.addEventListener('submit', saveHeroData);

    // Hero Photo File Upload & URL preview
    const photoFileIn = $('#hm-photo-file');
    if (photoFileIn) {
      photoFileIn.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const dataUrl = evt.target.result;
          if ($('#hm-photo-url')) $('#hm-photo-url').value = dataUrl;
          const previewWrap = $('#hm-photo-preview-wrap');
          const previewImg = $('#hm-photo-preview');
          if (previewWrap && previewImg) {
            previewImg.src = dataUrl;
            previewWrap.style.display = 'flex';
          }
        };
        reader.readAsDataURL(file);
      });
    }

    const photoUrlIn = $('#hm-photo-url');
    if (photoUrlIn) {
      photoUrlIn.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const previewWrap = $('#hm-photo-preview-wrap');
        const previewImg = $('#hm-photo-preview');
        if (previewWrap && previewImg) {
          if (val) {
            previewImg.src = val;
            previewWrap.style.display = 'flex';
          } else {
            previewWrap.style.display = 'none';
          }
        }
      });
    }

    const photoResetBtn = $('#hm-photo-reset');
    if (photoResetBtn) {
      photoResetBtn.addEventListener('click', () => {
        if ($('#hm-photo-url')) $('#hm-photo-url').value = Data.defaultHero.polaroidImg;
        const previewImg = $('#hm-photo-preview');
        if (previewImg) previewImg.src = Data.defaultHero.polaroidImg;
      });
    }

    const photoCropBtn = $('#hm-photo-crop');
    if (photoCropBtn) {
      photoCropBtn.addEventListener('click', () => {
        const previewImg = $('#hm-photo-preview');
        const currentSrc = (previewImg && previewImg.src) || ($('#hm-photo-url') ? $('#hm-photo-url').value.trim() : '');
        if (currentSrc) {
          openCropModal(currentSrc, (newSrc) => {
            if ($('#hm-photo-url')) $('#hm-photo-url').value = newSrc;
            if (previewImg) previewImg.src = newSrc;
          });
        }
      });
    }

    // Initialize Image Cropper modal events
    initCropperEvents();

    // Inline double-click triggers when in author mode
    if (dom.heroQuoteText) {
      dom.heroQuoteText.addEventListener('dblclick', (e) => {
        if (Data.isAuthorMode() || (currentAuthSession && currentAuthSession.user)) {
          handleEditHeroClick(e, 'note');
        }
      });
    }
    if (dom.heroDescText) {
      dom.heroDescText.addEventListener('dblclick', (e) => {
        if (Data.isAuthorMode() || (currentAuthSession && currentAuthSession.user)) {
          handleEditHeroClick(e, 'note');
        }
      });
    }
    if (dom.polaroidPhotoImg) {
      dom.polaroidPhotoImg.addEventListener('dblclick', (e) => {
        if (Data.isAuthorMode() || (currentAuthSession && currentAuthSession.user)) {
          handleEditHeroClick(e, 'polaroid');
        }
      });
    }
    if (dom.polaroidQuoteText) {
      dom.polaroidQuoteText.addEventListener('dblclick', (e) => {
        if (Data.isAuthorMode() || (currentAuthSession && currentAuthSession.user)) {
          handleEditHeroClick(e, 'polaroid');
        }
      });
    }

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

    const smRepeatUrl = $('#sm-repeat-url');
    if (smRepeatUrl) {
      smRepeatUrl.addEventListener('blur', handleStatusSongUrlAutoFill);
      smRepeatUrl.addEventListener('change', handleStatusSongUrlAutoFill);
      smRepeatUrl.addEventListener('paste', () => {
        setTimeout(handleStatusSongUrlAutoFill, 80);
      });
      smRepeatUrl.addEventListener('input', () => {
        if (/^https?:\/\//i.test(smRepeatUrl.value.trim())) {
          setTimeout(handleStatusSongUrlAutoFill, 400);
        }
      });
    }

    const smRepeatTitle = $('#sm-repeat-title');
    if (smRepeatTitle) {
      smRepeatTitle.addEventListener('paste', () => {
        setTimeout(() => {
          if (/^https?:\/\//i.test(smRepeatTitle.value.trim())) {
            handleStatusSongUrlAutoFill();
          }
        }, 80);
      });
      smRepeatTitle.addEventListener('change', () => {
        if (/^https?:\/\//i.test(smRepeatTitle.value.trim())) {
          handleStatusSongUrlAutoFill();
        }
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
        let url = playEl.dataset.url;
        const title = playEl.dataset.title || 'On Repeat';
        const artist = playEl.dataset.artist || 'zee’s playlist';

        if (!url) {
          const resolved = parseOnRepeat(title + (artist ? ' — ' + artist : ''));
          url = resolved.url;
        }

        if (url) {
          const parsed = parseTrackUrl(url);
          if (parsed) {
            toggleTrack({
              title: title,
              artist: artist,
              url: url
            });
            return;
          } else {
            window.open(url, '_blank', 'noopener,noreferrer');
            return;
          }
        }
        showToast(`Soundtrack note: ${title} — ${artist}`);
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
    renderHero();
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
