'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * ======================================================
 * THE SOVEREIGN™ FULL SECURITY SHIELD v2.1
 * Adapted from NEYDRA™ Security Suite.
 * Multi-layered aggressive front-end protection.
 * Injected via root layout — applies to ALL pages.
 * ======================================================
 */
export function SovereignSecurity() {
    const [isBypassed, setIsBypassed] = useState(false);
    const typedKeys = useRef<string>('');

    // VIP Bypass Detector ("assolti")
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            typedKeys.current = (typedKeys.current + e.key.toLowerCase()).slice(-7);
            if (typedKeys.current === 'assolti') {
                setIsBypassed(prev => !prev);
                typedKeys.current = '';
                console.log(isBypassed ? '🛡️ SECURITY_RESTORED' : '🔓 VIP_BYPASS_ACTIVE');
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isBypassed]);

    useEffect(() => {
        if (isBypassed) {
            // Clean up CSS if it exists
            const cssEl = document.getElementById('sovereign-security-css');
            if (cssEl) cssEl.remove();
            return;
        }

        // ==========================================
        // 1. DOMAIN ANTI-CLONING LOCK
        // ==========================================
        const allowedDomains = [
            'thesovereign.vercel.app',
            'www.thesovereign.com',
            'thesovereign.com',
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
                '</div></body>';
            setTimeout(() => { window.location.href = 'https://thesovereign.vercel.app'; }, 3000);
            return;
        }

        // ==========================================
        // 2. CSS HARDENING
        // ==========================================
        const securityCSS = document.createElement('style');
        securityCSS.id = 'sovereign-security-css';
        securityCSS.textContent = [
            '* { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }',
            'input, textarea, select, [contenteditable="true"] { -webkit-user-select: text !important; user-select: text !important; }',
            'img { -webkit-user-drag: none !important; user-drag: none !important; pointer-events: none !important; }',
            'body { -webkit-touch-callout: none !important; }',
        ].join('\n');
        if (document.head) document.head.insertBefore(securityCSS, document.head.firstChild);

        // ==========================================
        // 3. EVENT BLOCKERS
        // ==========================================
        const blockContextMenu = (e: Event) => { e.preventDefault(); e.stopPropagation(); return false; };
        const blockKeys = (e: KeyboardEvent) => {
            if (e.key === 'F12' || e.keyCode === 123) { e.preventDefault(); e.stopPropagation(); return false; }
            if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) { e.preventDefault(); e.stopPropagation(); return false; }
            if (e.ctrlKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) { e.preventDefault(); e.stopPropagation(); return false; }
            if (e.metaKey && e.altKey && ['I', 'J', 'C'].indexOf(e.key.toUpperCase()) !== -1) { e.preventDefault(); e.stopPropagation(); return false; }
            if (e.metaKey && ['U', 'S', 'P'].indexOf(e.key.toUpperCase()) !== -1) { e.preventDefault(); e.stopPropagation(); return false; }
        };
        const blockDrag = (e: Event) => { e.preventDefault(); return false; };
        
        document.addEventListener('contextmenu', blockContextMenu, true);
        document.addEventListener('keydown', blockKeys, true);
        document.addEventListener('dragstart', blockDrag, true);
        document.addEventListener('drop', blockDrag, true);

        // ==========================================
        // 4. DEBUGGER & DEVTOOLS DETECTION
        // ==========================================
        const dbgInterval = setInterval(() => {
            const before = Date.now();
            // eslint-disable-next-line no-debugger
            debugger;
            if (Date.now() - before > 100) {
                document.documentElement.innerHTML = '';
                window.location.replace('about:blank');
            }
        }, 500);

        const devToolsCheck = setInterval(() => {
            if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
                document.documentElement.innerHTML = '';
                window.location.replace('about:blank');
            }
        }, 1000);

        // ==========================================
        // 5. MUTATION OBSERVER
        // ==========================================
        let observer: MutationObserver | null = null;
        if (typeof MutationObserver !== 'undefined' && document.head) {
            observer = new MutationObserver(() => {
                if (!document.getElementById('sovereign-security-css')) {
                    document.head.insertBefore(securityCSS.cloneNode(true), document.head.firstChild);
                }
            });
            observer.observe(document.head, { childList: true });
        }

        return () => {
            clearInterval(dbgInterval);
            clearInterval(devToolsCheck);
            document.removeEventListener('contextmenu', blockContextMenu, true);
            document.removeEventListener('keydown', blockKeys, true);
            document.removeEventListener('dragstart', blockDrag, true);
            document.removeEventListener('drop', blockDrag, true);
            if (observer) observer.disconnect();
            const cssEl = document.getElementById('sovereign-security-css');
            if (cssEl) cssEl.remove();
        };
    }, [isBypassed]);

    return null;
}

