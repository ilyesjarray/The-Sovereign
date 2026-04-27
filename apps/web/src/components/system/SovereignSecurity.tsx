'use client';

import { useEffect } from 'react';

/**
 * ======================================================
 * THE SOVEREIGN™ FULL SECURITY SHIELD v2.0
 * Adapted from NEYDRA™ Security Suite.
 * Multi-layered aggressive front-end protection.
 * Injected via root layout — applies to ALL pages.
 * ======================================================
 *
 * Layers:
 *  1. Domain Anti-Cloning Lock
 *  2. Anti Right-Click & Touch Hold
 *  3. Anti-Keyboard Shortcuts (DevTools Blocker)
 *  4. Anti-Drag and Drop (image theft prevention)
 *  5. Aggressive Debugger Trap
 *  6. CSS Hardening (injected dynamically)
 *  7. DevTools Detection (Window Size Heuristic)
 *  8. Anti-Iframe Embedding (Clickjacking Protection)
 *  9. Console Warning
 * 10. Mutation Observer (Anti-Tampering)
 */
export function SovereignSecurity() {
    useEffect(() => {
        // ==========================================
        // 1. DOMAIN ANTI-CLONING LOCK
        // ==========================================
        const allowedDomains = [
            'thesovereign.vercel.app',
            'www.thesovereign.com',
            'thesovereign.com',
            // Also allow Neydra domains since they share the ecosystem
            'neydra.vercel.app',
            'n-s-c.vercel.app',
            'www.neydra.com',
            'neydra.com',
            'localhost',
            '127.0.0.1',
        ];

        const currentHost = window.location.hostname;

        if (!currentHost || allowedDomains.indexOf(currentHost) === -1) {
            document.documentElement.innerHTML =
                '<body style="background:#000;color:#00F3FF;display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;font-size:20px;text-align:center;flex-direction:column;">' +
                '<div style="border:2px solid #00F3FF;padding:40px;max-width:600px;">' +
                '<h1 style="font-size:32px;margin-bottom:20px;letter-spacing:5px;">⛔ SECURITY ERROR</h1>' +
                '<p>UNAUTHORIZED DOMAIN / LOCAL FILE TAMPERING DETECTED.</p>' +
                '<p style="margin-top:15px;font-size:14px;color:#00F3FF99;">This application is domain-locked to official SOVEREIGN servers.</p>' +
                '<p style="margin-top:20px;font-size:12px;color:#888;">REDIRECTING TO OFFICIAL SERVER IN 3 SECONDS...</p>' +
                '</div></body>';
            setTimeout(() => {
                window.location.href = 'https://thesovereign.vercel.app';
            }, 3000);
            return;
        }

        // ==========================================
        // 2. CSS HARDENING (Injected Dynamically)
        // ==========================================
        const securityCSS = document.createElement('style');
        securityCSS.id = 'sovereign-security-css';
        securityCSS.textContent = [
            '* { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }',
            'input, textarea, select, [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }',
            'img { -webkit-user-drag: none !important; -khtml-user-drag: none !important; -moz-user-drag: none !important; -o-user-drag: none !important; user-drag: none !important; pointer-events: none !important; }',
            'a img, button img, [onclick] img, nav img, .cursor-pointer img { pointer-events: auto !important; }',
            'body { -webkit-touch-callout: none !important; }',
        ].join('\n');

        if (document.head) {
            document.head.insertBefore(securityCSS, document.head.firstChild);
        }

        // ==========================================
        // 2.5. SYSTEM VERSION CHECK (Aggressive Cache Enforcement)
        // ==========================================
        const CURRENT_VERSION = 'v2.0.0-tier3'; // Must match the updating page
        // Do not redirect if already on the updating page
        if (window.location.pathname.indexOf('/updating') === -1) {
            try {
                const localVersion = localStorage.getItem('sovereign_version');
                if (localVersion !== CURRENT_VERSION) {
                    window.location.replace('/en/updating'); // Route to localized updating page
                }
            } catch(e) { /* ignore localStorage access errors */ }
        }

        // ==========================================
        // 3. ANTI RIGHT-CLICK & TOUCH HOLD
        // ==========================================
        const blockContextMenu = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        document.addEventListener('contextmenu', blockContextMenu, true);

        let touchTimer: ReturnType<typeof setTimeout> | null = null;
        const handleTouchStart = (e: TouchEvent) => {
            touchTimer = setTimeout(() => {
                e.preventDefault();
            }, 500);
        };
        const handleTouchEnd = () => {
            if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
        };
        document.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchend', handleTouchEnd, false);
        document.addEventListener('touchmove', handleTouchEnd, false);

        // ==========================================
        // 4. ANTI-KEYBOARD SHORTCUTS (DevTools Blocker)
        // ==========================================
        const blockKeys = (e: KeyboardEvent) => {
            // F12
            if (e.key === 'F12' || e.keyCode === 123) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            // Ctrl+Shift+I/J/C
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            // Ctrl+U/S/P
            if (e.ctrlKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            // Mac: Cmd+Alt+I/J/C
            if (e.metaKey && e.altKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            // Mac: Cmd+U/S/P
            if (e.metaKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
            // Ctrl+Shift+C (Element Picker)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
                e.preventDefault(); e.stopPropagation(); return false;
            }
        };
        document.addEventListener('keydown', blockKeys, true);

        // ==========================================
        // 5. ANTI-DRAG AND DROP
        // ==========================================
        const blockDrag = (e: Event) => { e.preventDefault(); return false; };
        const blockCopyCut = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                return;
            }
            e.preventDefault();
        };
        document.addEventListener('dragstart', blockDrag, true);
        document.addEventListener('drop', blockDrag, true);
        document.addEventListener('copy', blockCopyCut, true);
        document.addEventListener('cut', blockCopyCut, true);

        // ==========================================
        // 6. AGGRESSIVE DEBUGGER TRAP
        // ==========================================
        const dbgInterval = setInterval(() => {
            const before = new Date().getTime();
            // eslint-disable-next-line no-debugger
            debugger;
            const after = new Date().getTime();
            if (after - before > 100) {
                if (document.body) document.body.innerHTML = '';
                document.documentElement.innerHTML = '';
                try { window.location.replace('about:blank'); } catch (e) { /* noop */ }
                clearInterval(dbgInterval);
            }
        }, 500);

        // ==========================================
        // 7. DEVTOOLS DETECTION (Window Size Heuristic)
        // ==========================================
        const devToolsCheck = setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > 350;
            const heightThreshold = window.outerHeight - window.innerHeight > 350;
            if (widthThreshold || heightThreshold) {
                if (document.body) document.body.innerHTML = '';
                clearInterval(devToolsCheck);
                clearInterval(dbgInterval);
                try { window.location.replace('about:blank'); } catch (e) { /* noop */ }
            }
        }, 1000);

        // ==========================================
        // 8. ANTI-IFRAME EMBEDDING (Clickjacking)
        // ==========================================
        if (window.self !== window.top) {
            document.documentElement.innerHTML = '';
            try { window.top!.location.href = window.self.location.href; } catch (e) { /* same-origin */ }
        }

        // ==========================================
        // 9. CONSOLE WARNING
        // ==========================================
        if (typeof console !== 'undefined') {
            const warningCSS = 'color: #00F3FF; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;';
            const detailCSS = 'color: #00F3FF99; font-size: 14px;';
            try {
                console.log('%c⛔ STOP!', warningCSS);
                console.log('%cThis is a browser feature intended for developers.', detailCSS);
                console.log('%cIf someone told you to copy-paste something here, it is a scam.', detailCSS);
                console.log('%cTHE SOVEREIGN™ Security Suite is monitoring this console.', detailCSS);
            } catch (e) { /* noop */ }
        }

        // ==========================================
        // 10. MUTATION OBSERVER (Anti-Tampering)
        // ==========================================
        let observer: MutationObserver | null = null;
        if (typeof MutationObserver !== 'undefined' && document.head) {
            observer = new MutationObserver(() => {
                if (!document.getElementById('sovereign-security-css')) {
                    if (document.head) {
                        document.head.insertBefore(securityCSS.cloneNode(true), document.head.firstChild);
                    }
                }
            });
            observer.observe(document.head, { childList: true });
        }

        // Cleanup on unmount (shouldn't happen for root layout, but good practice)
        return () => {
            clearInterval(dbgInterval);
            clearInterval(devToolsCheck);
            document.removeEventListener('contextmenu', blockContextMenu, true);
            document.removeEventListener('keydown', blockKeys, true);
            document.removeEventListener('dragstart', blockDrag, true);
            document.removeEventListener('drop', blockDrag, true);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd, false);
            document.removeEventListener('touchmove', handleTouchEnd, false);
            if (observer) observer.disconnect();
            const cssEl = document.getElementById('sovereign-security-css');
            if (cssEl) cssEl.remove();
        };
    }, []);

    return null; // This component renders nothing — it's pure side-effects
}
