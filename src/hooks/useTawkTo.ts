import { useEffect } from 'react';

export const useTawkTo = () => {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="tawk.to"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/69648de3e25f8b197c213764/1jeockgbj';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

    // Initialize Tawk API
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();
  }, []);
};