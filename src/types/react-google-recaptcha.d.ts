declare module 'react-google-recaptcha' {
    import React from 'react';

    interface ReCAPTCHAProps {
        sitekey: string;
        onChange?: (value: string | null) => void;
        onExpired?: () => void;
        onErrored?: () => void;
        ref?: React.RefObject<any>;
        theme?: 'light' | 'dark';
        size?: 'normal' | 'compact' | 'invisible';
        tabindex?: number;
        onload?: () => void;
        grecaptcha?: any;
        badge?: 'bottomright' | 'bottomleft' | 'inline';
        isolated?: boolean;
    }

    const ReCAPTCHA: React.ForwardRefExoticComponent<ReCAPTCHAProps & React.RefAttributes<any>>;
    export default ReCAPTCHA;
} 