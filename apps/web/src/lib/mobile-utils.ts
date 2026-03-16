/**
 * Mobile Utilities
 * Device detection and mobile-specific optimizations
 */

export function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

export function isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
    );
}

export function getViewportSize() {
    if (typeof window === 'undefined') {
        return { width: 0, height: 0 };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export function isSmallScreen(): boolean {
    const { width } = getViewportSize();
    return width < 768;
}

export function isMediumScreen(): boolean {
    const { width } = getViewportSize();
    return width >= 768 && width < 1024;
}

export function isLargeScreen(): boolean {
    const { width } = getViewportSize();
    return width >= 1024;
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Prevent scroll on mobile when modal is open
 */
export function lockScroll(): void {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

export function unlockScroll(): void {
    if (typeof document === 'undefined') return;

    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

/**
 * Safe area insets for notched devices
 */
export function getSafeAreaInsets() {
    if (typeof window === 'undefined') {
        return { top: 0, right: 0, bottom: 0, left: 0 };
    }

    const style = getComputedStyle(document.documentElement);

    return {
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    };
}

/**
 * Haptic feedback for mobile (if supported)
 */
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (typeof window === 'undefined' || !(navigator as any).vibrate) return;

    const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
    };

    (navigator as any).vibrate(patterns[type]);
}

/**
 * Optimize images for mobile
 */
export function getOptimizedImageSize(originalWidth: number): number {
    const { width } = getViewportSize();
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    // Return appropriate image size based on viewport
    if (width < 768) {
        return Math.min(originalWidth, width * dpr);
    } else if (width < 1024) {
        return Math.min(originalWidth, (width / 2) * dpr);
    } else {
        return Math.min(originalWidth, (width / 3) * dpr);
    }
}
