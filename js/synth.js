/* ───────────────────────────────────────────
   ZLog · Web Audio Synth Engine
   Built-in ambient sound generator:
   warm rhodes, rain/vinyl crackle, lo-fi piano
   ─────────────────────────────────────────── */
window.ZLog = window.ZLog || {};

(function (Z) {
  'use strict';

  let ctx = null;
  let masterGain = null;
  let activeNodes = [];
  let currentPreset = null;
  let _isPlaying = false;
  let _volume = 0.35;
  let loopTimer = null;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = _volume;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function stopAll() {
    if (loopTimer) { clearInterval(loopTimer); loopTimer = null; }
    activeNodes.forEach(n => {
      try { n.stop ? n.stop() : n.disconnect(); } catch (_) {}
    });
    activeNodes = [];
    _isPlaying = false;
    currentPreset = null;
  }

  /* ── Utilities ── */

  function createNoise(duration) {
    const c = ensureContext();
    const len = c.sampleRate * duration;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  function midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  /* ══════════════════════════════════════════
     PRESET: Warm Rhodes
     Detuned sine pairs with slow tremolo,
     cycling through jazz chords
     ══════════════════════════════════════════ */

  function playWarmRhodes() {
    const c = ensureContext();
    // Cmaj7 → Dm9 → Fmaj7 → G7 (MIDI notes)
    const chords = [
      [60, 64, 67, 71],   // Cmaj7
      [62, 65, 69, 72],   // Dm7
      [65, 69, 72, 76],   // Fmaj7
      [55, 59, 62, 65]    // G7
    ];
    let chordIdx = 0;

    function playChord() {
      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      const now = c.currentTime;

      chord.forEach((note, i) => {
        const freq = midiToFreq(note);

        // Main sine
        const osc1 = c.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = freq;

        // Detuned sine for warmth
        const osc2 = c.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.003;

        // Tremolo LFO
        const lfo = c.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 2.5 + i * 0.3;
        const lfoGain = c.createGain();
        lfoGain.gain.value = 0.08;
        lfo.connect(lfoGain);

        // Note gain envelope
        const noteGain = c.createGain();
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.025, now + 2.5);
        noteGain.gain.linearRampToValueAtTime(0.001, now + 4.8);

        lfoGain.connect(noteGain.gain);

        // Low-pass for warmth
        const lpf = c.createBiquadFilter();
        lpf.type = 'lowpass';
        lpf.frequency.value = 1200;
        lpf.Q.value = 0.7;

        osc1.connect(lpf);
        osc2.connect(lpf);
        lpf.connect(noteGain);
        noteGain.connect(masterGain);

        osc1.start(now + i * 0.08);
        osc2.start(now + i * 0.08);
        lfo.start(now);
        osc1.stop(now + 5);
        osc2.stop(now + 5);
        lfo.stop(now + 5);

        activeNodes.push(osc1, osc2, lfo);
      });
    }

    playChord();
    loopTimer = setInterval(playChord, 5000);
  }

  /* ══════════════════════════════════════════
     PRESET: Rain & Vinyl Crackle
     Filtered noise layers for rain + crackle pops
     ══════════════════════════════════════════ */

  function playRainCrackle() {
    const c = ensureContext();

    // Rain layer — bandpass-filtered noise
    const noiseBuf = createNoise(4);
    const rainSrc = c.createBufferSource();
    rainSrc.buffer = noiseBuf;
    rainSrc.loop = true;

    const rainBPF = c.createBiquadFilter();
    rainBPF.type = 'bandpass';
    rainBPF.frequency.value = 3500;
    rainBPF.Q.value = 0.4;

    const rainHPF = c.createBiquadFilter();
    rainHPF.type = 'highpass';
    rainHPF.frequency.value = 800;

    const rainGain = c.createGain();
    rainGain.gain.value = 0.12;

    rainSrc.connect(rainBPF);
    rainBPF.connect(rainHPF);
    rainHPF.connect(rainGain);
    rainGain.connect(masterGain);
    rainSrc.start();
    activeNodes.push(rainSrc);

    // Deeper rain rumble
    const rumbleSrc = c.createBufferSource();
    rumbleSrc.buffer = noiseBuf;
    rumbleSrc.loop = true;

    const rumbleLPF = c.createBiquadFilter();
    rumbleLPF.type = 'lowpass';
    rumbleLPF.frequency.value = 400;
    rumbleLPF.Q.value = 0.3;

    const rumbleGain = c.createGain();
    rumbleGain.gain.value = 0.06;

    rumbleSrc.connect(rumbleLPF);
    rumbleLPF.connect(rumbleGain);
    rumbleGain.connect(masterGain);
    rumbleSrc.start();
    activeNodes.push(rumbleSrc);

    // Vinyl crackle — periodic noise bursts
    function crackle() {
      if (!_isPlaying || currentPreset !== 'rainCrackle') return;

      const burstLen = 0.01 + Math.random() * 0.03;
      const burst = createNoise(burstLen);
      const src = c.createBufferSource();
      src.buffer = burst;

      const hpf = c.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = 4000 + Math.random() * 4000;

      const g = c.createGain();
      g.gain.value = 0.03 + Math.random() * 0.05;

      src.connect(hpf);
      hpf.connect(g);
      g.connect(masterGain);
      src.start();

      setTimeout(crackle, 40 + Math.random() * 200);
    }
    crackle();

    // Subtle low drone for warmth
    const drone = c.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 85;
    const droneGain = c.createGain();
    droneGain.gain.value = 0.025;
    const droneLPF = c.createBiquadFilter();
    droneLPF.type = 'lowpass';
    droneLPF.frequency.value = 150;
    drone.connect(droneLPF);
    droneLPF.connect(droneGain);
    droneGain.connect(masterGain);
    drone.start();
    activeNodes.push(drone);
  }

  /* ══════════════════════════════════════════
     PRESET: Lo-Fi Piano
     FM-synthesized mellow piano arpeggios
     ══════════════════════════════════════════ */

  function playLofiPiano() {
    const c = ensureContext();

    // Pentatonic patterns in C
    const notes = [60, 62, 64, 67, 69, 72, 69, 67, 64, 62];
    let noteIdx = 0;

    function playNote() {
      if (!_isPlaying || currentPreset !== 'lofiPiano') return;

      const midi = notes[noteIdx % notes.length];
      noteIdx++;
      const freq = midiToFreq(midi);
      const now = c.currentTime;

      // Carrier
      const carrier = c.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.value = freq;

      // Modulator (FM)
      const mod = c.createOscillator();
      mod.type = 'sine';
      mod.frequency.value = freq * 2;
      const modGain = c.createGain();
      modGain.gain.value = freq * 0.6;
      mod.connect(modGain);
      modGain.connect(carrier.frequency);

      // Envelope
      const env = c.createGain();
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.1, now + 0.02);
      env.gain.exponentialRampToValueAtTime(0.04, now + 0.3);
      env.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      // Lo-pass to muffle
      const lpf = c.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = 900 + Math.random() * 400;
      lpf.Q.value = 0.5;

      carrier.connect(lpf);
      lpf.connect(env);
      env.connect(masterGain);

      carrier.start(now);
      mod.start(now);
      carrier.stop(now + 3);
      mod.stop(now + 3);

      activeNodes.push(carrier, mod);
    }

    // Add a soft noise bed
    const noiseBuf = createNoise(3);
    const noiseSrc = c.createBufferSource();
    noiseSrc.buffer = noiseBuf;
    noiseSrc.loop = true;
    const noiseGain = c.createGain();
    noiseGain.gain.value = 0.015;
    const noiseLPF = c.createBiquadFilter();
    noiseLPF.type = 'lowpass';
    noiseLPF.frequency.value = 600;
    noiseSrc.connect(noiseLPF);
    noiseLPF.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start();
    activeNodes.push(noiseSrc);

    playNote();
    loopTimer = setInterval(playNote, 1800 + Math.random() * 600);
  }

  /* ── Preset dispatcher ── */

  const presets = {
    warmRhodes:  playWarmRhodes,
    rainCrackle: playRainCrackle,
    lofiPiano:   playLofiPiano
  };

  const presetLabels = {
    warmRhodes:  'Warm Rhodes Chords',
    rainCrackle: 'Rain & Vinyl Crackle',
    lofiPiano:   'Lo-Fi Piano'
  };

  function play(presetName) {
    stopAll();
    if (!presets[presetName]) return;
    _isPlaying = true;
    currentPreset = presetName;
    presets[presetName]();
  }

  function stop() {
    stopAll();
  }

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.value = _volume;
  }

  function getVolume() { return _volume; }
  function isPlaying() { return _isPlaying; }
  function getPreset() { return currentPreset; }
  function getPresetLabel(name) { return presetLabels[name] || name; }
  function getPresetNames() { return Object.keys(presets); }

  /* ── Public API ── */
  Z.Synth = {
    play,
    stop,
    setVolume,
    getVolume,
    isPlaying,
    getPreset,
    getPresetLabel,
    getPresetNames
  };

})(window.ZLog);
