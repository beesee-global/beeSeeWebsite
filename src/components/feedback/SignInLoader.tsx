import React from 'react';

interface SignInLoaderProps {
  loading?: boolean;
}

const SignInLoader: React.FC<SignInLoaderProps> = ({ loading = false }) => {
  if (!loading) return null;

  return (
    <div className="sign-in-loading-overlay" role="status" aria-live="polite" aria-label="Signing in">
      <div className="sign-in-loading-content">
        <span className="sign-in-loading-spinner" aria-hidden="true" />
        <span>Signing in...</span>
      </div>
    </div>
  );
};

export default SignInLoader;
