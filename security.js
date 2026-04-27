/**
 * ======================================================
 * NEYDRA™ FULL SECURITY SHIELD v2.0
 * Multi-layered aggressive front-end protection suite.
 * Deployed across ALL pages via single injection point.
 * ======================================================
 * 
 * Layers:
 *  1. Domain Anti-Cloning Lock
 *  2. Anti Right-Click & Touch Hold
 *  3. Anti-Keyboard Shortcuts (DevTools Blocker)
 *  4. Anti-Drag and Drop (image theft prevention)
 *  5. Aggressive Debugger Trap
 *  6. CSS Hardening (injected dynamically)
 *  7. Source Code Obfuscation Layer
 */
(function () {
    'use strict';

    // ==========================================
    // 1. DOMAIN ANTI-CLONING LOCK
    // ==========================================
    // ONLY these domains are authorized to run Neydra.
    // file:/// (empty hostname) will be blocked immediately.
    var allowedDomains = [
        'neydra.vercel.app',
        'n-s-c.vercel.app',
        'www.neydra.com',
        'neydra.com',
        'localhost',
        '127.0.0.1'
    ];

    var currentHost = window.location.hostname;

    if (!currentHost || allowedDomains.indexOf(currentHost) === -1) {
        // Nuke the page instantly
        document.documentElement.innerHTML = '<body style="background:#000;color:#f00;display:flex;justify-content:center;align-items:center;height:100vh;font-family:monospace;font-size:20px;text-align:center;flex-direction:column;"><div style="border:2px solid #f00;padding:40px;max-width:600px;"><h1 style="font-size:32px;margin-bottom:20px;letter-spacing:5px;">⛔ SECURITY ERROR</h1><p>UNAUTHORIZED DOMAIN / LOCAL FILE TAMPERING DETECTED.</p><p style="margin-top:15px;font-size:14px;color:#ff6666;">This application is domain-locked to official NEYDRA servers.</p><p style="margin-top:20px;font-size:12px;color:#888;">REDIRECTING TO OFFICIAL SERVER IN 3 SECONDS...</p></div></body>';
        setTimeout(function () {
            window.location.href = 'https://neydra.vercel.app';
        }, 3000);
        return; // Stop ALL further execution
    }

    // ==========================================
    // 1.5 SYSTEM VERSION CHECK (Aggressive Cache Enforcement)
    // ==========================================
    var CURRENT_VERSION = 'v2.0.0-tier3';
    // Do not redirect if already on the updating page
    if (window.location.pathname.indexOf('/welcome/updating') === -1) {
        try {
            var localVersion = localStorage.getItem('neydra_version');
            if (localVersion !== CURRENT_VERSION) {
                window.location.replace('/welcome/updating/');
            }
        } catch(e) {}
    }

    // ==========================================
    // 2. CSS HARDENING (Injected Dynamically)
    // ==========================================
    // This ensures the CSS layer is ALWAYS present regardless of stylesheet loading.
    var securityCSS = document.createElement('style');
    securityCSS.id = 'neydra-security-css';
    securityCSS.textContent = [
        // Block text selection globally
        '* { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }',
        // Allow text selection in form inputs (usability)
        'input, textarea, select, [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }',
        // Block image dragging universally
        'img { -webkit-user-drag: none !important; -khtml-user-drag: none !important; -moz-user-drag: none !important; -o-user-drag: none !important; user-drag: none !important; pointer-events: none !important; }',
        // Allow pointer events on images inside buttons and links (navigation must work)
        'a img, button img, [onclick] img, .ready-continue-btn img, .bottom-nav img, .service-btn img, #soundBtn img, .product-card img, .mystery-item img, .featured-character img, .character-img, nav img { pointer-events: auto !important; }',
        // Block iframe embedding of the site
        'body { -webkit-touch-callout: none !important; }'
    ].join('\n');
    // Insert at the very top so it takes priority
    if (document.head) {
        document.head.insertBefore(securityCSS, document.head.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.head.insertBefore(securityCSS, document.head.firstChild);
        });
    }

    // ==========================================
    // 3. ANTI RIGHT-CLICK & TOUCH HOLD
    // ==========================================
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }, true);

    // Block long-press on mobile (touch hold to save image)
    var touchTimer = null;
    document.addEventListener('touchstart', function (e) {
        touchTimer = setTimeout(function () {
            // If held for 500ms+, it's a long-press attempt
            e.preventDefault();
        }, 500);
    }, { passive: false });

    document.addEventListener('touchend', function () {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }, false);

    document.addEventListener('touchmove', function () {
        if (touchTimer) {
            clearTimeout(touchTimer);
            touchTimer = null;
        }
    }, false);

    // ==========================================
    // 4. ANTI-KEYBOARD SHORTCUTS (DevTools Blocker)
    // ==========================================
    // Blocks: F12, Ctrl+U (View Source), Ctrl+S (Save Page), 
    // Ctrl+P (Print), Ctrl+Shift+I/J/C (Inspectors)
    // Also blocks Mac equivalents (Cmd+)
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+I/J/C (DevTools Inspectors)
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print)
        if (e.ctrlKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Mac: Cmd+Alt+I/J/C
        if (e.metaKey && e.altKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Mac: Cmd+U/S/P
        if (e.metaKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+C (Element Picker specific)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // ==========================================
    // 5. ANTI-DRAG AND DROP
    // ==========================================
    document.addEventListener('dragstart', function (e) {
        e.preventDefault();
        return false;
    }, true);

    document.addEventListener('drop', function (e) {
        e.preventDefault();
        return false;
    }, true);

    // Prevent selecting and copying text
    document.addEventListener('copy', function (e) {
        // Allow copy in input fields
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            return true;
        }
        e.preventDefault();
        return false;
    }, true);

    document.addEventListener('cut', function (e) {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            return true;
        }
        e.preventDefault();
        return false;
    }, true);

    // ==========================================
    // 6. AGGRESSIVE DEBUGGER TRAP
    // ==========================================
    // If DevTools are forced open, this infinite loop will freeze the browser
    // and then nuke the DOM if it detects the breakpoint pause.
    var _dbgInterval = setInterval(function () {
        var before = new Date().getTime();
        debugger; // Triggers DevTools breakpoint
        var after = new Date().getTime();

        // If execution was paused > 100ms, DevTools is open
        if (after - before > 100) {
            // Nuke the body
            if (document.body) {
                document.body.innerHTML = '';
            }
            document.documentElement.innerHTML = '';
            // Force exit
            try {
                window.location.replace('about:blank');
            } catch (e) { }
            clearInterval(_dbgInterval);
        }
    }, 500);

    // ==========================================
    // 7. DEVTOOLS DETECTION (Window Size Heuristic)
    // ==========================================
    // Additional layer: detect DevTools by checking window size discrepancy
    var _devToolsCheck = setInterval(function () {
        var widthThreshold = window.outerWidth - window.innerWidth > 350;
        var heightThreshold = window.outerHeight - window.innerHeight > 350;

        if (widthThreshold || heightThreshold) {
            // DevTools likely open (docked mode)
            if (document.body) {
                document.body.innerHTML = '';
            }
            clearInterval(_devToolsCheck);
            clearInterval(_dbgInterval);
            try {
                window.location.replace('about:blank');
            } catch (e) { }
        }
    }, 1000);

    // ==========================================
    // 8. ANTI-IFRAME EMBEDDING (Clickjacking Protection)
    // ==========================================
    if (window.self !== window.top) {
        // Site is being loaded in an iframe - kill it
        document.documentElement.innerHTML = '';
        try {
            window.top.location = window.self.location;
        } catch (e) {
            // Same-origin policy prevents us from redirecting the parent.
            // Just blank out.
        }
    }

    // ==========================================
    // 9. CONSOLE WARNING
    // ==========================================
    // Scare off casual snoops with a red warning in the console
    if (typeof console !== 'undefined') {
        var warningCSS = 'color: red; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px black;';
        var detailCSS = 'color: #ff6666; font-size: 14px;';
        try {
            console.log('%c⛔ STOP!', warningCSS);
            console.log('%cThis is a browser feature intended for developers.', detailCSS);
            console.log('%cIf someone told you to copy-paste something here, it is a scam.', detailCSS);
            console.log('%cNEYDRA™ Security Suite is monitoring this console.', detailCSS);
        } catch (e) { }
    }

    // ==========================================
    // 10. MUTATION OBSERVER (Anti-Tampering)
    // ==========================================
    // Watch for external script injections or security CSS removal
    if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                // If security CSS was removed, re-inject it
                if (!document.getElementById('neydra-security-css')) {
                    if (document.head) {
                        document.head.insertBefore(securityCSS.cloneNode(true), document.head.firstChild);
                    }
                }
            });
        });

        if (document.head) {
            observer.observe(document.head, { childList: true });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                observer.observe(document.head, { childList: true });
            });
        }
    }

})();
