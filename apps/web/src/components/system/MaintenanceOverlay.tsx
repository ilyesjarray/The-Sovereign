'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import './MaintenanceOverlay.css';

/* ============================================================
   ASSET MAP — Explicit variable definitions binding to
   the seydraassets/ folder in /public. No hardcoded params.
   ============================================================ */
const ASSET_BASE = '/seydraassets';

const ARCHITECT_PANEL = `${ASSET_BASE}/seydraguide.png`;
const BANNER_TOP = `${ASSET_BASE}/seydrapaneltop.png`;
const BANNER_BOTTOM = `${ASSET_BASE}/seydrapanelbottom.png`;
// seydrapanel.png used only for layout analysis — not rendered
// starsbottom1/2/3.png — galaxy layers removed, replaced with solid black
const SFX_POPUP = `${ASSET_BASE}/popup.mp3`;
const SFX_BUTTON = `${ASSET_BASE}/ui_button_back.mp3`;
const SFX_START1 = `${ASSET_BASE}/start1.mp3`;
const SFX_START2 = `${ASSET_BASE}/start2.mp3`;

/* ============================================================
   BYPASS CONFIG
   ============================================================ */
const BYPASS_SEQUENCE = 'khawla';
const BYPASS_FADE_MS = 800;

/* ============================================================
   TIMING MATRIX (ms)
   ============================================================ */
const T = {
  ENV_FADE: 3000,
  BANNER_TRANSIT: 400,
  BANNER_SPLIT: 600,
  CONTENT_REVEAL: 300,
} as const;

/* ============================================================
   REDIRECT TARGET
   ============================================================ */
const CONFIRM_URL = 'https://n-s-c.vercel.app/Welcome';

/* ============================================================
   COMPONENT
   ============================================================ */
export function MaintenanceOverlay() {
  /* ---- State Machine ---- */
  const [phase, setPhase] = useState<
    'init' | 'env-fadein' | 'banner-transit' | 'banner-split' | 'content-reveal' | 'idle' | 'dismissed' | 'closing'
  >('init');
  const [dismissed, setDismissed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  /* ---- Refs ---- */
  const overlayRef = useRef<HTMLDivElement>(null);
  const keystrokeRef = useRef<string>('');
  const audioPopRef = useRef<HTMLAudioElement | null>(null);
  const audioBtnRef = useRef<HTMLAudioElement | null>(null);
  const audioStart1Ref = useRef<HTMLAudioElement | null>(null);
  const audioStart2Ref = useRef<HTMLAudioElement | null>(null);
  const popupPlayedRef = useRef(false);
  const redirectingRef = useRef(false);
  const unlockInitiatedRef = useRef(false);

  /* ============================================================
     AUDIO — Preloading & basic browser interaction unlock
     ============================================================ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Create Audio elements
    const popAudio = new Audio(SFX_POPUP);
    popAudio.preload = 'auto';
    popAudio.volume = 0.7;
    audioPopRef.current = popAudio;

    const btnAudio = new Audio(SFX_BUTTON);
    btnAudio.preload = 'auto';
    btnAudio.volume = 0.7;
    audioBtnRef.current = btnAudio;

    const start1Audio = new Audio(SFX_START1);
    start1Audio.preload = 'auto';
    start1Audio.volume = 1.0;
    audioStart1Ref.current = start1Audio;

    const start2Audio = new Audio(SFX_START2);
    start2Audio.preload = 'auto';
    start2Audio.volume = 0.8;
    start2Audio.loop = true;
    audioStart2Ref.current = start2Audio;

    return () => {
      if (audioStart1Ref.current) audioStart1Ref.current.pause();
      if (audioStart2Ref.current) audioStart2Ref.current.pause();
      if (popAudio) popAudio.pause();
      if (btnAudio) btnAudio.pause();
    };
  }, []);

  /* Helper to play a sound */
  const playSound = useCallback((audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {
      // Suppress browser autoplay errors cleanly
    });
  }, []);

  /* Handlers to clear the initial black click-to-connect screen */
  const handleUnlock = useCallback(() => {
    if (unlockInitiatedRef.current) return;
    unlockInitiatedRef.current = true;

    // Play start1.mp3 immediately
    if (audioStart1Ref.current) {
      audioStart1Ref.current.volume = 1.0;
      audioStart1Ref.current.currentTime = 0;
      audioStart1Ref.current.play().catch((err) => {
        console.warn('start1 play failed:', err);
      });
    }

    // Play start2.mp3 immediately, loop forever
    if (audioStart2Ref.current) {
      audioStart2Ref.current.volume = 0.8;
      audioStart2Ref.current.loop = true;
      audioStart2Ref.current.play().catch((err) => {
        console.warn('start2 play failed:', err);
      });
    }

    // Direct warm-up for audio elements
    if (audioPopRef.current) {
      audioPopRef.current.play().then(() => {
        audioPopRef.current?.pause();
        audioPopRef.current!.currentTime = 0;
      }).catch(() => { });
    }
    if (audioBtnRef.current) {
      audioBtnRef.current.play().then(() => {
        audioBtnRef.current?.pause();
        audioBtnRef.current!.currentTime = 0;
      }).catch(() => { });
    }

    setUnlocked(true);
  }, []);

  useEffect(() => {
    if (unlocked) return;
    const triggerUnlock = () => handleUnlock();
    window.addEventListener('keydown', triggerUnlock, { once: true });
    return () => {
      window.removeEventListener('keydown', triggerUnlock);
    };
  }, [unlocked, handleUnlock]);

  /* ============================================================
     KHAWLA BYPASS — Global keydown listener
     ============================================================ */
  useEffect(() => {
    if (dismissed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key.length === 1 && /[a-z]/.test(key)) {
        keystrokeRef.current = (keystrokeRef.current + key).slice(-BYPASS_SEQUENCE.length);
        if (keystrokeRef.current === BYPASS_SEQUENCE) {
          triggerBypass();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dismissed]);

  const triggerBypass = useCallback(() => {
    setDismissed(true);
    setPhase('dismissed');
    keystrokeRef.current = '';

    // Stop loops on bypass
    if (audioStart1Ref.current) audioStart1Ref.current.pause();
    if (audioStart2Ref.current) audioStart2Ref.current.pause();

    const siteContent = document.querySelector('[data-seydra-site-content]');
    if (siteContent) {
      siteContent.classList.add('seydra-site-reveal');
    }

    setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      }
    }, BYPASS_FADE_MS + 100);
  }, []);

  /* ============================================================
     ANIMATION CHOREOGRAPHY TIMELINE
     ============================================================ */
  useEffect(() => {
    if (!unlocked) return;

    const PRELOAD_DELAY = 1500; // 1.5s full black screen for asset preload cache warming

    // Kick off environment fade-in after preload delay
    const t0 = setTimeout(() => setPhase('env-fadein'), PRELOAD_DELAY);

    // Banner transit from right (starts after env fade + buffer)
    const bannerStart = PRELOAD_DELAY + T.ENV_FADE + 200;
    const t1 = setTimeout(() => {
      setPhase('banner-transit');
      // Play popup SFX when banner arrives
      if (!popupPlayedRef.current) {
        popupPlayedRef.current = true;
        playSound(audioPopRef.current);
      }
    }, bannerStart);

    // Banner split (after transit completes)
    const t2 = setTimeout(() => setPhase('banner-split'), bannerStart + T.BANNER_TRANSIT);

    // Content reveal (after split completes + buffer)
    const t3 = setTimeout(() => setPhase('content-reveal'), bannerStart + T.BANNER_TRANSIT + T.BANNER_SPLIT + T.CONTENT_REVEAL);

    // Idle
    const t4 = setTimeout(() => setPhase('idle'), bannerStart + T.BANNER_TRANSIT + T.BANNER_SPLIT + T.CONTENT_REVEAL + 800);

    return () => {
      [t0, t1, t2, t3, t4].forEach(clearTimeout);
    };
  }, [unlocked, playSound]);

  /* ============================================================
     PHASE HELPERS
     ============================================================ */
  const isPhaseAtLeast = (target: typeof phase): boolean => {
    const order = ['init', 'env-fadein', 'banner-transit', 'banner-split', 'content-reveal', 'idle', 'closing', 'dismissed'];
    return order.indexOf(phase) >= order.indexOf(target);
  };

  /* ============================================================
     CONFIRM HANDLER — Play sound, run close scene, then redirect
     Close scene total: ~2.0s. Redirect at 2.5s.
     ============================================================ */
  const handleConfirm = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;

    setPhase('closing');

    const audio = audioBtnRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.volume = 0.8;
      audio.play().catch(() => { });
    }

    // Redirect after close scene finishes (1.2s close sequence + 0.1s buffer)
    setTimeout(() => {
      window.location.href = CONFIRM_URL;
    }, 1300);
  }, []);

  if (!unlocked) {
    return (
      <div
        className="seydra-gate"
        onClick={handleUnlock}
        onTouchStart={(e) => {
          e.preventDefault();
          handleUnlock();
        }}
      >
        <div className="seydra-gate-content">
          <span className="seydra-gate-subtext">Click to continue</span>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
     ============================================================ */
  const isClosing = phase === 'closing';

  const overlayClasses = [
    'seydra-overlay',
    isPhaseAtLeast('env-fadein') && !dismissed ? 'env-fadein' : '',
    dismissed ? 'khawla-dismiss' : '',
    isClosing ? 'closing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={overlayRef}
      className={overlayClasses}
      id="seydra-maintenance-overlay"
      aria-hidden={dismissed}
      role="dialog"
      aria-label="System Maintenance Overlay"
    >
      {/* ============================================
          BACKGROUND
          Solid black screen with atmospheric nebula tint
          ============================================ */}
      <div className="seydra-parallax-container">
        <div className="seydra-nebula-overlay" />
      </div>

      {/* ============================================
          CHARACTER: SEYDRA GUIDE — Static + Glow
          No entrance/exit animation. Always visible.
          ============================================ */}
      <img
        src={ARCHITECT_PANEL}
        alt="Seydra System Engineer"
        className="seydra-character"
        draggable={false}
      />

      {/* ============================================
          SPLIT-BANNER ASSEMBLY
          Drifts from RIGHT, then top/bottom split
          ============================================ */}
      <div
        className={[
          'seydra-banner-assembly',
          isPhaseAtLeast('banner-transit') ? 'banner-transit' : '',
          isPhaseAtLeast('banner-split') ? 'banner-split' : '',
          isClosing ? 'banner-closing' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Volumetric backlighting glow */}
        <div className="seydra-banner-luminosity" />

        <div className="seydra-banner-halves">
          {/* Top half — X=0, splits upward */}
          <div
            className={[
              'seydra-banner-top',
              isPhaseAtLeast('banner-split') ? 'split-open' : '',
              isClosing ? 'split-closing' : '',
            ].filter(Boolean).join(' ')}
          >
            <img
              src={BANNER_TOP}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </div>

          {/* Interior content — in the black gap between split halves */}
          <div
            className={[
              'seydra-interior',
              isPhaseAtLeast('content-reveal') ? 'content-reveal' : '',
              isClosing ? 'content-closing' : '',
            ].filter(Boolean).join(' ')}
          >

            <h1 className="seydra-headline">Under Progress</h1>

            <hr className="seydra-divider" />

            <p className="seydra-teaser">
              Our systems are currently undergoing deep backend synchronization
              and core infrastructure optimization. The future
              of intelligent command is almost here. Stay tuned.
            </p>

            <button
              className="seydra-confirm-btn--styled"
              onClick={handleConfirm}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              id="seydra-confirm-action"
              type="button"
              aria-label="Confirm and proceed"
            >
              Confirme
            </button>
          </div>

          {/* Bottom half — X=0, splits downward */}
          <div
            className={[
              'seydra-banner-bottom',
              isPhaseAtLeast('banner-split') ? 'split-open' : '',
              isClosing ? 'split-closing' : '',
            ].filter(Boolean).join(' ')}
          >
            <img
              src={BANNER_BOTTOM}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
