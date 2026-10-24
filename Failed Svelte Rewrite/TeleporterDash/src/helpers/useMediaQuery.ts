/*
Svelte adaptation of useMediaQuery from https://github.com/juliencrn/usehooks-ts
Original MIT License - see React version for full license text
*/

import { readable } from 'svelte/store';

/**
 * Creates a readable store that tracks a CSS media query
 * @param {string} query - The media query string (e.g., '(min-width: 768px)')
 * @param {Object} options - Configuration options
 * @param {boolean} options.defaultValue - Default value when not in browser (default: false)
 * @param {boolean} options.initializeWithValue - Whether to initialize with actual value (default: true)
 * @returns {import('svelte/store').Readable<boolean>} A readable store with the media query match status
 */
export function mediaQuery(query: string, { defaultValue = false, initializeWithValue = true } = {}) {
  return readable(defaultValue, (set) => {
    // If not in browser environment, return the default value
    if (typeof window === 'undefined') {
      return;
    }

    const getMatches = (query: string) => {
      try {
        return window.matchMedia(query).matches;
      } catch (error) {
        console.warn('Invalid media query:', query);
        return defaultValue;
      }
    };

    // Initialize with current value if requested
    if (initializeWithValue) {
      set(getMatches(query));
    }

    let mediaQueryList;
    
    try {
      mediaQueryList = window.matchMedia(query);
    } catch (error) {
      console.warn('Invalid media query:', query);
      return;
    }

    const handleChange = (event: { matches: boolean; }) => {
      set(event.matches);
    };

    // Set initial value (in case initializeWithValue was false)
    set(mediaQueryList.matches);

    // Add event listener with fallback for older browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
    } else if (mediaQueryList.addListener) {
      // Fallback for Safari < 14
      mediaQueryList.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleChange);
      } else if (mediaQueryList.removeListener) {
        // Fallback for Safari < 14
        mediaQueryList.removeListener(handleChange);
      }
    };
  });
}

// Convenience functions for common breakpoints
export const isDesktop = mediaQuery('(min-width: 1024px)');
export const isTablet = mediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const isMobile = mediaQuery('(max-width: 767px)');
export const isSmallScreen = mediaQuery('(max-width: 640px)');
export const isDarkMode = mediaQuery('(prefers-color-scheme: dark)');
export const isPrefersReducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
export const isLandscape = mediaQuery('(orientation: landscape)');
export const isPortrait = mediaQuery('(orientation: portrait)');

// Touch device detection
export const isTouchDevice = mediaQuery('(pointer: coarse)');
export const canHover = mediaQuery('(hover: hover)');

// High DPI detection
export const isHighDPI = mediaQuery('(min-resolution: 2dppx)');

// Print media
export const isPrintMode = mediaQuery('print');